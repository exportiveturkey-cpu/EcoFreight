import React, { useState } from 'react';
import { LayoutGrid, Route, Users, Leaf, ShieldCheck, Truck, LogOut, RotateCcw } from 'lucide-react';
import { Language, translations } from '../../services/i18n';
import RoadCarbon from './RoadCarbon';

type RoadTab = 'fleet' | 'routes' | 'drivers' | 'carbon' | 'compliance';

interface RoadAppProps {
  lang: Language;
  onSwitchVertical: () => void;
  onLogout: () => void;
}

const RoadApp: React.FC<RoadAppProps> = ({ lang, onSwitchVertical, onLogout }) => {
  const t = translations[lang] || translations.en;
  const [tab, setTab] = useState<RoadTab>('fleet');

  // Only Carbon is functional. The other sections are placeholders until real data exists.
  const items: { id: RoadTab; label: string; icon: React.ReactNode; soon: boolean }[] = [
    { id: 'fleet', label: t.roadFleet, icon: <LayoutGrid size={22} />, soon: true },
    { id: 'routes', label: t.roadRoutes, icon: <Route size={22} />, soon: true },
    { id: 'drivers', label: t.roadDrivers, icon: <Users size={22} />, soon: true },
    { id: 'carbon', label: t.roadCarbon, icon: <Leaf size={22} />, soon: false },
    { id: 'compliance', label: t.roadCompliance, icon: <ShieldCheck size={22} />, soon: true },
  ];
  const current = items.find(i => i.id === tab) ?? items[0];

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <aside className="w-72 glass-sidebar h-full flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30"><Truck className="text-white w-6 h-6" /></div>
            <span className="font-extrabold text-2xl text-white tracking-tight">EcoFreight</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mt-3">{t.verticalRoad}</p>
        </div>

        <nav className="px-6 py-6 flex-1 space-y-2 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                tab === item.id ? 'bg-blue-500 text-white font-bold shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide flex-1 text-left">{item.label}</span>
              {item.soon && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{t.comingSoon}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <button type="button" onClick={onSwitchVertical} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <RotateCcw size={18} />
            <span className="text-sm font-bold">{t.switchVertical}</span>
          </button>
          <button type="button" onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            <span className="text-sm font-bold">{t.signOut}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">{current.label}</h1>
        {tab === 'carbon'
          ? <RoadCarbon t={t} />
          : <div className="bg-white rounded-[2rem] border border-slate-200 p-10 text-center text-slate-500 text-sm">{t.placeholderNote}</div>}
      </main>
    </div>
  );
};

export default RoadApp;
