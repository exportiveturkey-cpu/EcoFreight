
import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Globe, Wind, Trees, Sparkles, TrendingDown, ArrowRight, ShieldCheck, Loader2, CheckCircle, Download, X, Award, FileText, Scale, Landmark, Ship, Calculator, Gauge } from 'lucide-react';
import { Shipment, Recommendation, TransportMode, VesselType, CiiGrade } from '../types';
import { getSustainabilityInsights } from '../services/gemini';
import {
  FUEL_EU_2026_LIMIT_G_PER_MJ,
  getEffectiveVesselCompliance,
  getOffsetPrice,
  getPortfolioComplianceAccountingSummary,
  getShipmentComplianceAccounting,
  getShipmentContainers,
  getShipmentTeuKm,
  getVesselTypeSpec,
  LINER_SERVICE_LINES
} from '../services/carbon';
import { formatEUR, formatNumber, formatEmissions } from '../services/formatters';
import { toCsv } from '../services/csv';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Language, translations } from '../services/i18n';
import GlecMethodPanel from './GlecMethodPanel';
import SharedVesselKpiLayer from './SharedVesselKpiLayer';
import GreenFleetReferencePanel from './GreenFleetReferencePanel';

interface SustainabilityHubProps { shipments: Shipment[]; lang: Language; }

