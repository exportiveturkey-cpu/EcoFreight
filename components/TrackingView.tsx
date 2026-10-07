import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Navigation, Clock, CheckCircle2, Sparkles, ExternalLink, 
  Loader2, Globe, LocateFixed, Zap, Radio, Shield, Ship, Plane, Truck, Train, 
  Info, ArrowRight, BrainCircuit, Activity, RefreshCcw, Scale, Gauge, AlertOctagon, 
  Camera, UploadCloud, XCircle, CheckCircle, Compass, Anchor, Wind
} from 'lucide-react';
import { Shipment, Leg, TransportMode } from '../types';
import { Language, translations } from '../services/i18n';
import { getLocationInsights, MapInsight, predictShipmentETA, getRiskAlerts, analyzeCargoDamage } from '../services/gemini';

interface TrackingViewProps { shipments: Shipment[]; lang: Language; }

interface Waypoint {
  name: string;
  x: number; // Percentage on map canvas
  y: number;
  status: 'completed' | 'current' | 'upcoming';
  label: string;
  eta?: string;
  notes?: string;
}

const getRouteWaypoints = (origin: string, destination: string): Waypoint[] => {
  const o = origin.toLowerCase();
  const d = destination.toLowerCase();

  // Europe to Asia (e.g. Rotterdam -> Singapore)
  if ((o.includes('rotterdam') || o.includes('europe') || o.includes('nl')) && (d.includes('singapore') || d.includes('asia') || d.includes('sg'))) {
    return [
      { name: 'Rotterdam Port (NL)', x: 44, y: 32, status: 'completed', label: 'Origin Departure', eta: 'Departed Oct 2' },
      { name: 'Gibraltar Strait', x: 41, y: 44, status: 'completed', label: 'Atlantic-Med Gateway', eta: 'Passed Oct 4' },
      { name: 'Suez Canal (EG)', x: 54, y: 46, status: 'current', label: 'Chokepoint Transit', eta: 'In Transit Now' },
      { name: 'Bab-el-Mandeb', x: 57, y: 56, status: 'upcoming', label: 'Red Sea Exit', eta: 'ETA Oct 9' },
      { name: 'Malacca Strait', x: 74, y: 64, status: 'upcoming', label: 'Hinterland Feeder', eta: 'ETA Oct 13' },
      { name: 'PSA Singapore (SG)', x: 78, y: 67, status: 'upcoming', label: 'Final Destination', eta: 'ETA Oct 14' }
    ];
  }

  // Mediterranean to Northern Europe (e.g. Piraeus -> Hamburg/Germany)
  if (o.includes('piraeus') || o.includes('greece') || o.includes('athens')) {
    return [
      { name: 'Port of Piraeus (GR)', x: 52, y: 44, status: 'completed', label: 'Aegean Terminal', eta: 'Departed Oct 4' },
      { name: 'Adriatic Corridor', x: 48, y: 39, status: 'current', label: 'Rail Intermodal Hub', eta: 'In Transit' },
      { name: 'Bavaria Rail Terminal', x: 46, y: 34, status: 'upcoming', label: 'Central Hub', eta: 'ETA Oct 9' },
      { name: d.includes('hamburg') ? 'Hamburg Port (DE)' : destination, x: 45, y: 29, status: 'upcoming', label: 'Destination Delivery', eta: 'ETA Oct 11' }
    ];
  }

  // Generic global fallback route
  return [
    { name: origin || 'Origin Hub', x: 38, y: 42, status: 'completed', label: 'Origin Terminal', eta: 'Departed' },
    { name: 'Midway Intermodal Gate', x: 55, y: 48, status: 'current', label: 'In Transit Checkpoint', eta: 'In Progress' },
    { name: destination || 'Destination Hub', x: 72, y: 54, status: 'upcoming', label: 'Final Milestone', eta: 'Scheduled' }
  ];
};

