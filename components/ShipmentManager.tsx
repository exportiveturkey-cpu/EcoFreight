
import React, { useState, useRef, useMemo } from 'react';
// Added Leaf to the icons imported from lucide-react
import { Plus, Download, MoreVertical, X, ArrowRight, DollarSign, Package, FileText, Sparkles, Loader2, UploadCloud, CheckCircle2, Trash2, Eye, FileOutput, BarChart3, TrendingUp, Info, Ship, Plane, Truck, Train, Clock, Gauge, Award, BrainCircuit, Share2, Globe, Leaf, Lock, ShieldAlert, Anchor, RotateCcw, BookOpenCheck } from 'lucide-react';
import { Shipment, ShipmentStatus, SpeedProfile, TransportMode } from '../types';
import { applySlowSteamingToRoute, calculateLegEmissions, computeCarbonAwareTradeOff, DEFAULT_ECO_SLOW_STEAMING_PCT, DEFAULT_EU_ETS_CARBON_PRICE, DEFAULT_PORT_DWELL_HOURS, DWELL_TIME_PRESETS, estimatePortFees, estimateTeuFromCargo, getGlecFactorSpec, getShipmentContainers, getShipmentDistanceKm, getShipmentGlecBreakdown, getShipmentScheduleReliability, getShipmentTeuKm, isShipmentOnTime, SLOW_STEAMING_TIERS } from '../services/carbon';
import { Language, translations, statusLabel } from '../services/i18n';
// RouteOption is now correctly exported from gemini.ts
import { processShipmentDocument, getRouteComparison, RouteOption } from '../services/gemini';
import { formatEUR, formatNumber } from '../services/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ShipmentManagerProps { 
  shipments: Shipment[]; 
  isReadOnly?: boolean;
  onAdd: (shipment: Shipment) => void; 
  onDelete: (id: string) => void; 
  lang: Language; 
}

