
import React, { useState, useRef, useEffect } from 'react';
// Added Leaf to the icons imported from lucide-react
import { Plus, Download, MoreVertical, X, ArrowRight, DollarSign, Package, FileText, Sparkles, Loader2, UploadCloud, CheckCircle2, Trash2, Eye, FileOutput, BarChart3, TrendingUp, Info, Ship, Plane, Truck, Train, Clock, Gauge, Award, BrainCircuit, Share2, Globe, Leaf, Lock, ShieldAlert } from 'lucide-react';
import { Shipment, ShipmentStatus, TransportMode } from '../types';
import { calculateLegEmissions } from '../services/carbon';
import { Language, translations } from '../services/i18n';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newShipment, setNewShipment] = useState({ customer: '', origin: '', destination: '', weight: 1, volume: 2.5, type: 'General Cargo', incoterms: 'CIF' });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const extractedData = await processShipmentDocument(base64);
      if (extractedData) setNewShipment({ ...newShipment, customer: extractedData.customer || '', origin: extractedData.origin || '', destination: extractedData.destination || '', weight: extractedData.weight || 1, type: extractedData.type || 'General Cargo' });
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const options = await getRouteComparison(newShipment.origin, newShipment.destination, newShipment.weight);
    setRouteOptions(options);
    setStep(2);
    if (options.length > 0) setSelectedRoute(options[0]);
    setIsAnalyzing(false);
  };

  const handleSubmit = () => {
    if (!selectedRoute) return;
    const s: Shipment = {
      id: `SH-${Math.floor(1000 + Math.random() * 8999)}`,
      customerName: newShipment.customer,
      origin: newShipment.origin,
      destination: newShipment.destination,
      cargoType: newShipment.type,
      incoterms: newShipment.incoterms,
      weightTonnes: newShipment.weight,
      volumeCbm: newShipment.volume,
      status: ShipmentStatus.BOOKED,
      legs: [{ id: 'L1', mode: selectedRoute.mode as any, origin: newShipment.origin, destination: newShipment.destination, distanceKm: 4500, cost: selectedRoute.estimatedCost, emissionsKg: selectedRoute.estimatedEmissionsKg }],
      costBreakdown: { freight: selectedRoute.estimatedCost * 0.85, fuelSurcharge: 0, portFees: 0, insurance: 0, customs: 0 },
      totalCost: selectedRoute.estimatedCost,
      totalEmissionsKg: selectedRoute.estimatedEmissionsKg,
      trackingHistory: [{ status: 'Booked', location: newShipment.origin, timestamp: new Date().toISOString(), description: 'Confirmed' }],
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
              <p className="text-xs font-bold">Müşteri Demo Önizlemesi (Salt Okunur Mod)</p>
              <p className="text-[11px] text-blue-700">
                16 aktif sevkiyat verisi, CBAM emisyonları ve müşteri takip portalı benchmark testi için açıktır. Referans veri setinin bütünlüğünü korumak adına sevkiyat ekleme kilitlenmiştir.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-200/70 text-blue-800 shrink-0">
            Read-Only
          </span>
        </div>
      )}

      {showReadOnlyNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <p className="text-xs font-medium">
              <strong>İşlem Sınırlandırıldı:</strong> Müşteri demo oturumunda yeni sevkiyat oluşturulamaz. Canlı rota optimizasyonunu ve yeni kayıt test etmek için 14 günlük <strong>NBG Seeds Jüri Moduna</strong> geçebilirsiniz.
            </p>
          </div>
          <button 
            onClick={() => setShowReadOnlyNotice(false)} 
            className="text-amber-700 hover:text-amber-900 text-xs font-bold px-2 py-1"
          >
            Kapat
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Logistics</h1>
          <p className="text-slate-500 font-medium">Multi-Tenant Consignment Operations & Customer Tracking</p>
        </div>
        <button 
          onClick={() => {
            if (isReadOnly) {
              setShowReadOnlyNotice(true);
            } else {
              setModalOpen(true);
            }
          }} 
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
            isReadOnly 
              ? 'bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
          title={isReadOnly ? 'Salt Okunur Demo Modu' : 'Yeni Sevkiyat Ekle'}
        >
          {isReadOnly ? <Lock size={16} /> : <Plus size={18} />} 
          New Shipment {isReadOnly && <span className="text-[10px] opacity-75">(Korumalı)</span>}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 group">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900">{s.id}</p>
                  <p className="text-xs text-slate-500 font-medium">{s.customerName}</p>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-700">{s.origin} → {s.destination}</td>
                <td className="px-8 py-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{s.status}</span></td>
                <td className="px-8 py-6 text-right relative">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => setShowPortalPreview(s)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all" title="Customer Portal View"><Share2 size={18} /></button>
                      <button onClick={() => setAnalyticsShipment(s)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"><Eye size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
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
                   <h2 className="text-lg font-black tracking-tight">Public Tracking Portal</h2>
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
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tracking History</p>
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
                <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">Copy Tracking Link</button>
             </div>
          </div>
        </div>
      )}

      {/* Booking Modal Simplified for step 1 & 2 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden p-10 space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900">New Shipment Analysis</h2>
                 <button onClick={() => setModalOpen(false)}><X /></button>
              </div>
              {step === 1 ? (
                <div className="space-y-6">
                   <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center cursor-pointer hover:bg-slate-50">
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                      <UploadCloud className="text-slate-400 mb-4" size={48} />
                      <p className="text-sm font-bold text-slate-500">Drop BOL here to auto-fill</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Customer" value={newShipment.customer} onChange={e => setNewShipment({...newShipment, customer: e.target.value})} className="p-4 bg-slate-50 rounded-2xl border" />
                      <input placeholder="Origin" value={newShipment.origin} onChange={e => setNewShipment({...newShipment, origin: e.target.value})} className="p-4 bg-slate-50 rounded-2xl border" />
                      <input placeholder="Destination" value={newShipment.destination} onChange={e => setNewShipment({...newShipment, destination: e.target.value})} className="p-4 bg-slate-50 rounded-2xl border" />
                      <input placeholder="Weight" type="number" value={newShipment.weight} onChange={e => setNewShipment({...newShipment, weight: parseFloat(e.target.value)})} className="p-4 bg-slate-50 rounded-2xl border" />
                   </div>
                   <button onClick={handleAnalyze} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center gap-2">
                      {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />} Analyze Options
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-3 gap-4">
                      {routeOptions.map((opt: any, i) => (
                        <div key={i} onClick={() => setSelectedRoute(opt)} className={`p-6 rounded-[2rem] border-2 cursor-pointer ${selectedRoute?.mode === opt.mode ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}>
                           <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{opt.label}</p>
                           <h4 className="font-black text-lg text-slate-900">{opt.mode}</h4>
                           <p className="text-xs font-bold text-emerald-600 mt-2">{opt.estimatedEmissionsKg}kg CO2e</p>
                           <p className="text-xs font-bold text-slate-900 mt-1">{formatEUR(opt.estimatedCost, 0)}</p>
                        </div>
                      ))}
                   </div>
                   <button onClick={handleSubmit} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Book Now</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;