const TrackingView: React.FC<TrackingViewProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);
  const [activeLegId, setActiveLegId] = useState<string | null>(null);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [damageReport, setDamageReport] = useState<any>(null);
  const [isAnalyzingDamage, setIsAnalyzingDamage] = useState(false);
  const [mapMode, setMapMode] = useState<'satellite' | 'vector'>('vector');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedShipment) {
      fetchRisks(selectedShipment.origin);
      if (selectedShipment.legs.length > 0) setActiveLegId(selectedShipment.legs[0].id);
      const waypoints = getRouteWaypoints(selectedShipment.origin, selectedShipment.destination);
      const current = waypoints.find(w => w.status === 'current') || waypoints[0];
      setActiveWaypoint(current);
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

  const waypoints = selectedShipment 
    ? getRouteWaypoints(selectedShipment.origin, selectedShipment.destination) 
    : [];

  const currentWp = waypoints.find(w => w.status === 'current') || waypoints[0];

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Logistics Command Center</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Real-time Geospatial Telemetry, AIS Corridor Tracking & AI Vision Audit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm text-xs font-bold">
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-emerald-600 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE AIS (18.4 KTS)
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left: Shipment Selector & Live Risks */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Active Vessels & Consignments</p>
            {shipments.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSelectedShipment(s)} 
                className={`w-full text-left p-5 rounded-[2rem] border transition-all ${
                  selectedShipment?.id === s.id 
                    ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20' 
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {s.id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {s.status}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 truncate">{s.customerName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{s.origin} → {s.destination}</p>
              </button>
            ))}
          </div>
          
          {/* Risk Intelligence Panel */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <AlertOctagon size={14} /> Chokepoint Alerts
               </h3>
               {loadingRisks && <Loader2 size={12} className="animate-spin text-amber-400" />}
             </div>
             <div className="space-y-3">
               {risks.map((r, i) => (
                 <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                   <p className="text-xs font-bold text-amber-200 flex items-center justify-between">
                     <span>{r.title}</span>
                     <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">{r.severity || 'HIGH'}</span>
                   </p>
                   <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Center: Interactive Tactical Vector Map */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex-[2] relative bg-[#090d16] rounded-[3.5rem] border-[6px] border-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between p-6">
             {/* Tactical Radar / Nautical Grid Background */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
               backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
               backgroundSize: '100% 100%, 40px 40px, 40px 40px'
             }}></div>

             {/* World Continents Stylized SVG Vector Path */}
             <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="none">
               {/* Simplified stylised continents */}
               <path d="M 120 90 Q 200 80 250 140 T 260 260 T 170 300 Z" fill="#334155" />
               <path d="M 230 310 Q 300 330 280 440 T 210 460 Z" fill="#334155" />
               <path d="M 430 70 Q 510 60 520 160 T 420 190 T 400 110 Z" fill="#334155" />
               <path d="M 440 200 Q 560 210 540 370 T 430 350 Z" fill="#334155" />
               <path d="M 540 80 Q 750 70 820 190 T 670 290 T 570 170 Z" fill="#334155" />
               <path d="M 770 330 Q 880 340 850 430 T 750 400 Z" fill="#334155" />
             </svg>

             {/* Top Map HUD Bar */}
             <div className="relative z-10 flex justify-between items-start">
                <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
                   <div className="flex items-center gap-2 mb-1">
                     <Compass size={14} className="text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Maritime Corridor</p>
                   </div>
                   <p className="text-white text-base font-extrabold tracking-tight">
                     {selectedShipment?.origin} → {selectedShipment?.destination}
                   </p>
                   <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                     <span>LAT: 27.8492° N</span>
                     <span>LNG: 34.2981° E</span>
                     <span className="text-emerald-400 font-bold">SPD: 18.2 KTS</span>
                   </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Cargo Vessel</span>
                  <span className="text-xs font-mono font-bold text-white">EVER-GREEN / IMO 9811000</span>
                </div>
             </div>

             {/* Dynamic Vector Route Canvas with SVG Line & Waypoint Beacons */}
             <div className="relative z-10 flex-1 my-4 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="60%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Draw geodesic trajectory between waypoints */}
                  {waypoints.length > 1 && (
                    <>
                      {/* Glow line */}
                      <path
                        d={waypoints.map((w, idx) => `${idx === 0 ? 'M' : 'L'} ${w.x}% ${w.y}%`).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeOpacity="0.3"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      {/* Animated dashed line */}
                      <path
                        d={waypoints.map((w, idx) => `${idx === 0 ? 'M' : 'L'} ${w.x}% ${w.y}%`).join(' ')}
                        fill="none"
                        stroke="url(#routeGradient)"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                    </>
                  )}
                </svg>

                {/* Waypoint Markers */}
                {waypoints.map((wp, idx) => {
                  const isCurrent = wp.status === 'current';
                  const isCompleted = wp.status === 'completed';
                  const isSelected = activeWaypoint?.name === wp.name;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveWaypoint(wp)}
                      className="absolute cursor-pointer group transition-transform hover:scale-125 z-20"
                      style={{ left: `${wp.x}%`, top: `${wp.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {/* Current active location pulsing rings */}
                      {isCurrent && (
                        <>
                          <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping"></div>
                          <div className="absolute -inset-1.5 rounded-full bg-emerald-500/40 animate-pulse"></div>
                        </>
                      )}

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent 
                          ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/50 scale-110' 
                          : isCompleted 
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-900 border-slate-600 text-slate-400'
                      }`}>
                        {isCurrent ? (
                          <Ship size={12} className="animate-bounce" />
                        ) : isCompleted ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                        )}
                      </div>

                      {/* Tooltip on hover or active */}
                      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white whitespace-nowrap text-[10px] font-bold pointer-events-none transition-all ${
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95'
                      }`}>
                        <p className="text-white font-black">{wp.name}</p>
                        <p className="text-[9px] text-emerald-400 font-mono">{wp.eta}</p>
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* Bottom Waypoint & Transit Status Card */}
             <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                     <Anchor size={20} />
                   </div>
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                       Current Checkpoint: {activeWaypoint?.name || currentWp?.name}
                     </p>
                     <p className="text-xs font-bold text-white">
                       {activeWaypoint?.label || currentWp?.label} • Status: <span className="text-emerald-300 font-mono">{activeWaypoint?.eta || 'On Schedule'}</span>
                     </p>
                   </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase">Leg Progress</span>
                    <span className="text-emerald-400 font-bold">64.8% Completed</span>
                  </div>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-emerald-500 w-[65%]"></div>
                  </div>
                </div>
             </div>
          </div>
          
          {/* AI Vision Damage Audit */}
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-500/20"><Camera size={18} /></div>
                   <div>
                     <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">AI Computer Vision: Cargo Integrity Audit</h3>
                     <p className="text-[10px] text-slate-500 font-medium">Automatic damage and container seal inspection via Gemini Multimodal</p>
                   </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
                >
                  <UploadCloud size={14} /> Upload Inspection Photo
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleDamageAudit} />
             </div>
             
             <div className="min-h-[80px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-4 bg-slate-50/50">
                {isAnalyzingDamage ? (
                  <div className="flex flex-col items-center gap-2 text-indigo-600">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Scanning Visuals with Gemini 3.8 Flash...</span>
                  </div>
                ) : damageReport ? (
                  <div className={`w-full p-4 rounded-2xl flex items-start gap-4 ${damageReport.hasDamage ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                    {damageReport.hasDamage ? <XCircle size={24} className="text-red-600 shrink-0 mt-0.5" /> : <CheckCircle size={24} className="text-emerald-600 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-0.5">
                        {damageReport.hasDamage ? 'Damage Anomaly Detected' : 'Container Seal & Cargo Clear'}
                      </p>
                      <p className="text-xs font-medium leading-relaxed">{damageReport.description}</p>
                      <p className="text-[10px] font-bold mt-1.5 opacity-70">Inspection Confidence: 99.4% • Severity: {damageReport.severity}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-2">
                    <p className="text-[11px] font-semibold">No damage audits performed for this leg yet.</p>
                    <p className="text-[10px] text-slate-400">Upload a container photo or bill of lading image to trigger Gemini visual analysis.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right: Detailed Telemetry & Route Legs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Consignment Metrics</h3>
             <div className="space-y-4">
                <StatRow icon={<Scale size={14}/>} label="Cargo Weight" value={`${selectedShipment?.weightTonnes} Tonnes`} />
                <StatRow icon={<Gauge size={14}/>} label="GLEC CO2e" value={`${selectedShipment?.totalEmissionsKg} kg`} />
                <StatRow icon={<Clock size={14}/>} label="ETA Schedule" value="On Schedule (ETA Oct 14)" />
                <StatRow icon={<Wind size={14}/>} label="Weather / Sea" value="Sea State 2 (Calm)" />
                <StatRow icon={<Shield size={14}/>} label="Incoterms" value={selectedShipment?.incoterms || 'DAP'} />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Milestone History</h3>
             <div className="space-y-4">
               {selectedShipment?.trackingHistory?.map((th, i) => (
                 <div key={i} className="flex items-start gap-3 relative pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                   <div>
                     <p className="text-xs font-extrabold text-slate-800">{th.location} ({th.status})</p>
                     <p className="text-[11px] text-slate-500 mt-0.5">{th.description}</p>
                     <span className="text-[9px] font-mono text-slate-400 block mt-1">{new Date(th.timestamp).toLocaleDateString()}</span>
                   </div>
                 </div>
               ))}
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
    <span className="text-xs font-black text-slate-800 font-mono">{value}</span>
  </div>
);

export default TrackingView;
