
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Truck, 
  Map as MapIcon,
  Leaf, 
  Settings, 
  Search,
  Bell,
  BookOpen,
  Languages,
  LogOut,
  ChevronRight,
  User,
  MessageSquare,
  X,
  AlertTriangle,
  Info,
  Globe,
  ShieldCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ShipmentManager from './components/ShipmentManager';
import SustainabilityHub from './components/SustainabilityHub';
import ArchitectureDocs from './components/ArchitectureDocs';
import TrackingView from './components/TrackingView';
import AIAssistant from './components/AIAssistant';
import NetworkManager from './components/NetworkManager';
import Login from './components/Login';
import { Shipment, ShipmentStatus, TransportMode } from './types';
import { Language, translations } from './services/i18n';
import { auth, onAuthStateChanged, signOut } from './services/firebase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'tracking' | 'sustainability' | 'network' | 'docs' | 'ai-assistant'>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    const mockShipments: Shipment[] = [
      {
        id: 'SH-8291',
        customerName: 'AeroDynamics NV',
        origin: 'Rotterdam, NL',
        destination: 'Singapore, SG',
        cargoType: 'Aerospace Components',
        incoterms: 'DAP',
        weightTonnes: 4.2,
        volumeCbm: 12,
        status: ShipmentStatus.IN_TRANSIT,
        legs: [
          { id: 'L1', mode: TransportMode.SEA, origin: 'Rotterdam', destination: 'Suez', distanceKm: 6000, cost: 1200, emissionsKg: 300 },
          { id: 'L2', mode: TransportMode.SEA, origin: 'Suez', destination: 'Singapore', distanceKm: 9500, cost: 2000, emissionsKg: 480 }
        ],
        costBreakdown: { freight: 2800, fuelSurcharge: 200, portFees: 150, insurance: 50, customs: 0 },
        totalCost: 3200,
        totalEmissionsKg: 780,
        trackingHistory: [{ status: 'On Sea', location: 'Suez Canal', timestamp: '2024-03-20T12:00:00Z', description: 'Vessel in transit' }],
        createdAt: new Date().toISOString()
      }
    ];
    setShipments(mockShipments);
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (authLoading) return <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center"><div className="w-16 h-16 border-b-2 border-emerald-500 rounded-full animate-spin"></div></div>;
  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} glass-sidebar h-full transition-all duration-500 flex flex-col z-50`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/40"><Leaf className="text-white w-6 h-6" /></div>
            {isSidebarOpen && <span className="font-extrabold text-2xl text-white tracking-tight">EcoFreight</span>}
          </div>
        </div>

        <div className="px-6 py-6 flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutGrid size={22} />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Truck size={22} />} label={t.shipments} active={activeTab === 'shipments'} onClick={() => setActiveTab('shipments')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MapIcon size={22} />} label={t.tracking} active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Globe size={22} />} label="Global Network" active={activeTab === 'network'} onClick={() => setActiveTab('network')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Leaf size={22} />} label={t.sustainability} active={activeTab === 'sustainability'} onClick={() => setActiveTab('sustainability')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MessageSquare size={22} />} label={t.aiAssistant} active={activeTab === 'ai-assistant'} onClick={() => setActiveTab('ai-assistant')} collapsed={!isSidebarOpen} />
        </div>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-12 z-40 shrink-0">
           <div className="flex items-center gap-4 bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-2.5 w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder={t.search} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <Languages size={14} className="text-emerald-500" /> {lang}
            </button>
            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={22} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard shipments={shipments} lang={lang} />}
          {activeTab === 'shipments' && <ShipmentManager shipments={shipments} onAdd={s => setShipments([s, ...shipments])} onDelete={id => setShipments(shipments.filter(s => s.id !== id))} lang={lang} />}
          {activeTab === 'tracking' && <TrackingView shipments={shipments} lang={lang} />}
          {activeTab === 'network' && <NetworkManager />}
          {activeTab === 'sustainability' && <SustainabilityHub shipments={shipments} lang={lang} />}
          {activeTab === 'ai-assistant' && <AIAssistant />}
        </div>
      </main>
    </div>
  );

  function toggleLanguage() {
    const languages: Language[] = ['en', 'tr', 'el'];
    setLang(languages[(languages.indexOf(lang) + 1) % languages.length]);
  }
};

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    {icon}
    {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
    {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>}
  </button>
);

export default App;