const ShipmentManager: React.FC<ShipmentManagerProps> = ({ shipments, isReadOnly = false, onAdd, onDelete, lang }) => {
  const t = translations[lang];
  const [isModalOpen, setModalOpen] = useState(false);
  const [showReadOnlyNotice, setShowReadOnlyNotice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [analyticsShipment, setAnalyticsShipment] = useState<Shipment | null>(null);
  const [showPortalPreview, setShowPortalPreview] = useState<Shipment | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const emptyShipment = { customer: '', origin: '', destination: '', weight: 1, volume: 2.5, containers: 1, type: 'General Cargo', incoterms: 'CIF' };
  const [newShipment, setNewShipment] = useState(emptyShipment);
  const [carbonPrice, setCarbonPrice] = useState<number>(DEFAULT_EU_ETS_CARBON_PRICE);
  const [originPortFee, setOriginPortFee] = useState<number>(251);
  const [destinationPortFee, setDestinationPortFee] = useState<number>(251);
  const [portFeesEdited, setPortFeesEdited] = useState(false);
  const [containersEdited, setContainersEdited] = useState(false);
  const [applyPortFeeToAllModes, setApplyPortFeeToAllModes] = useState(false);
  const [dwellTimeHours, setDwellTimeHours] = useState<number>(DEFAULT_PORT_DWELL_HOURS);
  const [slowSteamingPct, setSlowSteamingPct] = useState<number>(0);
  const speedProfile: SpeedProfile = slowSteamingPct > 0 ? 'eco' : 'standard';

  const displayedRouteOptions = useMemo(() => {
    const mapped = routeOptions.map((opt) =>
      applySlowSteamingToRoute(opt, slowSteamingPct, carbonPrice)
    );
    return [...mapped].sort((a, b) => a.estimatedCost - b.estimatedCost);
  }, [routeOptions, slowSteamingPct, carbonPrice]);

  const carbonAwareSummary = useMemo(
    () => computeCarbonAwareTradeOff(routeOptions, carbonPrice, 10),
    [routeOptions, carbonPrice]
  );

  const activeSelectedRoute = useMemo(() => {
    if (!selectedRoute) return displayedRouteOptions[0] || null;
    return displayedRouteOptions.find((o) => o.mode === selectedRoute.mode) || displayedRouteOptions[0] || null;
  }, [selectedRoute, displayedRouteOptions]);

  const canAnalyze = !!(newShipment.customer.trim() && newShipment.origin.trim() && newShipment.destination.trim() && newShipment.weight > 0);

  const openNewShipment = () => {
    setNewShipment(emptyShipment);
    const est = estimatePortFees('', '', 1);
    setOriginPortFee(est.originPortFee);
    setDestinationPortFee(est.destinationPortFee);
    setPortFeesEdited(false);
    setContainersEdited(false);
    setApplyPortFeeToAllModes(false);
    setDwellTimeHours(DEFAULT_PORT_DWELL_HOURS);
    setCarbonPrice(DEFAULT_EU_ETS_CARBON_PRICE);
    setSlowSteamingPct(0);
    setRouteOptions([]);
    setSelectedRoute(null);
    setStep(1);
    setModalOpen(true);
  };

  const syncPortDefaults = (originVal: string, destVal: string, weightVal: number) => {
    if (!portFeesEdited) {
      const est = estimatePortFees(originVal, destVal, weightVal);
      setOriginPortFee(est.originPortFee);
      setDestinationPortFee(est.destinationPortFee);
    }
  };

  const copyTrackingLink = async (s: Shipment) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?track=${encodeURIComponent(s.id)}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const extractedData = await processShipmentDocument(base64, file.type);
      if (extractedData) {
        const nextOrigin = extractedData.origin || '';
        const nextDest = extractedData.destination || '';
        const nextWeight = Number(extractedData.weight) || 1;
        setNewShipment(prev => ({ ...prev, customer: extractedData.customer || '', origin: nextOrigin, destination: nextDest, weight: nextWeight, containers: containersEdited ? prev.containers : estimateTeuFromCargo(nextWeight, prev.volume), type: extractedData.type || 'General Cargo', incoterms: extractedData.incoterms || prev.incoterms }));
        syncPortDefaults(nextOrigin, nextDest, nextWeight);
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze || isAnalyzing) return;
    setIsAnalyzing(true);
    const options = await getRouteComparison(
      newShipment.origin,
      newShipment.destination,
      newShipment.weight,
      carbonPrice,
      1,
      originPortFee,
      destinationPortFee,
      applyPortFeeToAllModes,
      newShipment.containers,
      dwellTimeHours
    );
    const sorted = [...options].sort((a, b) => a.estimatedCost - b.estimatedCost);
    setRouteOptions(sorted);
    setStep(2);
    if (sorted.length > 0) setSelectedRoute(sorted[0]);
    setIsAnalyzing(false);
  };

  const handleSubmit = () => {
    const chosenRoute = activeSelectedRoute;
    if (!chosenRoute) return;
    const mappedMode: TransportMode =
      chosenRoute.mode === 'SEA_RAIL'
        ? TransportMode.SEA
        : (chosenRoute.mode as TransportMode);
    const s: Shipment = {
      id: `SH-${Math.floor(1000 + Math.random() * 8999)}`,
      customerName: newShipment.customer,
      origin: newShipment.origin,
      destination: newShipment.destination,
      cargoType: newShipment.type,
      incoterms: newShipment.incoterms,
      weightTonnes: newShipment.weight,
      volumeCbm: newShipment.volume,
      containers: newShipment.containers,
      dwellTimeHours: chosenRoute.dwellHours ?? dwellTimeHours,
      scheduleDelayHours: (chosenRoute.dwellHours ?? 0) > 24 ? Math.round((chosenRoute.dwellHours ?? 0) - 24) : 0,
      scheduleReliabilityPct: chosenRoute.scheduleReliabilityPct,
      speedProfile,
      slowSteamingPct,
      status: ShipmentStatus.BOOKED,
      legs: [{ id: 'L1', mode: mappedMode, origin: newShipment.origin, destination: newShipment.destination, distanceKm: chosenRoute.estimatedDistanceKm || 0, cost: chosenRoute.estimatedCost, emissionsKg: chosenRoute.estimatedEmissionsKg }],
      costBreakdown: {
        freight: chosenRoute.baseFreightCost,
        fuelSurcharge: chosenRoute.fuelCost,
        carbonCost: chosenRoute.co2Cost,
        portFees: chosenRoute.portFeeTotal,
        dwellCost: chosenRoute.dwellCost ?? 0,
        insurance: 0,
        customs: 0
      },
      totalCost: chosenRoute.estimatedCost,
      totalEmissionsKg: chosenRoute.estimatedEmissionsKg,
      trackingHistory: [{ status: 'Booked', location: newShipment.origin, timestamp: new Date().toISOString(), description: `Confirmed (${speedProfile === 'eco' ? t.ecoSpeedLabel : t.standardSpeed} · ${t.fuelCost}: ${formatEUR(chosenRoute.fuelCost, 0)} · ${t.co2Cost}: ${formatEUR(chosenRoute.co2Cost, 0)} · ${t.portFees}: ${formatEUR(chosenRoute.portFeeTotal, 0)} · ${t.dwellCost}: ${formatEUR(chosenRoute.dwellCost ?? 0, 0)})` }],
      createdAt: new Date().toISOString()
    };
    onAdd(s);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold">{t.readOnlyNoticeTitle}</p>
              <p className="text-[11px] text-blue-700">
                {t.readOnlyNoticeDesc}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-200/70 text-blue-800 shrink-0">
            {t.readOnly}
          </span>
        </div>
      )}

      {showReadOnlyNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <p className="text-xs font-medium">
              {lang === 'el' ? (
                <><strong>Περιορισμένη Ενέργεια:</strong> Δεν μπορείτε να δημιουργήσετε νέα αποστολή στη λειτουργία προεπισκόπησης. Για πλήρη πρόσβαση δοκιμών, μεταβείτε στη <strong>Λειτουργία Κριτών NBG Seeds</strong>.</>
              ) : lang === 'tr' ? (
                <><strong>İşlem Sınırlandırıldı:</strong> Müşteri demo oturumunda yeni sevkiyat oluşturulamaz. Canlı rota optimizasyonunu ve yeni kayıt test etmek için 14 günlük <strong>NBG Seeds Jüri Moduna</strong> geçebilirsiniz.</>
              ) : (
                <><strong>Action Restricted:</strong> New shipment creation is disabled in client preview mode. For full simulation and multi-modal tests, please switch to <strong>NBG Seeds Jury Mode</strong>.</>
              )}
            </p>
          </div>
          <button 
            onClick={() => setShowReadOnlyNotice(false)} 
            className="text-amber-700 hover:text-amber-900 text-xs font-bold px-2 py-1"
          >
            {t.cancel}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.shipTitle}</h1>
          <p className="text-slate-500 font-medium">{t.shipSubtitle}</p>
        </div>
        <button 
          onClick={() => {
            if (isReadOnly) {
              setShowReadOnlyNotice(true);
            } else {
              openNewShipment();
            }
          }} 
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
            isReadOnly 
              ? 'bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
          title={isReadOnly ? t.readOnly : t.newShipment}
        >
          {isReadOnly ? <Lock size={16} /> : <Plus size={18} />} 
          {t.newShipment} {isReadOnly && <span className="text-[10px] opacity-75">({t.readOnly})</span>}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.idCustomer}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.route}</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.teuKm}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.map(s => {
              const distKm = getShipmentDistanceKm(s);
              const teuCount = getShipmentContainers(s);
              const teuKm = getShipmentTeuKm(s);
              return (
              <tr key={s.id} className="hover:bg-slate-50 group">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900">{s.id}</p>
                  <p className="text-xs text-slate-500 font-medium">{s.customerName}</p>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-700">{s.origin} → {s.destination}</td>
                <td className="px-6 py-6 text-right font-mono tabular-nums">
                  <p className="text-xs font-bold text-slate-900">{formatNumber(teuKm)}</p>
                  <p className="text-[10px] text-slate-400">{teuCount} TEU × {formatNumber(distKm)} km</p>
                </td>
                <td className="px-8 py-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{statusLabel(s.status, t)}</span></td>
                <td className="px-8 py-6 text-right relative">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => setShowPortalPreview(s)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all" title="Customer Portal View"><Share2 size={18} /></button>
                      <button onClick={() => setAnalyticsShipment(s)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all" title={t.shipmentDetails}><Eye size={18} /></button>
                   </div>
                </td>
              </tr>
              );
            })}
            {shipments.length === 0 && (
              <tr><td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-400">{t.noShipments}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Public Customer Portal Preview Modal */}
      {showPortalPreview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Globe size={20} />
                   <h2 className="text-lg font-black tracking-tight">{t.publicPortal}</h2>
                </div>
                <button onClick={() => setShowPortalPreview(null)} className="p-2 bg-white/20 rounded-xl"><X size={20} /></button>
             </div>
             <div className="p-10 space-y-8">
                <div className="text-center">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                      <Package size={32} />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Your Order From</p>
                   <h3 className="text-2xl font-black text-slate-900">{showPortalPreview.customerName}</h3>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                   <div className="flex justify-between items-center mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sustainability Impact</p>
                      <Leaf className="text-emerald-500" size={16} />
                   </div>
                   <p className="text-sm font-bold text-slate-700 leading-relaxed">This shipment saved <span className="text-emerald-600">42.5kg of CO2</span> compared to industry average.</p>
                </div>
                <div className="space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.history}</p>
                   {showPortalPreview.trackingHistory.map((h, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-px bg-slate-200 relative"><div className="absolute top-0 left-[-4px] w-2 h-2 rounded-full bg-emerald-500"></div></div>
                         <div>
                            <p className="text-xs font-black text-slate-900">{h.status}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{h.location} • {new Date(h.timestamp).toLocaleDateString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
                <button onClick={() => copyTrackingLink(showPortalPreview)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">{linkCopied ? t.copied : t.copyTrackingLink}</button>
             </div>
          </div>
        </div>
      )}

      {/* Shipment Details Modal */}
      {analyticsShipment && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setAnalyticsShipment(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.shipmentDetails}</p>
                <h2 className="text-2xl font-black text-slate-900">{analyticsShipment.id} · {analyticsShipment.customerName}</h2>
                <p className="text-sm font-bold text-slate-500">{analyticsShipment.origin} → {analyticsShipment.destination} · {analyticsShipment.weightTonnes}t · {analyticsShipment.incoterms}</p>
              </div>
              <button onClick={() => setAnalyticsShipment(null)} className="p-2 hover:bg-slate-100 rounded-xl" title={t.close}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalCost}</p>
                <p className="text-xl font-black font-mono tabular-nums text-slate-900">{formatEUR(analyticsShipment.totalCost, 0)}</p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                  {getShipmentTeuKm(analyticsShipment) > 0 ? `${formatEUR(analyticsShipment.totalCost / getShipmentTeuKm(analyticsShipment), 2)}/TEU-km` : '—'}
                </p>
              </div>
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.emissions} (GLEC v3.0 WTW)</p>
                <p className="text-xl font-black font-mono tabular-nums text-emerald-800">{formatNumber(analyticsShipment.totalEmissionsKg)} kg CO2e</p>
                <p className="text-[11px] font-mono tabular-nums text-emerald-700 mt-0.5">
                  {getShipmentTeuKm(analyticsShipment) > 0 ? `${(analyticsShipment.totalEmissionsKg / getShipmentTeuKm(analyticsShipment)).toFixed(2)} kg/TEU-km` : '—'}
                </p>
              </div>
              <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{t.teuKm}</p>
                <p className="text-xl font-black font-mono tabular-nums text-indigo-900">{formatNumber(getShipmentTeuKm(analyticsShipment))}</p>
                <p className="text-[11px] font-mono tabular-nums text-indigo-700 mt-0.5">
                  {getShipmentContainers(analyticsShipment)} TEU × {formatNumber(getShipmentDistanceKm(analyticsShipment))} km
                </p>
              </div>
              <div className="p-5 bg-cyan-50/70 rounded-2xl border border-cyan-100">
                <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">{t.scheduleReliability}</p>
                <p className="text-xl font-black font-mono tabular-nums text-cyan-900">{getShipmentScheduleReliability(analyticsShipment).toFixed(1)}%</p>
                <p className="text-[11px] font-mono tabular-nums text-cyan-700 mt-0.5">
                  {isShipmentOnTime(analyticsShipment)
                    ? t.onTime
                    : `${t.delayed} (+${analyticsShipment.scheduleDelayHours ?? 0}h)`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.shipmentLedgerTitle}</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono tabular-nums">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-sans font-bold text-slate-400">{t.baseFreight}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatEUR(analyticsShipment.costBreakdown?.freight || 0, 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-[10px] font-sans font-bold text-amber-700">{t.fuelCost}</p>
                  <p className="text-sm font-bold text-amber-800 mt-0.5">{formatEUR(analyticsShipment.costBreakdown?.fuelSurcharge || 0, 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[10px] font-sans font-bold text-emerald-700">{t.co2Cost}</p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">{formatEUR(analyticsShipment.costBreakdown?.carbonCost || 0, 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <p className="text-[10px] font-sans font-bold text-indigo-700">{t.portFees}</p>
                  <p className="text-sm font-bold text-indigo-800 mt-0.5">{formatEUR(analyticsShipment.costBreakdown?.portFees || 0, 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <p className="text-[10px] font-sans font-bold text-rose-700">
                    {t.dwellCost} {analyticsShipment.dwellTimeHours ? `(${analyticsShipment.dwellTimeHours}h)` : ''}
                  </p>
                  <p className="text-sm font-bold text-rose-800 mt-0.5">{formatEUR(analyticsShipment.costBreakdown?.dwellCost || 0, 0)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.legs}</p>
              {analyticsShipment.legs.map(l => {
                const factorSpec = getGlecFactorSpec(l.mode);
                return (
                <div key={l.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="font-black text-slate-700 w-14">{l.mode}</span>
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-slate-600 truncate block">{l.origin} → {l.destination}</span>
                    <span className="text-[10px] font-mono tabular-nums text-emerald-700">GLEC v3.0 WTW: {factorSpec.wtw.toFixed(3)} kg/t·km</span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-500 w-20 text-right">{formatNumber(l.distanceKm)} km</span>
                  <span className="font-mono tabular-nums text-emerald-700 w-24 text-right">{formatNumber(l.emissionsKg)} kg</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 w-20 text-right">{formatEUR(l.cost, 0)}</span>
                </div>
                );
              })}
            </div>
            {(() => {
              const glecSummary = getShipmentGlecBreakdown(analyticsShipment);
              return (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <BookOpenCheck size={14} className="text-emerald-700" />
                      <span>{t.glecMethodTitle}</span>
                    </p>
                    <p className="text-[11px] font-mono tabular-nums text-emerald-800">
                      Σ (km × {analyticsShipment.weightTonnes} t × EF_WTW) · ISO 14083 WTW
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0 text-emerald-900">
                    <span>TTW: <strong>{formatNumber(glecSummary.ttwKg)} kg</strong></span>
                    <span aria-hidden="true">+</span>
                    <span>WTT: <strong>{formatNumber(glecSummary.wttKg)} kg</strong></span>
                    <span aria-hidden="true">=</span>
                    <span><strong>{formatNumber(glecSummary.totalKg)} kg CO2e</strong></span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Booking Modal Simplified for step 1 & 2 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden p-10 space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900">{t.newShipmentAnalysis}</h2>
                 <button onClick={() => setModalOpen(false)}><X /></button>
              </div>
              {step === 1 ? (
                <div className="space-y-6">
                   <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center cursor-pointer hover:bg-slate-50">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                      {isProcessing ? <Loader2 className="text-slate-400 mb-4 animate-spin" size={48} /> : <UploadCloud className="text-slate-400 mb-4" size={48} />}
                      <p className="text-sm font-bold text-slate-500">{t.dropBol}</p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input placeholder={t.customer} value={newShipment.customer} onChange={e => setNewShipment({...newShipment, customer: e.target.value})} className="p-3.5 bg-slate-50 rounded-2xl border text-sm" />
                      <input placeholder={t.origin} value={newShipment.origin} onChange={e => { const v = e.target.value; setNewShipment({...newShipment, origin: v}); syncPortDefaults(v, newShipment.destination, newShipment.weight); }} className="p-3.5 bg-slate-50 rounded-2xl border text-sm" />
                      <input placeholder={t.destination} value={newShipment.destination} onChange={e => { const v = e.target.value; setNewShipment({...newShipment, destination: v}); syncPortDefaults(newShipment.origin, v, newShipment.weight); }} className="p-3.5 bg-slate-50 rounded-2xl border text-sm" />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1">{t.weight}</label>
                          <input placeholder={t.weight} type="number" min="0.5" step="0.5" value={Number.isNaN(newShipment.weight) ? '' : newShipment.weight} onChange={e => { const w = parseFloat(e.target.value); setNewShipment(prev => ({...prev, weight: w, containers: containersEdited || Number.isNaN(w) ? prev.containers : estimateTeuFromCargo(w, prev.volume)})); if (!Number.isNaN(w)) syncPortDefaults(newShipment.origin, newShipment.destination, w); }} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1">{t.containersTeu}</label>
                          <input placeholder="TEU" type="number" min="0.5" step="0.5" value={Number.isNaN(newShipment.containers) ? '' : newShipment.containers} onChange={e => { setContainersEdited(true); setNewShipment(prev => ({...prev, containers: Math.max(0.5, parseFloat(e.target.value) || 1)})); }} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1">€/t CO2</label>
                          <input placeholder="€/t CO2" type="number" min="0" step="5" value={carbonPrice} onChange={e => setCarbonPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1 px-1 flex items-center gap-1"><Anchor size={11} /> {t.originPortFee}</label>
                        <input type="number" min="0" step="10" value={originPortFee} onChange={e => { setPortFeesEdited(true); setOriginPortFee(Math.max(0, Number(e.target.value) || 0)); }} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 px-1">
                          <label className="text-[10px] font-bold text-indigo-700 flex items-center gap-1"><Anchor size={11} /> {t.destinationPortFee}</label>
                          <button type="button" onClick={() => { setPortFeesEdited(false); const est = estimatePortFees(newShipment.origin, newShipment.destination, newShipment.weight); setOriginPortFee(est.originPortFee); setDestinationPortFee(est.destinationPortFee); }} className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
                            <RotateCcw size={10} /> {t.autoEstimatePorts}
                          </button>
                        </div>
                        <input type="number" min="0" step="10" value={destinationPortFee} onChange={e => { setPortFeesEdited(true); setDestinationPortFee(Math.max(0, Number(e.target.value) || 0)); }} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                      </div>
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-rose-700 mb-1 px-1 flex items-center gap-1"><Clock size={11} /> {t.dwellTimeHours}</label>
                          <input type="number" min="0" step="6" value={dwellTimeHours} onChange={e => setDwellTimeHours(Math.max(0, Number(e.target.value) || 0))} className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-mono tabular-nums" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pb-0.5">
                          {DWELL_TIME_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setDwellTimeHours(preset.hours)}
                              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 border ${
                                dwellTimeHours === preset.hours
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {t[preset.key]}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                     <input type="checkbox" checked={applyPortFeeToAllModes} onChange={e => setApplyPortFeeToAllModes(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                     <span>{t.applyTerminalFeesAllModes}</span>
                   </label>
                   {!canAnalyze && <p className="text-xs text-slate-400">{t.fillRequired}</p>}
                   <button onClick={handleAnalyze} disabled={!canAnalyze || isAnalyzing} className="w-full py-4 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center gap-2">
                      {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {t.analyzeOptions}
                   </button>
                </div>
              ) : (
                <div className="space-y-5">
                   {/* Speed Regime & Carbon-Aware Trade-Off Bar */}
                   <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                     {carbonAwareSummary && (
                       <div className="space-y-0.5">
                         <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                           <Leaf size={14} className="text-emerald-700" />
                           <span>
                             {t.carbonAwareOption}: {carbonAwareSummary.recommendedRoute.mode} ({carbonAwareSummary.recommendedRoute.speedProfile === 'eco' ? t.ecoSpeedLabel : t.standardSpeed})
                           </span>
                         </p>
                         <p className="text-[11px] font-mono tabular-nums text-emerald-800">
                           -{formatNumber(carbonAwareSummary.co2SavedKg)} kg CO2e (-{carbonAwareSummary.co2SavedPct}%) · {t.costDeltaLabel}: {carbonAwareSummary.costDeltaEur >= 0 ? `+${formatEUR(carbonAwareSummary.costDeltaEur, 0)}` : `-${formatEUR(Math.abs(carbonAwareSummary.costDeltaEur), 0)}`} · {t.transitDeltaLabel}: {carbonAwareSummary.transitDaysDelta >= 0 ? '+' : ''}{carbonAwareSummary.transitDaysDelta}d
                         </p>
                       </div>
                     )}
                     <div className="flex flex-wrap items-center gap-2 shrink-0">
                       <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-emerald-200">
                         {SLOW_STEAMING_TIERS.slice(0, 4).map((tier) => (
                           <button
                             key={tier.pct}
                             type="button"
                             onClick={() => setSlowSteamingPct(tier.pct)}
                             className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums font-bold transition-colors whitespace-nowrap ${
                               slowSteamingPct === tier.pct
                                 ? tier.pct === 0
                                   ? 'bg-slate-900 text-white'
                                   : 'bg-emerald-600 text-white'
                                 : 'text-slate-600'
                             }`}
                           >
                             {tier.pct === 0 ? t.standardSpeed : `-${tier.pct}% (${tier.knots} kts)`}
                           </button>
                         ))}
                       </div>
                       {carbonAwareSummary && (
                         <button
                           type="button"
                           onClick={() => {
                             setSlowSteamingPct(
                               carbonAwareSummary.recommendedRoute.speedProfile === 'eco'
                                 ? DEFAULT_ECO_SLOW_STEAMING_PCT
                                 : 0
                             );
                             setSelectedRoute(carbonAwareSummary.recommendedRoute);
                           }}
                           className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold whitespace-nowrap"
                         >
                           {t.applyCarbonAware}
                         </button>
                       )}
                     </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                      {displayedRouteOptions.map((opt, i) => (
                        <div key={opt.mode} onClick={() => setSelectedRoute(opt)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-colors ${activeSelectedRoute?.mode === opt.mode ? 'border-emerald-600 bg-emerald-50/70' : 'border-slate-200 hover:border-slate-300'}`}>
                           <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                             <span>{opt.label}</span>
                             {i === 0 && <span className="text-emerald-700">{t.optimalChoice}</span>}
                           </div>
                           <h4 className="font-extrabold text-base text-slate-900">{opt.mode === 'SEA_RAIL' ? `${t.sea} + ${t.rail}` : opt.mode} · {opt.estimatedDays}d</h4>
                           <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono tabular-nums">
                             <div className="flex justify-between text-slate-600">
                               <span>{t.baseFreight}</span>
                               <span>{formatEUR(opt.baseFreightCost, 0)}</span>
                             </div>
                             <div className="flex justify-between text-amber-700 font-semibold">
                               <span>{t.fuelCost}</span>
                               <span>{formatEUR(opt.fuelCost, 0)}</span>
                             </div>
                             <div className="flex justify-between text-emerald-700 font-semibold">
                               <span>{t.co2Cost}</span>
                               <span>{formatEUR(opt.co2Cost, 0)}</span>
                             </div>
                             <div className="flex justify-between text-indigo-700 font-semibold">
                               <span>{t.portFees}</span>
                               <span>{formatEUR(opt.portFeeTotal, 0)}</span>
                             </div>
                             <div className="flex justify-between text-rose-700 font-semibold">
                               <span>{t.dwellCost} ({opt.dwellHours ?? 0}h)</span>
                               <span>+{formatEUR(opt.dwellCost ?? 0, 0)} · +{formatNumber(opt.dwellEmissionsKg ?? 0)} kg</span>
                             </div>
                             <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1.5 border-t border-slate-200/70">
                               <span>{t.totalCost}</span>
                               <span>{formatEUR(opt.estimatedCost, 0)}</span>
                             </div>
                           </div>
                           <p className="text-[11px] text-slate-500 mt-2 font-mono tabular-nums">
                             {formatNumber(opt.teuKm)} TEU-km · {formatEUR(opt.costPerTeuKm, 2)}/TEU-km · {opt.estimatedEmissionsKg} kg CO2e
                           </p>
                           {(opt.fuelPlusCo2SavedEur ?? 0) > 0 && (
                             <p className="text-[10px] text-emerald-700 mt-0.5 font-mono tabular-nums font-bold">
                               {t.combinedSavingsLabel} (-{opt.slowSteamingPct}%): -{formatEUR(opt.fuelPlusCo2SavedEur ?? 0, 0)} · -{formatNumber(opt.co2SavedKg ?? 0)} kg
                             </p>
                           )}
                           <p className="text-[10px] text-emerald-700 mt-1 font-mono tabular-nums">
                             GLEC v3.0 WTW: {(opt.glecFactorWtw ?? getGlecFactorSpec(opt.mode).wtw).toFixed(3)} kg/t·km
                           </p>
                           {typeof opt.scheduleReliabilityPct === 'number' && (
                             <p className="text-[10px] text-cyan-700 mt-0.5 font-mono tabular-nums font-bold">
                               {t.scheduleReliability}: {opt.scheduleReliabilityPct.toFixed(1)}%
                             </p>
                           )}
                        </div>
                      ))}
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs">{t.back}</button>
                      <button onClick={handleSubmit} disabled={!activeSelectedRoute} className="flex-1 py-4 bg-emerald-600 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">{t.bookNow}</button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;
