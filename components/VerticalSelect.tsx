import React from 'react';
import { Ship, Truck } from 'lucide-react';
import { Language, translations } from '../services/i18n';

interface VerticalSelectProps {
  lang: Language;
  onSelect: (vertical: 'maritime' | 'road') => void;
}

const VerticalSelect: React.FC<VerticalSelectProps> = ({ lang, onSelect }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">{t.verticalTitle}</h1>
          <p className="text-slate-400 text-xs mt-1">{t.verticalSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelect('maritime')}
            className="text-left p-6 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-400 transition-all"
          >
            <Ship className="text-emerald-300 mb-4" size={28} />
            <p className="text-white font-black">{t.verticalMaritime}</p>
            <p className="text-slate-300 text-xs mt-1">{t.verticalMaritimeDesc}</p>
          </button>

          <button
            type="button"
            onClick={() => onSelect('road')}
            className="text-left p-6 rounded-3xl bg-blue-500/15 border border-blue-500/30 hover:border-blue-400 transition-all"
          >
            <Truck className="text-blue-300 mb-4" size={28} />
            <p className="text-white font-black">{t.verticalRoad}</p>
            <p className="text-slate-300 text-xs mt-1">{t.verticalRoadDesc}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalSelect;
