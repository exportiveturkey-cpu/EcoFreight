
import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Globe, Wind, Trees, Sparkles, TrendingDown, ArrowRight, ShieldCheck, Loader2, CheckCircle, Download, X, Award } from 'lucide-react';
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
  const [isInvesting, setIsInvesting] = useState(false);
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

  const handleInvest = () => {
    setIsInvesting(true);
    // Simulate complex investment processing (e.g. blockchain ledger update or certificate generation)
    setTimeout(() => {
      setIsInvesting(false);
      setShowCertificate(true);
      setIsNeutralized(true);
    }, 2500);
  };

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
            <SustainabilityMetric title="Trees to Plant" value={isNeutralized ? "0" : "1,240"} sub={isNeutralized ? "Emissions neutralized" : "To offset current month"} icon={<Trees className="text-emerald-500" />} />
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
          <div className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-700 ${isNeutralized ? 'bg-emerald-600' : 'bg-slate-900'}`}>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
            <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Carbon Ledger</h3>
            <p className="text-4xl font-extrabold tracking-tight mb-2 text-white">
              {isNeutralized ? '$0.00' : `$${offsetCost.toLocaleString()}`}
            </p>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">
              {isNeutralized 
                ? "Your footprint for the current period has been fully neutralized." 
                : "Cost to neutralize footprint via Verified Carbon Standard (VCS) projects."
              }
            </p>
            {!isNeutralized ? (
              <button 
                onClick={handleInvest}
                disabled={isInvesting}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-70"
              >
                {isInvesting ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-emerald-600" />
                    Processing...
                  </>
                ) : (
                  <>
                    Invest Now <ArrowRight size={18} />
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={() => setShowCertificate(true)}
                className="w-full bg-emerald-500/30 text-white border border-white/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/40 transition-all"
              >
                View Certificate <Award size={18} />
              </button>
            )}
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

      {/* Carbon Neutrality Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowCertificate(false)}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="bg-emerald-600 p-12 text-white text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/leaves.png')] opacity-10"></div>
               <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                    <Award size={64} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Certificate of Neutrality</h2>
                    <p className="text-emerald-100 uppercase tracking-[0.3em] text-[10px] font-bold mt-2">Verified Carbon Offset Initiative</p>
                  </div>
               </div>
            </div>

            <div className="p-12 space-y-8 text-center">
               <div className="space-y-2">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">This document certifies that</p>
                  <p className="text-2xl font-black text-slate-900">EcoFreight Enterprise Client</p>
               </div>

               <div className="flex justify-center gap-12 py-6 border-y border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Offset</p>
                    <p className="text-xl font-bold text-emerald-600">{(totalEmissionsKg / 1000).toFixed(2)} Tonnes CO2e</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard</p>
                    <p className="text-xl font-bold text-slate-800">VCS-9821-XP</p>
                  </div>
               </div>

               <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                 Your investment has been allocated to the <strong>Amazon Reforestation Project</strong> and the <strong>Mediterranean Offshore Wind Farm</strong>. This session is now cryptographically signed and stored on the ledger.
               </p>

               <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCertificate(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                  <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all">
                    <Download size={18} /> Download PDF
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
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
