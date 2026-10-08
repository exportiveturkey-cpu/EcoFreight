
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
  ShieldCheck,
  Building2,
  Award,
  RotateCcw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ShipmentManager from './components/ShipmentManager';
import SustainabilityHub from './components/SustainabilityHub';
import ArchitectureDocs from './components/ArchitectureDocs';
import TrackingView from './components/TrackingView';
import AIAssistant from './components/AIAssistant';
import NetworkManager from './components/NetworkManager';
import Login, { createDemoProfile } from './components/Login';
import { Shipment, ShipmentStatus, TransportMode } from './types';
import { Language, translations } from './services/i18n';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { INITIAL_SAMPLE_SHIPMENTS } from './services/sampleData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'tracking' | 'sustainability' | 'network' | 'docs' | 'ai-assistant'>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState<Language>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'el' || urlLang === 'gr') return 'el';
      if (urlLang === 'tr') return 'tr';
      if (urlLang === 'en') return 'en';
      const saved = localStorage.getItem('ecofreight_lang') as Language;
      if (saved === 'el' || saved === 'tr' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  });
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const t = translations[lang] || translations.en;

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('ecofreight_lang', newLang);
    } catch (e) {}
  };

  useEffect(() => {
    // 1. Check URL query params for direct demo link (?demo=client or ?demo=jury)
    try {
      const params = new URLSearchParams(window.location.search);
      const demoParam = params.get('demo') || params.get('mode');
      if (demoParam === 'client') {
        const clientProfile = createDemoProfile('client');
        localStorage.setItem('ecofreight_demo_user', JSON.stringify(clientProfile));
        setUser(clientProfile);
        setAuthLoading(false);
        setShipments(INITIAL_SAMPLE_SHIPMENTS);
        return;
      } else if (demoParam === 'jury' || demoParam === 'evaluator') {
        const juryProfile = createDemoProfile('jury');
        localStorage.setItem('ecofreight_demo_user', JSON.stringify(juryProfile));
        setUser(juryProfile);
        setAuthLoading(false);
        setShipments(INITIAL_SAMPLE_SHIPMENTS);
        return;
      }
    } catch (e) {
      // ignore
    }

    // 2. Check saved demo user session and recalculate remaining days
    const savedDemoUser = localStorage.getItem('ecofreight_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        if (parsed.membershipExpiresAt) {
          const diffMs = new Date(parsed.membershipExpiresAt).getTime() - Date.now();
          const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          parsed.daysRemaining = diffDays;
        }
        setUser(parsed);
        setAuthLoading(false);
      } catch (e) {
        localStorage.removeItem('ecofreight_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      if (currentUser) {
        const userEmail = (currentUser.email || '').toLowerCase();
        if (userEmail.includes('jury') || userEmail.includes('nbgseeds')) {
          const juryProfile = {
            ...currentUser,
            displayName: currentUser.displayName || 'NBG Seeds Jury & Evaluator',
            isDemo: true,
            demoType: 'jury',
            isReadOnly: false,
            role: 'evaluator',
            daysRemaining: 14,
            totalDays: 14,
            membershipExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          };
          setUser(juryProfile);
        } else if (userEmail.includes('client') || userEmail.includes('ecofreight.eu')) {
          const clientProfile = {
            ...currentUser,
            displayName: currentUser.displayName || 'Corporate Client Preview',
            isDemo: true,
            demoType: 'client',
            isReadOnly: true,
            role: 'client_readonly',
            daysRemaining: 3,
            totalDays: 3,
            membershipExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          };
          setUser(clientProfile);
        } else {
          setUser(currentUser);
        }
      } else if (!localStorage.getItem('ecofreight_demo_user')) {
        setUser(null);
      }
      setAuthLoading(false);
    });

    setShipments(INITIAL_SAMPLE_SHIPMENTS);
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecofreight_demo_user');
    signOut(auth);
    setUser(null);
  };

  const handleSwitchDemo = (type: 'jury' | 'client') => {
    const profile = createDemoProfile(type);
    localStorage.setItem('ecofreight_demo_user', JSON.stringify(profile));
    setUser(profile);
  };

  if (authLoading) return <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center"><div className="w-16 h-16 border-b-2 border-emerald-500 rounded-full animate-spin"></div></div>;
  if (!user) return <Login onLoginSuccess={setUser} lang={lang} onLangChange={handleLangChange} />;

  const isDemoExpired = user?.isDemo && user.daysRemaining !== undefined && user.daysRemaining <= 0;

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
          <NavItem icon={<Globe size={22} />} label={t.globalNetwork} active={activeTab === 'network'} onClick={() => setActiveTab('network')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Leaf size={22} />} label={t.sustainability} active={activeTab === 'sustainability'} onClick={() => setActiveTab('sustainability')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MessageSquare size={22} />} label={t.aiAssistant} active={activeTab === 'ai-assistant'} onClick={() => setActiveTab('ai-assistant')} collapsed={!isSidebarOpen} />
        </div>

        <div className="p-6 border-t border-white/5 space-y-2">
          {user?.isDemo && isSidebarOpen && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-1.5 font-bold text-white">
                <span className="flex items-center gap-1.5">
                  {user.isReadOnly ? <Building2 size={13} className="text-blue-400" /> : <Award size={13} className="text-emerald-400" />}
                  {user.isReadOnly ? t.demoClient : t.demoJury}
                </span>
                <span className="text-[10px] text-emerald-400">
                  {user.daysRemaining ?? (user.isReadOnly ? 3 : 14)} {t.daysRemaining}
                </span>
              </div>
              <button
                onClick={() => handleSwitchDemo(user.demoType === 'client' ? 'jury' : 'client')}
                className="w-full text-left text-[11px] text-slate-400 hover:text-white flex items-center justify-between pt-1.5 border-t border-white/5"
              >
                <span>
                  {user.demoType === 'client'
                    ? (lang === 'el' ? 'Αλλαγή σε Κριτή (14ημ)' : lang === 'tr' ? 'Jüri Moduna Geç (14g)' : 'Switch to Jury (14d)')
                    : (lang === 'el' ? 'Αλλαγή σε Πελάτη (3ημ)' : lang === 'tr' ? 'Müşteri Moduna Geç (3g)' : 'Switch to Client (3d)')}
                </span>
                <RotateCcw size={11} />
              </button>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">{t.signOut}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-12 z-40 shrink-0">
           <div className="flex items-center gap-4 bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-2.5 w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder={t.search} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
          </div>
          <div className="flex items-center gap-4">
            {user && (
              user.isDemo ? (
                user.isReadOnly ? (
                  // Potential Client Read-Only Demo (3 Days)
                  <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 text-xs font-medium shadow-sm">
                    <Building2 size={14} className="text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-800">{t.demoClient}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white font-black tracking-wider">
                      {user.daysRemaining ?? 3} {t.days} • {t.readOnly}
                    </span>
                  </div>
                ) : (
                  // NBG Seeds Jury Demo (14 Days)
                  <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs font-medium shadow-sm">
                    <Award size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-800">{t.demoJury}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black tracking-wider">
                      {user.daysRemaining ?? 14} {t.days} {lang === 'el' ? 'Ενεργό' : lang === 'tr' ? 'Aktif' : 'Active'}
                    </span>
                  </div>
                )
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-[11px] font-mono font-bold text-slate-700">{user.email || 'Authenticated'}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-black tracking-wider">Firebase Auth</span>
                </div>
              )
            )}

            {/* Language Switcher with Flag Icons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'en'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('el')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'el'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Ελληνικά"
              >
                🇬🇷 ΕΛ
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('tr')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'tr'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Türkçe"
              >
                🇹🇷 TR
              </button>
            </div>

            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={22} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Expired demo overlay modal if duration ended */}
        {isDemoExpired && (
          <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-900">{t.demoExpired}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.demoExpiredDesc}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600">
                {t.contact}: Exportiveturkey@gmail.com
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSwitchDemo(user.demoType || 'jury')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  {t.renewDemo}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  {t.signOut}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard shipments={shipments} lang={lang} />}
          {activeTab === 'shipments' && (
            <ShipmentManager 
              shipments={shipments} 
              isReadOnly={user?.isReadOnly || false}
              onAdd={s => setShipments([s, ...shipments])} 
              onDelete={id => setShipments(shipments.filter(s => s.id !== id))} 
              lang={lang} 
            />
          )}
          {activeTab === 'tracking' && <TrackingView shipments={shipments} lang={lang} />}
          {activeTab === 'network' && <NetworkManager />}
          {activeTab === 'sustainability' && <SustainabilityHub shipments={shipments} lang={lang} />}
          {activeTab === 'ai-assistant' && <AIAssistant />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    {icon}
    {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
    {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>}
  </button>
);

export default App;
