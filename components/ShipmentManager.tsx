
import React, { useState, useRef } from 'react';
import { Plus, Download, MoreVertical, X, ArrowRight, DollarSign, Package, FileText, Sparkles, Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Shipment, ShipmentStatus, TransportMode } from '../types';
import { calculateLegEmissions } from '../services/carbon';
import { Language, translations } from '../services/i18n';
import { processShipmentDocument } from '../services/gemini';

interface ShipmentManagerProps {
  shipments: Shipment[];
  onAdd: (shipment: Shipment) => void;
  lang: Language;
}

const ShipmentManager: React.FC<ShipmentManagerProps> = ({ shipments, onAdd, lang }) => {
  const t = translations[lang];
  const [isModalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newShipment, setNewShipment] = useState({
    customer: '',
    origin: '',
    destination: '',
    weight: 1,
    volume: 2.5,
    mode: TransportMode.SEA,
    type: 'General Cargo',
    incoterms: 'CIF'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const extractedData = await processShipmentDocument(base64);
      
      if (extractedData) {
        setNewShipment({
          ...newShipment,
          customer: extractedData.customer || '',
          origin: extractedData.origin || '',
          destination: extractedData.destination || '',
          weight: extractedData.weight || 1,
          type: extractedData.type || 'General Cargo'
        });
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = 4500; 
    const baseRate = newShipment.mode === TransportMode.AIR ? 4.2 : 0.85;
    const freight = baseRate * newShipment.weight * 1000;
    const emissions = calculateLegEmissions(newShipment.mode, distance, newShipment.weight);

    const shipment: Shipment = {
      id: `SH-${Math.floor(100 + Math.random() * 899)}`,
      customerName: newShipment.customer,
      origin: newShipment.origin,
      destination: newShipment.destination,
      cargoType: newShipment.type,
      incoterms: newShipment.incoterms,
      weightTonnes: newShipment.weight,
      volumeCbm: newShipment.volume,
      status: ShipmentStatus.BOOKED,
      legs: [{
        id: 'L1',
        mode: newShipment.mode,
        origin: newShipment.origin,
        destination: newShipment.destination,
        distanceKm: distance,
        cost: freight,
        emissionsKg: emissions
      }],
      costBreakdown: {
        freight: freight,
        fuelSurcharge: freight * 0.12,
        portFees: 150,
        insurance: freight * 0.01,
        customs: 0
      },
      totalCost: freight * 1.13 + 150,
      totalEmissionsKg: emissions,
      trackingHistory: [
        { status: 'Booked', location: newShipment.origin, timestamp: new Date().toISOString(), description: 'Electronic booking confirmed' }
      ],
      createdAt: new Date().toISOString()
    };
    onAdd(shipment);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.shipments}</h1>
          <p className="text-slate-500 font-medium">Enterprise Inventory & Smart Document Processing</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalOpen(true)} 
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-black shadow-lg shadow-slate-900/10 transition-all active:scale-95"
          >
            <Plus size={18} /> {t.createShipment}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.customer}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.origin} & {t.destination}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.status}</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900 mb-0.5">{s.id}</p>
                  <p className="text-xs font-medium text-slate-500">{s.customerName}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    {s.origin} <ArrowRight size={14} className="text-slate-300" /> {s.destination}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-black text-emerald-600">${s.totalCost.toLocaleString()}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 group-hover:text-slate-600 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.newShipment}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Logistics Portal</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="bg-slate-100 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-10">
              {/* SMART IMPORT AREA */}
              <div className="mb-10 group relative">
                <div className={`absolute inset-0 bg-emerald-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${isProcessing ? 'opacity-20 animate-pulse' : ''}`}></div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all cursor-pointer ${
                    isProcessing ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-white'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  
                  {isProcessing ? (
                    <div className="space-y-4">
                      <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto" />
                      <div>
                        <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Gemini Analysis in Progress...</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Extracting shipment telemetry from document</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles size={32} className="text-emerald-500" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">AI Smart Import</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Upload a Bill of Lading or Invoice. Gemini will automatically fill the form using Computer Vision.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.customer}</label>
                  <div className="relative">
                    <input 
                      required 
                      value={newShipment.customer}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 ring-emerald-500/20 transition-all placeholder:text-slate-300" 
                      placeholder="e.g. Acme Corp"
                      onChange={e => setNewShipment({...newShipment, customer: e.target.value})} 
                    />
                    {newShipment.customer && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.origin}</label>
                  <input required value={newShipment.origin} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none" onChange={e => setNewShipment({...newShipment, origin: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.destination}</label>
                  <input required value={newShipment.destination} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none" onChange={e => setNewShipment({...newShipment, destination: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.weight}</label>
                  <input type="number" step="0.1" value={newShipment.weight} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none" onChange={e => setNewShipment({...newShipment, weight: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.mode}</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer" 
                    value={newShipment.mode}
                    onChange={e => setNewShipment({...newShipment, mode: e.target.value as TransportMode})}
                  >
                    <option value={TransportMode.SEA}>Sea Freight</option>
                    <option value={TransportMode.AIR}>Air Freight</option>
                    <option value={TransportMode.ROAD}>Road Transport</option>
                    <option value={TransportMode.RAIL}>Rail Link</option>
                  </select>
                </div>

                <div className="col-span-2 pt-8 flex gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all">
                    {t.cancel}
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">
                    {t.book}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;