const SustainabilityHub: React.FC<SustainabilityHubProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isNeutralized, setIsNeutralized] = useState(false);
  const [section, setSection] = useState<'overview' | 'compliance' | 'offset' | 'advice'>('overview');
  const [complianceSlowSteamPct, setComplianceSlowSteamPct] = useState<number>(0);

  const totalEmissionsKg = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const totalTeuKm = shipments.reduce((sum, s) => sum + getShipmentTeuKm(s), 0);
  const offsetCost = getOffsetPrice(totalEmissionsKg);
  const portfolioCompliance = getPortfolioComplianceAccountingSummary(shipments);
  const fleetVesselTypes: VesselType[] = [
    'CONTAINER_DEEPSEA',
    'CONTAINER_FEEDER',
    'RORO_FERRY',
    'MULTI_PURPOSE_TRAMP',
    'HANDYSIZE_BULK',
    'COASTAL_CHARTER'
  ];

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
    const header = [
      'ID',
      'Customer',
      'Origin',
      'Destination',
      'Weight (t)',
      'Containers (TEU)',
      'TEU-km',
      'Emissions (kg CO2e)',
      'Cost (EUR)',
      'EEXI Compliant',
      'CII Grade',
      'TCE (EUR/day)',
      'CO2/Day (kg)',
      'EU ETS (EUR)',
      'FuelEU Balance (EUR)',
      'Total ESG Cost/Trip (EUR)',
      'ESG Share (%)',
      'Status'
    ];
    const rows = shipments.map(s => {
      const { compliance, accounting } = getShipmentComplianceAccounting(s);
      return [
        s.id,
        s.customerName,
        s.origin,
        s.destination,
        s.weightTonnes,
        getShipmentContainers(s),
        getShipmentTeuKm(s),
        s.totalEmissionsKg,
        s.totalCost,
        compliance ? (compliance.eexiCompliant ? 'Yes' : 'No') : 'N/A',
        compliance ? compliance.ciiGrade : 'N/A',
        accounting.tceEurPerDay,
        accounting.co2PerDayKg,
        accounting.euEtsCostEur,
        accounting.fuelEuComplianceEur,
        accounting.totalEsgCostEur,
        accounting.esgSharePct,
        s.status
      ];
    });
    const csv = toCsv([header, ...rows]);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecofreight-compliance-esg-${new Date().toISOString().slice(0, 10)}.csv`;
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
          ['overview', lang === 'el' ? 'Επισκόπηση' : lang === 'tr' ? 'Genel Bakış' : 'Overview'],
          ['compliance', lang === 'el' ? 'Συμμόρφωση & ESG' : lang === 'tr' ? 'Uyumluluk & ESG Muhasebesi' : 'Compliance & ESG Accounting'],
          ['offset', lang === 'el' ? 'Αντιστάθμιση' : lang === 'tr' ? 'Karbon Dengeleme' : 'Offsets'],
          ['advice', lang === 'el' ? 'Προτάσεις AI' : lang === 'tr' ? 'AI Önerileri' : 'AI advice'],
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

            <SharedVesselKpiLayer shipments={shipments} lang={lang} />
          </div>
          )}

          {/* Regulatory Compliance & Per-Trip ESG Accounting Panel */}
          {section === 'compliance' && (
          <div className="space-y-6">
            {/* Top Compliance & Trip ESG Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.ciiRatingLabel}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-black font-mono tabular-nums ${ciiGradeTextColor(portfolioCompliance.portfolioCiiGrade)}`}>
                    {portfolioCompliance.portfolioCiiGrade}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    Ratio {portfolioCompliance.avgCiiRatio.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {portfolioCompliance.eexiCompliantCount}/{portfolioCompliance.maritimeCount} {t.eexiCompliantLabel}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.tcePerDayLabel}</p>
                <p className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
                  {formatEUR(portfolioCompliance.avgTceEurPerDay, 0)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{t.tceBenchmarkLabel}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.co2PerTripLabel}</p>
                <p className="text-2xl font-black font-mono tabular-nums text-emerald-700 mt-1">
                  {formatEmissions(portfolioCompliance.avgCo2PerTripKg)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{shipments.length} trips evaluated</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.totalEsgCostTripLabel}</p>
                <p className="text-2xl font-black font-mono tabular-nums text-indigo-700 mt-1">
                  {formatEUR(portfolioCompliance.avgEsgCostPerTripEur, 0)}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500 mt-1">
                  Total: {formatEUR(portfolioCompliance.totalEsgCostEur, 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t.esgShareLabel}</p>
                <p className="text-2xl font-black font-mono tabular-nums text-amber-700 mt-1">
                  {portfolioCompliance.portfolioEsgSharePct.toFixed(1)}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">EU ETS + FuelEU + Offset</p>
              </div>
            </div>

            {/* Item 13: IMO EEXI & CII Rating Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0"><Ship size={20} /></div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{t.eexiCiiTrackerTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t.eexiCiiTrackerDesc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500 px-2">{t.slowSteamingCiiPreview}:</span>
                  {[0, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setComplianceSlowSteamPct(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-bold transition-colors ${
                        complianceSlowSteamPct === pct
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pct === 0 ? '0%' : `-${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                      <th className="py-2.5 px-3">{t.vehicleType} / IMO</th>
                      <th className="py-2.5 px-3 text-right">{t.eexiAttainedReqLabel}</th>
                      <th className="py-2.5 px-3 text-right">{t.eplLimitLabel}</th>
                      <th className="py-2.5 px-3 text-right">{t.ciiAttainedReqLabel}</th>
                      <th className="py-2.5 px-3 text-right">{t.ciiRatioLabel}</th>
                      <th className="py-2.5 px-3 text-center">{t.ciiRatingLabel}</th>
                      <th className="py-2.5 px-3 text-center">{t.ciiNextYearLabel}</th>
                      <th className="py-2.5 px-3 text-right">{t.fuelEuIntensityLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {fleetVesselTypes.map((vt) => {
                      const rec = getEffectiveVesselCompliance(vt, complianceSlowSteamPct);
                      const spec = getVesselTypeSpec(vt);
                      const isOverFuelEu = rec.fuelEuIntensityGPerMj > FUEL_EU_2026_LIMIT_G_PER_MJ;
                      return (
                        <tr key={vt} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-sans">
                            <p className="font-bold text-slate-900">{rec.vesselName} <span className="font-mono text-slate-500 text-[11px]">({rec.imoNumber})</span></p>
                            <p className="text-[11px] text-slate-500">{t[spec.labelKey]} · {formatNumber(rec.dwt)} DWT</p>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-bold text-slate-900">{rec.attainedEexi.toFixed(1)}</span>
                            <span className="text-slate-400"> / {rec.requiredEexi.toFixed(1)}</span>
                            <p className="text-[10px] text-emerald-700 font-semibold">-{rec.eexiMarginPct.toFixed(1)}% ({t.eexiCompliantLabel})</p>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            {rec.eplPowerLimitPct > 0 ? `EPL -${rec.eplPowerLimitPct}%` : 'Full MCR'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-bold text-slate-900">{rec.attainedCii.toFixed(2)}</span>
                            <span className="text-slate-400"> / {rec.requiredCii.toFixed(1)}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {rec.ciiRatio.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block w-7 py-0.5 rounded-md border font-black text-xs ${ciiGradeBadgeClass(rec.ciiGrade)}`}>
                              {rec.ciiGrade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block w-7 py-0.5 rounded-md border font-bold text-xs ${ciiGradeBadgeClass(rec.ciiProjectedNextYear)}`}>
                              {rec.ciiProjectedNextYear}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-bold ${isOverFuelEu ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {rec.fuelEuIntensityGPerMj.toFixed(1)} g/MJ
                            </span>
                            <p className="text-[10px] font-sans text-slate-500">
                              {isOverFuelEu ? `>${FUEL_EU_2026_LIMIT_G_PER_MJ} limit` : 'Surplus pool'}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Items 14 & 15: Per-Trip TCE, CO2 & ESG Cost Accounting Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calculator size={17} className="text-indigo-600" />
                    <span>{t.portfolioTripLedgerTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.tceFormulaNote} · {t.esgCostAccountingDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={exportReport}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <FileText size={14} /> {t.exportReport}
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                      <th className="py-2.5 px-3">{t.consignment}</th>
                      <th className="py-2.5 px-2 text-center">{t.ciiRatingLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.tcePerDayLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.co2PerTripLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.euEtsLiabilityLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.fuelEuBalanceLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.voluntaryOffsetLabel}</th>
                      <th className="py-2.5 px-2 text-right">{t.totalEsgCostTripLabel}</th>
                      <th className="py-2.5 px-3 text-right">{t.esgAdjustedCostLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {portfolioCompliance.rows.map(({ shipment, compliance, accounting }) => (
                      <tr key={shipment.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-sans">
                          <p className="font-bold text-slate-900">
                            <span className="font-mono text-indigo-700">{shipment.id}</span> · {shipment.origin} → {shipment.destination}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {shipment.customerName} · {accounting.voyageDays}d · {shipment.linerLineCode || (shipment.seaServiceType ?? shipment.legs?.[0]?.mode)}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {compliance ? (
                            <span className={`inline-block w-6 py-0.5 rounded border font-black text-[11px] ${ciiGradeBadgeClass(compliance.ciiGrade)}`}>
                              {compliance.ciiGrade}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Inland</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className="font-bold text-slate-900">{formatEUR(accounting.tceEurPerDay, 0)}</span>
                          <p className={`text-[10px] ${accounting.tceSpreadEurPerDay >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {accounting.tceSpreadEurPerDay >= 0 ? '+' : ''}{formatEUR(accounting.tceSpreadEurPerDay, 0)}/d
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className="font-bold text-emerald-700">{formatEmissions(accounting.co2PerTripKg)}</span>
                          <p className="text-[10px] text-slate-500">{formatNumber(accounting.co2PerDayKg)} kg/d</p>
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-700">
                          {formatEUR(accounting.euEtsCostEur, 0)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className={accounting.fuelEuComplianceEur <= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {accounting.fuelEuComplianceEur > 0 ? '+' : ''}{formatEUR(accounting.fuelEuComplianceEur, 0)}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">
                          {formatEUR(accounting.voluntaryOffsetCostEur, 0)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className="font-bold text-indigo-700">{formatEUR(accounting.totalEsgCostEur, 0)}</span>
                          <p className="text-[10px] text-slate-500">{accounting.esgSharePct}%</p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                          {formatEUR(accounting.esgAdjustedCostEur, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regulatory Benchmarks & Emissions by Zone */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2.5 rounded-xl text-white"><Landmark size={20} /></div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{t.complianceEngine}</h3>
                    <p className="text-[11px] font-semibold text-slate-500">{t.complianceSub}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.cbamLabel}</p>
                      <p className="text-[11px] text-slate-500">{t.cbamSub}</p>
                    </div>
                    <p className="text-lg font-black font-mono tabular-nums text-blue-600">{formatEUR(totalEmissionsKg * 0.085, 2)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.targetProgress}</p>
                      <p className="text-[11px] text-slate-500">IMO 2026 CII (-11%) &amp; FuelEU (-2%)</p>
                    </div>
                    <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-[220px] flex flex-col justify-between">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{t.emissionsByZone}</h4>
                <div className="flex-1 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zoneData}>
                      <XAxis dataKey="zone" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(val: any) => [`${val} kg CO2e`, 'Emissions']} />
                      <Bar dataKey="emissions" fill="#6366f1" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <GreenFleetReferencePanel lang={lang} />
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

const ciiGradeBadgeClass = (grade: CiiGrade) => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'B':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'C':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'D':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'E':
      return 'bg-rose-50 text-rose-800 border-rose-200';
  }
};

const ciiGradeTextColor = (grade: CiiGrade) => {
  switch (grade) {
    case 'A':
      return 'text-emerald-700';
    case 'B':
      return 'text-teal-700';
    case 'C':
      return 'text-amber-700';
    case 'D':
      return 'text-orange-700';
    case 'E':
      return 'text-rose-700';
  }
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
