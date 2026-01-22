
import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Globe, Wind, Trees, Sparkles, TrendingDown, ArrowRight, ShieldCheck, Loader2, CheckCircle, Download, X, Award, FileText, Scale, Landmark } from 'lucide-react';
import { Shipment, Recommendation, TransportMode } from '../types';
import { getSustainabilityInsights } from '../services/gemini';
import { getOffsetPrice } from '../services/carbon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Language, translations } from '../services/i18n';

interface SustainabilityHubProps { shipments: Shipment[]; lang: Language; }

const SustainabilityHub: React.FC<SustainabilityHubProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isNeutralized, setIsNeutralized] = useState(false);

  const totalEmissionsKg = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const offsetCost = getOffsetPrice(totalEmissionsKg);

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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sustainability Intelligence</h1>
          <p className="text-slate-500 font-medium">Item 4: CBAM Compliance & Carbon Finance</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="bg-emerald-500 p-2 rounded-xl text-white glow-emerald"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESG Score</p>
            <p className="text-sm font-extrabold text-emerald-700">84 / 100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SustainabilityMetric title="Trees to Plant" value={isNeutralized ? "0" : "1,240"} sub="Neutralization Goal" icon={<Trees className="text-emerald-500" />} />
            <SustainabilityMetric title="Carbon Intensity" value="0.42" sub="kg CO2 / Tonne-Km" icon={<Zap className="text-amber-500" />} />
            <SustainabilityMetric title="Avoided Emissions" value="4.2t" sub="vs Industry Average" icon={<Wind className="text-blue-500" />} />
          </div>

          {/* Item 4: Regulatory Panel */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-blue-600 p-3 rounded-2xl text-white"><Landmark size={22} /></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Engine</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CBAM & EU Emissions Trading System (ETS)</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black text-slate-800">EU CBAM Tax Forecast</p>
                       <p className="text-[10px] text-slate-400 font-medium">Current quarter exposure</p>
                    </div>
                    <p className="text-xl font-black text-blue-600">${(totalEmissionsKg * 0.08).toFixed(2)}</p>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black text-slate-800">SBTi Alignment</p>
                       <p className="text-[10px] text-slate-400 font-medium">Progress towards target</p>
                    </div>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-3/4"></div>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> Export CSRD / CBAM Report
                 </button>
              </div>
            </div>

            <div className="h-full min-h-[300px] flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Emissions by Geo-Regulatory Zone</h4>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[{n: 'EU', e: 450}, {n: 'APAC', e: 320}, {n: 'USA', e: 280}]}>
                      <XAxis dataKey="n" hide />
                      <Tooltip />
                      <Bar dataKey="e" fill="#6366f1" radius={[12, 12, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden bg-slate-900 text-white">
            <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Offset Market</h3>
            <p className="text-4xl font-extrabold tracking-tight mb-2 text-white">${offsetCost.toLocaleString()}</p>
            <p className="text-slate-400 text-xs mb-8">Neutralize footprint via Verified Carbon Standard (VCS) projects.</p>
            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all">Invest Now</button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-indigo-500" size={20} />
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Sustainability Co-Pilot</h3>
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
