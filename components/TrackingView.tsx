
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Clock, CheckCircle2, Sparkles, ExternalLink, Loader2, Globe, LocateFixed, Zap, Radio, Shield, Ship, Plane, Truck, Train, Info, ArrowRight, BrainCircuit, Activity, RefreshCcw } from 'lucide-react';
import { Shipment, Leg, TransportMode } from '../types';
import { Language, translations } from '../services/i18n';
import { getLocationInsights, MapInsight, predictShipmentETA, ETAPrediction } from '../services/gemini';

interface TrackingViewProps {
  shipments: Shipment[];
  lang: Language;
}

const TrackingView: React.FC<TrackingViewProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);
  const [activeLegId, setActiveLegId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<MapInsight | null>(null);
  const [etaPrediction, setEtaPrediction] = useState<ETAPrediction | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingEta, setLoadingEta] = useState(false);

  useEffect(() => {
    if (selectedShipment) {
      setAiInsight(null);
      setEtaPrediction(null);
      fetchLocationInsights(selectedShipment.origin);
      fetchETAPrediction(selectedShipment);
      if (selectedShipment.legs.length > 0) {
        setActiveLegId(selectedShipment.legs[0].id);
      }
    }
  }, [selectedShipment?.id]); // Use ID as dependency to catch selection changes reliably

  const fetchLocationInsights = async (location: string) => {
    setLoadingAi(true);
    try {
      const insight = await getLocationInsights(location);
      setAiInsight(insight);
    } catch (err) {
      console.error("Gemini Insight Error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const fetchETAPrediction = async (shipment: Shipment) => {
    setLoadingEta(true);
    try {
      const prediction = await predictShipmentETA(shipment);
      setEtaPrediction(prediction);
    } catch (err) {
      console.error("ETA Prediction Error:", err);
    } finally {
      setLoadingEta(false);
    }
  };

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.SEA: return <Ship size={18} />;
      case TransportMode.AIR: return <Plane size={18} />;
      case TransportMode.ROAD: return <Truck size={18} />;
      case TransportMode.RAIL: return <Train size={18} />;
      default: return <PackageSmall />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Telemetry Hub</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Predictive Tracking & Semantic Grounding
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
           </div>
           <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Ops: Online</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            {shipments.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedShipment(s)}
                className={`w-full text-left p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden ${
                  selectedShipment?.id === s.id 
                  ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10' 
                  : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                {selectedShipment?.id === s.id && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50"></div>
                )}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    selectedShipment?.id === s.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {s.id}
                  </span>
                  <Radio size={14} className={selectedShipment?.id === s.id ? 'text-emerald-500 animate-pulse' : 'text-slate-300'} />
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-sm font-bold text-slate-800">{s.customerName}</p>
                  <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    {s.origin} <ArrowSmallRight /> {s.destination}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                   <BrainCircuit size={14} /> Predictive ETA
                 </h3>
                 {loadingEta && <Loader2 size={14} className="text-indigo-400 animate-spin" />}
              </div>

              {loadingEta ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-white/5 rounded-xl w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                </div>
              ) : etaPrediction ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-3xl font-black text-white">{etaPrediction.estimated_days} Days</p>
                      <button 
                        onClick={() => selectedShipment && fetchETAPrediction(selectedShipment)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                      >
                        <RefreshCcw size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predicted Arrival Window</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1">
                        <span>Confidence</span>
                        <span>{etaPrediction.confidence_score}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000" 
                          style={{ width: `${etaPrediction.confidence_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    {etaPrediction.reasoning}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Unable to generate ETA telemetry.</p>
                  <button 
                    onClick={() => selectedShipment && fetchETAPrediction(selectedShipment)}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Trigger AI Re-analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <div className="flex-[2] relative bg-slate-900 rounded-[3.5rem] border-[6px] border-white shadow-2xl overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
            <div className="absolute inset-0 flex items-center justify-center p-20">
              <div className="relative w-full h-full flex items-center justify-between">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  {selectedShipment?.legs.map((leg, idx) => {
                    const startX = 10 + (idx * (80 / selectedShipment.legs.length));
                    const endX = 10 + ((idx + 1) * (80 / selectedShipment.legs.length));
                    return (
                      <path 
                        key={leg.id}
                        d={`M ${startX}%,50% Q ${(startX + endX) / 2}%,${idx % 2 === 0 ? 30 : 70}% ${endX}%,50%`} 
                        fill="none" 
                        stroke={activeLegId === leg.id ? "#10b981" : "rgba(16,185,129,0.3)"} 
                        strokeWidth={activeLegId === leg.id ? "6" : "4"} 
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>

                {selectedShipment && (
                  <>
                    <WaypointNode label={selectedShipment.origin} position="left-[10%]" />
                    {selectedShipment.legs.map((leg, idx) => {
                      const endX = 10 + ((idx + 1) * (80 / selectedShipment.legs.length));
                      const isActive = activeLegId === leg.id;
                      return (
                        <React.Fragment key={leg.id}>
                          <div 
                            onClick={() => setActiveLegId(leg.id)}
                            style={{ left: `${10 + (idx * (80 / selectedShipment.legs.length)) + (40 / selectedShipment.legs.length)}%`, top: idx % 2 === 0 ? '25%' : '75%' }}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all`}
                          >
                            <div className={`p-4 rounded-2xl border-2 transition-all ${
                              isActive 
                              ? 'bg-emerald-500 border-white text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'
                            }`}>
                              {getModeIcon(leg.mode)}
                            </div>
                          </div>
                          
                          <WaypointNode 
                            label={leg.destination} 
                            position={`left-[${endX}%]`} 
                            isActive={idx === selectedShipment.legs.length - 1}
                          />
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div className="absolute top-10 left-10">
              <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 p-5 rounded-3xl shadow-2xl">
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                   <Zap size={10} /> Active Feed
                 </p>
                 <p className="text-white font-bold text-sm tracking-tight">{selectedShipment?.origin}</p>
                 <div className="flex items-center gap-2 mt-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lat: 41.008 | Lng: 28.978</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-[0.15em] text-[10px]">Gemini Maps Intelligence</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Real-time Location Grounding</p>
                </div>
              </div>
              {loadingAi && <Loader2 size={16} className="text-indigo-500 animate-spin" />}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              {loadingAi ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-24 bg-slate-50 rounded-[2rem]"></div>
                </div>
              ) : aiInsight ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 relative">
                    <div className="absolute top-4 right-4 text-slate-200"><Shield size={16} /></div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      "{aiInsight.text}"
                    </p>
                  </div>
                  
                  {aiInsight.sources.length > 0 && (
                    <div className="space-y-4 pb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Validated Global Sources</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {aiInsight.sources.map((src, i) => (
                          <a 
                            key={i} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group shadow-sm"
                          >
                            <span className="truncate pr-4">{src.title}</span>
                            <ExternalLink size={12} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] p-8 text-center">
                  <Globe className="text-slate-200 mb-4" size={48} />
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest max-w-[200px]">Select Telemetry Point to Begin Geospatial Analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WaypointNode = ({ label, position, isActive }: { label: string, position: string, isActive?: boolean }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 z-30 ${position}`}>
    <div className={`w-4 h-4 rounded-full border-4 ${isActive ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/20' : 'bg-slate-700 border-slate-900 ring-4 ring-slate-800/50'}`}></div>
    <div className="bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
      <p className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">{label}</p>
    </div>
  </div>
);

const PackageSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

const ArrowSmallRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);

export default TrackingView;
