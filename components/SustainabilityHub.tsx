
import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Globe, Wind, Trees, Sparkles, TrendingDown, ArrowRight, ShieldCheck, Loader2, CheckCircle, Download, X, Award, FileText, Scale, Landmark } from 'lucide-react';
import { Shipment, Recommendation, TransportMode } from '../types';
import { getSustainabilityInsights } from '../services/gemini';
import { getOffsetPrice, getShipmentContainers, getShipmentTeuKm, LINER_SERVICE_LINES } from '../services/carbon';
import { formatEUR, formatNumber } from '../services/formatters';
import { toCsv } from '../services/csv';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Language, translations } from '../services/i18n';
import GlecMethodPanel from './GlecMethodPanel';

interface SustainabilityHubProps { shipments: Shipment[]; lang: Language; }

const SustainabilityHub: React.FC<SustainabilityHubProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isNeutralized, setIsNeutralized] = useState(false);
  const [section, setSection] = useState<'overview' | 'compliance' | 'offset' | 'advice'>('overview');

  const totalEmissionsKg = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const totalTeuKm = shipments.reduce((sum, s) => sum + getShipmentTeuKm(s), 0);
  const offsetCost = getOffsetPrice(totalEmissionsKg);

  const euEmissions = shipments
    .filter(s => s.destination.includes('GR') || s.destination.includes('DE') || s.destination.includes('NL') || s.destination.includes('IT') || s.destination.includes('BE') || s.destination.includes('PL') || s.destination.includes('DK'))
    .reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const apacEmissions = shipments
    .filter(s => s.destination.includes('SG') || s.destination.includes('CN') || s.destination.includes('JP'))
    .reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const otherEmissions = Math.max(0, totalEmissionsKg - euEmissions - apacEmissions);

  const zoneData = [
    { zone: 'EU routes', emissions: Math.round(euEmissions) },
    { zone: 'APAC Maritime', emissions: Math.round(apacEmissions) },
    { zone: 'Global Other', emissions: Math.round(otherEmissions) }
  ];

  const exportReport = () => {
    const header = ['ID', 'Customer', 'Origin', 'Destination', 'Weight (t)', 'Containers (TEU)', 'TEU-km', 'Emissions (kg CO2e)', 'Cost (EUR)', 'Status'];
    const rows = shipments.map(s => [s.id, s.customerName, s.origin, s.destination, s.weightTonnes, getShipmentContainers(s), getShipmentTeuKm(s), s.totalEmissionsKg, s.totalCost, s.status]);
    const csv = toCsv([header, ...rows]);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecofreight-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await getSustainabilityInsights(shipments);
      setRecommendations(data);
      setLoading(false);
    };
    fetchInsights();
  }, [shipments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.sustTitle}</h1>
          <p className="text-slate-500 font-medium">{t.sustSubtitle}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="bg-emerald-500 p-2 rounded-xl text-white glow-emerald"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbon Intensity</p>
            <p className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums">
              {shipments.length > 0 && totalTeuKm > 0
                ? `${(totalEmissionsKg / Math.max(1, shipments.reduce((s, x) => s + x.weightTonnes * (x.legs?.reduce((a, l) => a + l.distanceKm, 0) ?? 0), 0) || 1)).toFixed(2)} kg/t·km · ${(totalEmissionsKg / totalTeuKm).toFixed(2)} kg/TEU-km`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm flex-wrap">
        {([
          ['overview', lang === 'el' ? 'Επισκόπηση' : 'Overview'],
          ['compliance', lang === 'el' ? 'Συμμόρφωση' : 'Compliance'],
          ['offset', lang === 'el' ? 'Αντιστάθμιση' : 'Offsets'],
          ['advice', lang === 'el' ? 'Προτάσεις AI' : 'AI advice'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${section === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div className="space-y-8">
          {section === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SustainabilityMetric
                title="Trees Equivalent"
                value={isNeutralized ? "0" : (shipments.length > 0 ? String(Math.round(totalEmissionsKg / 22)) : "—")}
                sub="at 22 kg CO₂/tree/yr"
                icon={<Trees className="text-emerald-500" />}
              />
              <SustainabilityMetric
                title="Total Emissions (GLEC v3.0)"
                value={shipments.length > 0 ? `${(totalEmissionsKg / 1000).toFixed(1)} t` : "—"}
                sub={t.carbonEstimate}
                icon={<Zap className="text-amber-500" />}
              />
              <SustainabilityMetric
                title={`${t.totalTeuKm} (${t.teuKmFormula})`}
                value={totalTeuKm > 0 ? formatNumber(totalTeuKm) : "—"}
                sub={`${shipments.length} shipments tracked`}
                icon={<Wind className="text-blue-500" />}
              />
            </div>
            <GlecMethodPanel lang={lang} />
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.publishedLineEmissionsTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.publishedLineEmissionsDesc}</p>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                      <th className="py-2.5 px-3">{t.linerLineCol}</th>
                      <th className="py-2.5 px-3">{t.sailingScheduleCol}</th>
                      <th className="py-2.5 px-3">{t.etaWindowCol}</th>
                      <th className="py-2.5 px-3 text-right">{t.publishedIntensityCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {LINER_SERVICE_LINES.map((line) => (
                      <tr key={line.lineCode} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">
                            <span className="font-mono text-blue-700">{line.lineCode}</span> · {line.lineName}
                          </p>
                          <p className="text-[11px] text-slate-500">{line.carrier} · {line.corridorLabel}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <p className="font-semibold text-slate-800">{line.departureWindowUtc}</p>
                          <p className="text-[11px] font-sans text-slate-500">{line.frequency}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <p className="font-bold text-teal-700">{line.predictableEtaWindow}</p>
                          <p className="text-[11px] text-slate-500">{line.scheduleReliabilityPct.toFixed(1)}% OTIF</p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <p className="font-extrabold text-emerald-700">
                            {line.publishedEmissionGPerTeuKm.toFixed(1)} g/TEU-km · {line.publishedEmissionKgPerTkm.toFixed(3)} kg/t·km
                          </p>
                          <p className="text-[11px] font-sans text-slate-500">
                            {line.publishedVoyageKgPerTeu} kg/TEU · {line.publicationStandard} ({line.yoyIntensityDeltaPct}%)
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {/* Regulatory Panel */}
          {section === 'compliance' && (
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-blue-600 p-3 rounded-2xl text-white"><Landmark size={22} /></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{t.complianceEngine}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.complianceSub}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black text-slate-800">{t.cbamLabel}</p>
                       <p className="text-[10px] text-slate-400 font-medium">{t.cbamSub}</p>
                    </div>
                    <p className="text-xl font-black text-blue-600">{formatEUR(totalEmissionsKg * 0.08, 2)}</p>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black text-slate-800">{t.targetProgress}</p>
                       <p className="text-[10px] text-slate-400 font-medium">Set a reduction target to track progress</p>
                    </div>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-300"></div>
                    </div>
                 </div>
                 <button onClick={exportReport} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> {t.exportReport}
                 </button>
              </div>
            </div>

            <div className="h-full min-h-[300px] flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.emissionsByZone}</h4>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={zoneData}>
                      <XAxis dataKey="zone" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(val: any) => [`${val} kg CO2e`, 'Emissions']} />
                      <Bar dataKey="emissions" fill="#6366f1" radius={[12, 12, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="space-y-8">
          {section === 'offset' && (
          <div className="max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden bg-slate-900 text-white">
            <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t.offsetMarket}</h3>
            <p className="text-4xl font-extrabold tracking-tight mb-2 text-white">{formatEUR(isNeutralized ? 0 : offsetCost, 2)}</p>
            <p className="text-slate-400 text-xs mb-8">{t.offsetDesc}</p>
            <button onClick={() => setIsNeutralized(true)} disabled={isNeutralized} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-emerald-50 disabled:bg-emerald-500 disabled:text-white transition-all">{isNeutralized ? t.neutralized : t.investNow}</button>
          </div>
          )}
          {section === 'advice' && (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-indigo-500" size={20} />
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">{t.coPilot}</h3>
            </div>
            <div className="space-y-4">
              {loading ? <div className="animate-pulse h-24 bg-slate-50 rounded-2xl" /> : recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{rec.impact} Impact</p>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-2">{rec.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SustainabilityMetric = ({ title, value, sub, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="bg-slate-50 p-4 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
      <p className="text-[10px] font-medium text-slate-500">{sub}</p>
    </div>
  </div>
);

export default SustainabilityHub;
