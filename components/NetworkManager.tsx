
import React from 'react';
import { Shield, Award, Leaf, Zap, Globe, Star, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const NetworkManager: React.FC = () => {
  const carriers = [
    { name: "Global Maritime Group", esg: 94, fleet: "Green LNG", reliability: "99.2%", badge: "Eco-Leader" },
    { name: "Atlas Air Freight", esg: 78, fleet: "Modern Bio-Jet", reliability: "98.5%", badge: "Reliable" },
    { name: "Direct Rail Logistics", esg: 98, fleet: "Electric 100%", reliability: "94.0%", badge: "Net-Zero" },
    { name: "Prime Trucking Co.", esg: 62, fleet: "Diesel Euro 6", reliability: "97.8%", badge: "Strategic" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Supplier Intelligence</h1>
          <p className="text-slate-500 font-medium">Item 3: ESG Scorecard & Network Leaderboard</p>
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

             <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">Fleet Efficiency</span>
                   <span className="text-slate-700">{c.fleet}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">Reliability</span>
                   <span className="text-slate-700">{c.reliability}</span>
                </div>
             </div>

             <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                Preferred Carrier <ArrowUpRight size={14} />
             </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
               <h2 className="text-3xl font-black mb-4">Network Compliance Summary</h2>
               <p className="text-slate-400 leading-relaxed mb-8">92% of your global carriers have active decarbonization targets. Your current strategy is aligned with the Science Based Targets initiative (SBTi).</p>
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
