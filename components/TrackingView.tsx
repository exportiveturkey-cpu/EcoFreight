
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Clock, CheckCircle2, Sparkles, ExternalLink, Loader2, Globe, LocateFixed, Zap, Radio, Shield, Ship, Plane, Truck, Train, Info, ArrowRight, BrainCircuit, Activity, RefreshCcw, Scale, Gauge, AlertOctagon, Camera, UploadCloud, XCircle, CheckCircle } from 'lucide-react';
import { Shipment, Leg, TransportMode } from '../types';
import { Language, translations } from '../services/i18n';
import { getLocationInsights, MapInsight, predictShipmentETA, getRiskAlerts, analyzeCargoDamage } from '../services/gemini';

interface TrackingViewProps { shipments: Shipment[]; lang: Language; }

const TrackingView: React.FC<TrackingViewProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);
  const [activeLegId, setActiveLegId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<MapInsight | null>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [damageReport, setDamageReport] = useState<any>(null);
  const [isAnalyzingDamage, setIsAnalyzingDamage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedShipment) {
      setAiInsight(null);
      fetchRisks(selectedShipment.origin);
      if (selectedShipment.legs.length > 0) setActiveLegId(selectedShipment.legs[0].id);
    }
  }, [selectedShipment?.id]);

  const fetchRisks = async (loc: string) => {
    setLoadingRisks(true);
    const alerts = await getRiskAlerts(loc);
    setRisks(alerts);
    setLoadingRisks(false);
  };

  const handleDamageAudit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingDamage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const report = await analyzeCargoDamage(base64);
      setDamageReport(report);
      setIsAnalyzingDamage(false);
    };
    reader.readAsDataURL(file);
  };

  const activeLeg = selectedShipment?.legs.find(l => l.id === activeLegId);

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Logistics Command Center</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Item 2: Live Risk Feed & Item 5: AI Vision Audit
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left: Shipment List */}
        <div className="lg:col-span-3 space-y-3 overflow-y-auto custom-scrollbar">
          {shipments.map(s => (
            <button key={s.id} onClick={() => setSelectedShipment(s)} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedShipment?.id === s.id ? 'bg-white border-emerald-500 shadow-xl' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.id}</span>
                <Radio size={12} className={selectedShipment?.id === s.id ? 'text-emerald-500' : 'text-slate-200'} />
              </div>
              <p className="text-sm font-black text-slate-800 truncate">{s.customerName}</p>
            </button>
          ))}
          
          {/* Item 2: Risk Panel */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white mt-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><AlertOctagon size={14} /> Live Risks</h3>
               {loadingRisks && <Loader2 size={12} className="animate-spin text-amber-400" />}
             </div>
             {risks.map((r, i) => (
               <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                 <p className="text-xs font-bold text-amber-200">{r.title}</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed">{r.description.slice(0, 100)}...</p>
               </div>
             ))}
          </div>
        </div>

        {/* Center: Map & Telemetry */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex-[2] relative bg-slate-950 rounded-[3.5rem] border-[6px] border-white shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
             <Globe className="text-slate-800 animate-pulse" size={200} />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
             <div className="absolute top-10 left-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Active Trace</p>
                <p className="text-white text-sm font-bold">{selectedShipment?.origin} → {selectedShipment?.destination}</p>
             </div>
          </div>
          
          {/* Item 5: Vision Audit */}
          <div className="flex-1 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-500 p-2 rounded-xl text-white"><Camera size={18} /></div>
                   <h3 className="font-black text-[10px] uppercase tracking-widest">AI Vision: Damage Audit</h3>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all">
                  <UploadCloud size={14} /> Upload Inspection Photo
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleDamageAudit} />
             </div>
             
             <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-4">
                {isAnalyzingDamage ? (
                  <div className="flex flex-col items-center gap-2 text-indigo-500">
                    <Loader2 size={32} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Scanning Visuals...</span>
                  </div>
                ) : damageReport ? (
                  <div className={`w-full p-4 rounded-2xl flex items-start gap-4 ${damageReport.hasDamage ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {damageReport.hasDamage ? <XCircle size={24} /> : <CheckCircle size={24} />}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{damageReport.hasDamage ? 'Damage Detected' : 'Condition Clear'}</p>
                      <p className="text-xs font-medium leading-relaxed">{damageReport.description}</p>
                      <p className="text-[10px] font-bold mt-2 opacity-60">Severity: {damageReport.severity}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Awaiting Visual Feed</p>
                )}
             </div>
          </div>
        </div>

        {/* Right: Detailed Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Leg Telemetry</h3>
             <div className="space-y-4">
                <StatRow icon={<Scale size={14}/>} label="Weight" value={`${selectedShipment?.weightTonnes}t`} />
                <StatRow icon={<Gauge size={14}/>} label="CO2e" value={`${selectedShipment?.totalEmissionsKg}kg`} />
                <StatRow icon={<Clock size={14}/>} label="SLA" value="On Schedule" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ icon, label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <div className="flex items-center gap-2 text-slate-400">{icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span></div>
    <span className="text-xs font-black text-slate-800">{value}</span>
  </div>
);

export default TrackingView;
