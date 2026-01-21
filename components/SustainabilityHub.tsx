
import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Globe, Wind, Trees, Sparkles, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { Shipment, Recommendation, TransportMode } from '../types';
import { getSustainabilityInsights } from '../services/gemini';
import { getOffsetPrice } from '../services/carbon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Language, translations } from '../services/i18n';

interface SustainabilityHubProps {
  shipments: Shipment[];
  lang: Language;
}

const SustainabilityHub: React.FC<SustainabilityHubProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

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
          <p className="text-slate-500 font-medium">Data-driven paths to Net Zero logistics</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="bg-emerald-500 p-2 rounded-xl text-white glow-emerald"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESG Score</p>
            <p className="text-sm font-extrabold text-emerald-700">84 / 100 <span className="text-xs font-medium text-emerald-500 ml-1">Top 5%</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Metrics & Chart */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SustainabilityMetric title="Trees to Plant" value="1,240" sub="To offset current month" icon={<Trees className="text-emerald-500" />} />
            <SustainabilityMetric title="Carbon Intensity" value="0.42" sub="kg CO2 / Tonne-Km" icon={<Zap className="text-amber-500" />} />
            <SustainabilityMetric title="Avoided Emissions" value="4.2t" sub="vs Industry Average" icon={<Wind className="text-blue-500" />} />
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
            <div className="relative z-10">
               <h3 className="text-xl font-extrabold text-slate-900 mb-8">Decarbonization Roadmap</h3>
               <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    {m: 'Jan', e: 120}, {m: 'Feb', e: 110}, {m: 'Mar', e: 95}, {m: 'Apr', e: 88}, {m: 'May', e: 82}, {m: 'Jun', e: 70}
                  ]}>
                    <defs>
                      <linearGradient id="colorDecarb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip cursor={false} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Area type="stepAfter" dataKey="e" stroke="#10b981" strokeWidth={4} fill="url(#colorDecarb)" />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
            <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Carbon Ledger</h3>
            <p className="text-4xl font-extrabold tracking-tight mb-2">${offsetCost.toLocaleString()}</p>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">Cost to neutralize footprint via Verified Carbon Standard (VCS) projects.</p>
            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
              Invest Now <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-indigo-500" size={20} />
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Sustainability Co-Pilot</h3>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl"></div>)}
                </div>
              ) : (
                recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-default hover:border-emerald-200 transition-colors">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{rec.impact} Impact</p>
                    <h4 className="text-sm font-extrabold text-slate-800 mb-2 group-hover:text-emerald-700">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{rec.description}</p>
                  </div>
                ))
              )}
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
