
import React, { useState } from 'react';
import { Shield, Award, Leaf, Zap, Globe, Star, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Language, translations } from '../services/i18n';
import { LINER_SERVICE_LINES } from '../services/carbon';

const NetworkManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [preferred, setPreferred] = useState<string[]>([]);
  const togglePreferred = (name: string) =>
    setPreferred(p => (p.includes(name) ? p.filter(n => n !== name) : [...p, name]));
  const carriers = [
    {
      name: "Global Maritime Group",
      esg: 94,
      fleet: "Green LNG",
      reliability: "92.4%",
      delta: "+1.8%",
      history: [
        { m: 'May', pct: 89.2 }, { m: 'Jun', pct: 90.0 }, { m: 'Jul', pct: 90.8 },
        { m: 'Aug', pct: 91.5 }, { m: 'Sep', pct: 92.0 }, { m: 'Oct', pct: 92.4 }
      ],
      badge: "Eco-Leader"
    },
    {
      name: "Atlas Air Freight",
      esg: 78,
      fleet: "Modern Bio-Jet",
      reliability: "98.5%",
      delta: "+0.4%",
      history: [
        { m: 'May', pct: 97.6 }, { m: 'Jun', pct: 97.9 }, { m: 'Jul', pct: 98.1 },
        { m: 'Aug', pct: 98.0 }, { m: 'Sep', pct: 98.3 }, { m: 'Oct', pct: 98.5 }
      ],
      badge: "Reliable"
    },
    {
      name: "Direct Rail Logistics",
      esg: 98,
      fleet: "Electric 100%",
      reliability: "94.6%",
      delta: "+2.1%",
      history: [
        { m: 'May', pct: 91.2 }, { m: 'Jun', pct: 92.0 }, { m: 'Jul', pct: 92.8 },
        { m: 'Aug', pct: 93.4 }, { m: 'Sep', pct: 94.1 }, { m: 'Oct', pct: 94.6 }
      ],
      badge: "Net-Zero"
    },
    {
      name: "Prime Trucking Co.",
      esg: 62,
      fleet: "Diesel Euro 6",
      reliability: "96.2%",
      delta: "+0.7%",
      history: [
        { m: 'May', pct: 94.9 }, { m: 'Jun', pct: 95.3 }, { m: 'Jul', pct: 95.6 },
        { m: 'Aug', pct: 95.8 }, { m: 'Sep', pct: 96.0 }, { m: 'Oct', pct: 96.2 }
      ],
      badge: "Strategic"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.netTitle}</h1>
          <p className="text-slate-500 font-medium">{t.netSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {carriers.map((c, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
             <div className="flex justify-between mb-6">
                <div className={`p-3 rounded-2xl ${c.esg > 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                   <Shield size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ESG Score</span>
                  <span className={`text-xl font-black ${c.esg > 90 ? 'text-emerald-600' : 'text-slate-900'}`}>{c.esg}%</span>
                </div>
             </div>
             
             <h3 className="text-lg font-black text-slate-900 mb-2">{c.name}</h3>
             <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validated Certs: ISO 14001</span>
             </div>

             <div className="space-y-3 pt-5 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">Fleet Efficiency</span>
                   <span className="text-slate-700">{c.fleet}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">{t.scheduleReliability} (6M)</span>
                   <span className="text-slate-900 font-mono tabular-nums">
                     {c.reliability} <span className="text-emerald-600">({c.delta})</span>
                   </span>
                </div>
                <div className="h-12 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={c.history}>
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, t.scheduleReliability]}
                        labelFormatter={(label: any) => `${label}`}
                        contentStyle={{ borderRadius: '10px', fontSize: '11px', padding: '4px 8px' }}
                      />
                      <Line type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <button
                onClick={() => togglePreferred(c.name)}
                className={`w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  preferred.includes(c.name) ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-900 text-white hover:bg-black'
                }`}
             >
                {preferred.includes(c.name) ? <>{t.preferredCarrierSet} <CheckCircle2 size={14} /></> : <>{t.preferredCarrier} <ArrowUpRight size={14} /></>}
             </button>
          </div>
        ))}
      </div>

      {/* Published Emissions & Fixed Schedules per Liner Line */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.publishedLineEmissionsTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.publishedLineEmissionsDesc}</p>
        </div>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                <th className="py-3 px-4">{t.linerLineCol}</th>
                <th className="py-3 px-4">{t.sailingScheduleCol}</th>
                <th className="py-3 px-4">{t.etaWindowCol}</th>
                <th className="py-3 px-4 text-right">{t.publishedIntensityCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LINER_SERVICE_LINES.map((line) => (
                <tr key={line.lineCode} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900">
                      <span className="font-mono text-blue-700">{line.lineCode}</span> · {line.lineName}
                    </p>
                    <p className="text-[11px] text-slate-500">{line.carrier} · {line.corridorLabel} · {line.fuelBlend}</p>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <p className="font-bold text-slate-800">{line.departureWindowUtc}</p>
                    <p className="text-[11px] font-sans text-slate-500">{line.frequency} · {t.cutoffLabel}: {line.cutoffWindowUtc}</p>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <p className="font-bold text-teal-700">{line.predictableEtaWindow}</p>
                    <p className="text-[11px] text-slate-500">{line.scheduleReliabilityPct.toFixed(1)}% OTIF</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
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

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
               <h2 className="text-3xl font-black mb-4">Network Compliance Summary</h2>
               <p className="text-slate-400 leading-relaxed mb-8">Connect your carrier data to see decarbonization target coverage across your network. Carrier sustainability data is sourced from self-reported disclosures.</p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Carriers</p>
                     <p className="text-2xl font-black">42</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs text-slate-500 font-bold uppercase mb-1">Vetted ESG</p>
                     <p className="text-2xl font-black text-emerald-400">38</p>
                  </div>
               </div>
            </div>
            <div className="flex items-center justify-center">
               <div className="w-64 h-64 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-4xl font-black text-emerald-400 tracking-tight">88.5</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network ESG Avg</p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full border-[12px] border-emerald-500 border-t-transparent border-l-transparent rounded-full animate-spin duration-[3s]"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NetworkManager;
