import React, { useState } from 'react';
import { LayoutGrid, Route, Truck, Leaf, ShieldCheck, LogOut, Package, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Language, translations } from '../../services/i18n';
import RoadCarbon from './RoadCarbon';
import { ROAD_DELIVERIES, ROAD_ROUTES, ROAD_FLEET } from './roadData';

type RoadSection = 'overview' | 'deliveries' | 'routes' | 'fleet' | 'carbon' | 'compliance';

interface RoadAppProps {
  lang: Language;
  onSwitchVertical: () => void;
  onLogout: () => void;
}

const L = (lang: Language, el: string, en: string) => (lang === 'el' ? el : en);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm p-7 ${className}`}>{children}</div>
);

const Stat = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <Card>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 font-medium mt-1">{sub}</p>}
  </Card>
);

const RoadApp: React.FC<RoadAppProps> = ({ lang, onLogout }) => {
  const t = translations[lang] || translations.en;
  const [section, setSection] = useState<RoadSection>('overview');

  const submitted = ROAD_DELIVERIES.filter(d => d.status === 'submitted').length;
  const pending = ROAD_DELIVERIES.filter(d => d.status === 'pending').length;
  const errors = ROAD_DELIVERIES.filter(d => d.status === 'error');
  const totalKg = ROAD_DELIVERIES.reduce((s, d) => s + (d.weightKg ?? 0), 0);
  const totalCost = ROAD_DELIVERIES.reduce((s, d) => s + (d.cost ?? 0), 0);
  const daysLeft = Math.max(0, Math.ceil((new Date('2027-01-01').getTime() - Date.now()) / 86400000));

  const perDay = [6, 5, 4, 3, 2, 1, 0].map(ago => ({
    day: new Date(Date.now() - ago * 86400000).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', { weekday: 'short' }),
    deliveries: ROAD_DELIVERIES.filter(d => d.daysAgo === ago).length,
  }));

  const items: { id: RoadSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: L(lang, 'Επισκόπηση', 'Overview'), icon: <LayoutGrid size={22} /> },
    { id: 'deliveries', label: L(lang, 'Δελτία αποστολής', 'Deliveries'), icon: <Package size={22} /> },
    { id: 'routes', label: L(lang, 'Δρομολόγια', 'Routes'), icon: <Route size={22} /> },
    { id: 'fleet', label: L(lang, 'Στόλος & Οδηγοί', 'Fleet & Drivers'), icon: <Users size={22} /> },
    { id: 'carbon', label: t.roadCarbon, icon: <Leaf size={22} /> },
    { id: 'compliance', label: L(lang, 'Συμμόρφωση myDATA', 'myDATA compliance'), icon: <ShieldCheck size={22} /> },
  ];

  return (
    <div className="flex min-h-[100dvh] h-screen bg-[#0a1628] overflow-hidden">
      <aside className="w-72 glass-sidebar h-full flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/40"><Truck className="text-white w-6 h-6" /></div>
          <span className="font-extrabold text-2xl text-white tracking-tight">EcoFreight</span>
        </div>
        <div className="mx-6 mb-4 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <Truck size={14} className="text-emerald-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">{L(lang, 'Οδική', 'Road')}</span>
        </div>

        <nav className="px-6 py-6 flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative ${
                section === item.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button type="button" onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            <span className="text-sm font-bold">{t.signOut}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-12 custom-scrollbar" style={{ background: 'linear-gradient(160deg, #080e14 0%, #0a1628 40%, #060d19 100%)' }}>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{items.find(i => i.id === section)?.label}</h1>
            <p className="text-slate-400 font-medium mt-1">{L(lang, 'Οδική μεταφορά · δεδομένα demo', 'Road freight · demo data')}</p>
          </div>

          {section === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Stat label={L(lang, 'Αντίστροφη μέτρηση ΨΔΑ', 'Digital waybill countdown')} value={`${daysLeft} ${L(lang, 'ημέρες', 'days')}`} sub="01/01/2027" />
                <Stat label={L(lang, 'Δελτία αποστολής', 'Waybills')} value={ROAD_DELIVERIES.length} sub={`${submitted} ${L(lang, 'υποβλήθηκαν', 'submitted')} · ${pending} ${L(lang, 'εκκρεμούν', 'pending')}`} />
                <Stat label={L(lang, 'Σφάλματα myDATA', 'myDATA errors')} value={errors.length} sub={L(lang, 'Χρειάζονται διόρθωση', 'Need fixing')} />
                <Stat label={L(lang, 'Συνολικό βάρος', 'Total weight')} value={`${Math.round(totalKg)} kg`} sub={`€${totalCost} ${L(lang, 'κόστος μεταφοράς', 'freight cost')}`} />
              </div>
              <Card>
                <h3 className="font-bold text-slate-800 text-xl">{L(lang, 'Δελτία ανά ημέρα', 'Waybills per day')}</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-6">{L(lang, 'Τελευταίες 7 ημέρες', 'Last 7 days')}</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perDay}>
                      <defs>
                        <linearGradient id="roadArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="deliveries" stroke="#10b981" strokeWidth={3} fill="url(#roadArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}

          {section === 'deliveries' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-3">MARK</th>
                      <th className="pb-3">{L(lang, 'Παραλήπτης', 'Recipient')}</th>
                      <th className="pb-3">{L(lang, 'Πόλη', 'City')}</th>
                      <th className="pb-3">{L(lang, 'Βάρος', 'Weight')}</th>
                      <th className="pb-3">{L(lang, 'Κατάσταση', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {ROAD_DELIVERIES.map(d => (
                      <tr key={d.id}>
                        <td className="py-3 font-mono font-bold">{d.id}</td>
                        <td className="py-3">{d.recipient}{d.error && <span className="block text-[11px] text-red-600">{d.error}</span>}</td>
                        <td className="py-3">{d.city}</td>
                        <td className="py-3 font-mono">{d.weightKg !== null ? `${d.weightKg} kg` : '—'}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${d.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' : d.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                            {d.status === 'submitted' ? L(lang, 'Υποβλήθηκε', 'Submitted') : d.status === 'error' ? L(lang, 'Σφάλμα', 'Error') : L(lang, 'Εκκρεμεί', 'Pending')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {section === 'routes' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {ROAD_ROUTES.map(r => (
                <Card key={r.name}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.date}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${r.optimized ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.optimized ? L(lang, 'Βελτιστοποιημένο', 'Optimised') : L(lang, 'Εκκρεμεί', 'Pending')}
                    </span>
                  </div>
                  <ol className="text-sm text-slate-700 space-y-1 mb-4 list-decimal list-inside">
                    {r.stops.map(s => <li key={s}>{s}</li>)}
                  </ol>
                  <p className="text-xs text-slate-500 font-mono">
                    {r.km !== null ? `${r.km} km · ${r.minutes} ${L(lang, 'λεπτά', 'min')}` : L(lang, 'Δεν έχει υπολογιστεί ακόμη', 'Not calculated yet')}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {section === 'fleet' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-3">{L(lang, 'Όχημα', 'Vehicle')}</th>
                      <th className="pb-3">{L(lang, 'Πληρότητα', 'Load')}</th>
                      <th className="pb-3">{L(lang, 'Οδηγός', 'Driver')}</th>
                      <th className="pb-3">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {ROAD_FLEET.map(v => {
                      const pct = Math.round((v.loadKg / v.capacityKg) * 100);
                      return (
                        <tr key={v.plate}>
                          <td className="py-4 font-mono font-bold">{v.plate}<span className="block text-[11px] text-slate-400 font-sans">{v.capacityKg} kg</span></td>
                          <td className="py-4 w-64">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                            <span className="text-[11px] text-slate-500">{v.loadKg} kg · {pct}%</span>
                          </td>
                          <td className="py-4">{v.driver}</td>
                          <td className="py-4 font-mono text-xs">{v.whatsapp ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {section === 'carbon' && <RoadCarbon t={t} />}

          {section === 'compliance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Stat label={L(lang, 'Υποβλήθηκαν', 'Submitted')} value={submitted} sub="myDATA" />
              <Stat label={L(lang, 'Εκκρεμούν', 'Pending')} value={pending} />
              <Stat label={L(lang, 'Σφάλματα', 'Errors')} value={errors.length} />
              <div className="md:col-span-3">
                <Card>
                  <h3 className="font-bold text-slate-800 text-xl mb-4">{L(lang, 'Σφάλματα υποβολής', 'Submission errors')}</h3>
                  <ul className="space-y-3">
                    {errors.map(d => (
                      <li key={d.id} className="text-sm border-b border-slate-100 pb-3 last:border-0">
                        <span className="font-mono font-bold">{d.id}</span> · {d.recipient}
                        <p className="text-red-600 text-xs mt-1">{d.error}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-4">{L(lang, 'Η υποβολή στο myDATA γίνεται μόνο μετά από έγκριση και μέσω server.', 'myDATA submission happens only after approval and via the server.')}</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoadApp;
