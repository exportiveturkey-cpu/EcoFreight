
import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Truck,
  Map as MapIcon,
  Leaf,
  Settings,
  Menu,
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
  RotateCcw,
  Ship,
  Anchor
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ShipmentManager from './components/ShipmentManager';
import SustainabilityHub from './components/SustainabilityHub';
import ArchitectureDocs from './components/ArchitectureDocs';
import TrackingView from './components/TrackingView';
import AIAssistant from './components/AIAssistant';
import NetworkManager from './components/NetworkManager';
import VerticalSelect from './components/VerticalSelect';
import RoadApp from './verticals/road/RoadApp';
import Login, { createDemoProfile, DemoType } from './components/Login';
import { Shipment, ShipmentStatus, TransportMode } from './types';
import { Language, translations } from './services/i18n';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { INITIAL_SAMPLE_SHIPMENTS } from './services/sampleData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'tracking' | 'sustainability' | 'network' | 'docs' | 'ai-assistant'>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [vertical, setVertical] = useState<'maritime' | 'road' | null>(null);

  const t = translations[lang] || translations.en;

  // Lets the browser drop accents on Greek uppercase. Turkish stays 'en': many labels are still
  // English, and Turkish casing would dot their i's (HİGH İMPACT).
  useEffect(() => { document.documentElement.lang = lang === 'tr' ? 'en' : lang; }, [lang]);

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
      if (demoParam === 'demo' || demoParam === '1') {
        const demoProfile = createDemoProfile('demo');
        localStorage.setItem('ecofreight_demo_user', JSON.stringify(demoProfile));
        setUser(demoProfile);
        setAuthLoading(false);
        setShipments(INITIAL_SAMPLE_SHIPMENTS);
        return;
      } else if (demoParam === 'client') {
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
          if (diffDays === 0) {
            localStorage.removeItem('ecofreight_demo_user');
            return;
          }
          parsed.daysRemaining = diffDays;
        }
        setUser(parsed);
        setAuthLoading(false);
      } catch (e) {
        localStorage.removeItem('ecofreight_demo_user');
      }
    }

    // Real Firebase accounts are used as-is. Demo roles come only from createDemoProfile().
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else if (!localStorage.getItem('ecofreight_demo_user')) {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecofreight_demo_user');
    signOut(auth);
    setUser(null);
    setVertical(null);
  };

  const handleSwitchDemo = (type: DemoType) => {
    const profile = createDemoProfile(type);
    localStorage.setItem('ecofreight_demo_user', JSON.stringify(profile));
    setUser(profile);
  };

  // Sample data is for demo accounts only. Corporate sign-ins start empty.
  useEffect(() => {
    setShipments(user?.isDemo ? INITIAL_SAMPLE_SHIPMENTS : []);
  }, [user?.isDemo]);

  if (authLoading) return <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center"><div className="w-16 h-16 border-b-2 border-emerald-500 rounded-full animate-spin"></div></div>;
  if (!user) return <Login onLoginSuccess={setUser} lang={lang} onLangChange={handleLangChange} />;
  if (!vertical) return <VerticalSelect lang={lang} onSelect={setVertical} />;
  if (vertical === 'road') return <RoadApp lang={lang} onSwitchVertical={() => setVertical(null)} onLogout={handleLogout} />;

  const q = searchQuery.trim().toLowerCase();
  const visibleShipments = q
    ? shipments.filter(s => [s.id, s.customerName, s.origin, s.destination, s.cargoType].some(v => v.toLowerCase().includes(q)))
    : shipments;
  const latestEvents = shipments
    .flatMap(s => s.trackingHistory.map(e => ({ ...e, shipmentId: s.id })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const demoLabel = user?.demoType === 'demo' ? t.demoAccount : user?.isReadOnly ? t.demoClient : t.demoJury;
  const isDemoExpired = user?.isDemo && user.daysRemaining !== undefined && user.daysRemaining <= 0;

  return (
    <div className="flex h-screen bg-[#0a1628] overflow-hidden">
      {mobileNav && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileNav(false)} />}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} ${mobileNav ? '' : 'max-md:-translate-x-full'} max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-72 glass-sidebar h-full transition-all duration-500 flex flex-col z-50`}>
        <div className="p-8 flex items-center justify-between">
          <button type="button" onClick={() => setSidebarOpen(!isSidebarOpen)} className="flex items-center gap-3" title={isSidebarOpen ? 'Collapse' : 'Expand'}>
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/40"><Leaf className="text-white w-6 h-6" /></div>
            {isSidebarOpen && <span className="font-extrabold text-2xl text-white tracking-tight">EcoFreight</span>}
          </button>
          {isSidebarOpen && <ChevronRight size={18} className="text-slate-500 rotate-180 cursor-pointer hover:text-white" onClick={() => setSidebarOpen(false)} />}
        </div>
        {isSidebarOpen && (
          <div className="mx-6 mb-4 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Ship size={14} className="text-emerald-400 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">Maritime</span>
          </div>
        )}

        <div onClick={() => setMobileNav(false)} className="px-6 py-6 flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutGrid size={22} />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Truck size={22} />} label={t.shipments} active={activeTab === 'shipments'} onClick={() => setActiveTab('shipments')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MapIcon size={22} />} label={t.tracking} active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Globe size={22} />} label={t.globalNetwork} active={activeTab === 'network'} onClick={() => setActiveTab('network')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Leaf size={22} />} label={t.sustainability} active={activeTab === 'sustainability'} onClick={() => setActiveTab('sustainability')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MessageSquare size={22} />} label={t.aiAssistant} active={activeTab === 'ai-assistant'} onClick={() => setActiveTab('ai-assistant')} collapsed={!isSidebarOpen} />
          <NavItem icon={<BookOpen size={22} />} label={t.docs} active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} collapsed={!isSidebarOpen} />
        </div>

        <div className="p-6 border-t border-white/5 space-y-2">
          {user?.isDemo && isSidebarOpen && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-1.5 font-bold text-white">
                <span className="flex items-center gap-1.5">
                  {user.isReadOnly ? <Building2 size={13} className="text-blue-400" /> : <Award size={13} className="text-emerald-400" />}
                  {demoLabel}
                </span>
                <span className="text-[10px] text-emerald-400">
                  {user.daysRemaining ?? (user.isReadOnly ? 3 : 14)} {t.daysRemaining}
                </span>
              </div>
              {user.demoType !== 'demo' && <button
                onClick={() => handleSwitchDemo(user.demoType === 'client' ? 'jury' : 'client')}
                className="w-full text-left text-[11px] text-slate-400 hover:text-white flex items-center justify-between pt-1.5 border-t border-white/5"
              >
                <span>
                  {user.demoType === 'client'
                    ? (lang === 'el' ? 'Αλλαγή σε Κριτή (14ημ)' : lang === 'tr' ? 'Jüri Moduna Geç (14g)' : 'Switch to Jury (14d)')
                    : (lang === 'el' ? 'Αλλαγή σε Πελάτη (3ημ)' : lang === 'tr' ? 'Müşteri Moduna Geç (3g)' : 'Switch to Client (3d)')}
                </span>
                <RotateCcw size={11} />
              </button>}
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">{t.signOut}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-20 bg-[#080e14]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-3 px-4 md:px-12 z-40 shrink-0">
           <button type="button" onClick={() => { setSidebarOpen(true); setMobileNav(true); }} className="md:hidden text-slate-400 shrink-0"><Menu size={24} /></button>
           <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-5 py-2.5 w-96 max-md:flex-1 max-md:min-w-0 max-md:px-3">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'shipments' && activeTab !== 'tracking') setActiveTab('shipments');
              }}
              className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-200 placeholder:text-slate-500"
            />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              user.isDemo ? (
                user.isReadOnly ? (
                  // Potential Client Read-Only Demo (3 Days)
                  <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-medium">
                    <Building2 size={14} className="text-blue-400" />
                    <span className="text-[11px] font-bold text-slate-300">{t.demoClient}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 font-black tracking-wider">
                      {user.daysRemaining ?? 3} {t.days} • {t.readOnly}
                    </span>
                  </div>
                ) : (
                  // NBG Seeds Jury Demo (14 Days)
                  <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium">
                    <Award size={14} className="text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-300">{demoLabel}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-black tracking-wider">
                      {user.daysRemaining ?? 14} {t.days} {lang === 'el' ? 'Ενεργό' : lang === 'tr' ? 'Aktif' : 'Active'}
                    </span>
                  </div>
                )
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold text-slate-300">{user.email || 'Authenticated'}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black tracking-wider">Firebase Auth</span>
                </div>
              )
            )}

            {/* Language Switcher with Flag Icons */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300'
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
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300'
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
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Türkçe"
              >
                🇹🇷 TR
              </button>
            </div>

            <div className="relative">
              <button type="button" className="relative block" onClick={() => setShowNotifications(!showNotifications)} title={t.notifications}>
                <Bell size={22} className="text-slate-500 hover:text-slate-200" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#080e14]"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-[#0d1b2a] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-4 z-50 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.notifications}</p>
                  {latestEvents.map((e, i) => (
                    <div key={i} className="text-xs border-b border-white/5 last:border-0 pb-2 last:pb-0">
                      <p className="font-bold text-slate-200"><span className="font-mono text-emerald-400">{e.shipmentId}</span> · {e.status}</p>
                      <p className="text-slate-500">{e.location} · {new Date(e.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
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

        <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar" style={{background: 'linear-gradient(160deg, #080e14 0%, #0a1628 40%, #060d19 100%)'}}>
          {activeTab === 'dashboard' && <Dashboard shipments={shipments} lang={lang} />}
          {activeTab === 'shipments' && (
            <ShipmentManager 
              shipments={visibleShipments} 
              isReadOnly={user?.isReadOnly || false}
              onAdd={s => setShipments([s, ...shipments])} 
              onDelete={id => setShipments(shipments.filter(s => s.id !== id))} 
              lang={lang} 
            />
          )}
          {activeTab === 'tracking' && <TrackingView key={q} shipments={visibleShipments} lang={lang} />}
          {activeTab === 'network' && <NetworkManager lang={lang} />}
          {activeTab === 'sustainability' && <SustainabilityHub shipments={shipments} lang={lang} />}
          {activeTab === 'ai-assistant' && <AIAssistant lang={lang} />}
          {activeTab === 'docs' && <ArchitectureDocs />}
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
