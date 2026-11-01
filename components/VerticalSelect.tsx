import React, { useState } from 'react';
import { Ship, Truck, ArrowRight, Leaf } from 'lucide-react';
import { Language, translations } from '../services/i18n';

interface VerticalSelectProps {
  lang: Language;
  onSelect: (vertical: 'maritime' | 'road') => void;
}

const VerticalSelect: React.FC<VerticalSelectProps> = ({ lang, onSelect }) => {
  const t = translations[lang] || translations.en;
  const [hovered, setHovered] = useState<'maritime' | 'road' | null>(null);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#080e14] overflow-hidden">
      {/* Top bar — logo centered across both panels */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center py-8 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">EcoFreight</span>
        </div>
      </header>

      {/* Split panels */}
      <div className="flex flex-col md:flex-row flex-1 min-h-[100dvh]">
        {/* ── MARITIME ── */}
        <button
          type="button"
          onClick={() => onSelect('maritime')}
          onMouseEnter={() => setHovered('maritime')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: hovered === 'maritime' ? '0 0 62%' : hovered === 'road' ? '0 0 38%' : '0 0 50%',
            transition: 'flex 0.55s cubic-bezier(0.65,0,0.35,1)',
          }}
          className="relative group text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Επιλογή κατηγορίας: Maritime"
        >
          {/* Ocean gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(155deg, #0a2a1a 0%, #062018 40%, #031410 70%, #080e14 100%)',
            }}
          />
          {/* Animated wave glow */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 30% 70%, rgba(16,185,129,0.25) 0%, transparent 70%)',
              transition: 'opacity 0.5s ease',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: hovered === 'maritime' ? 0.6 : 0,
              background: 'radial-gradient(ellipse 90% 70% at 20% 80%, rgba(16,185,129,0.35) 0%, transparent 65%)',
              transition: 'opacity 0.5s ease',
            }}
          />
          {/* Horizontal scan lines texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)',
            }}
          />
          {/* Vertical divider — right edge */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full min-h-[50dvh] md:min-h-[100dvh] px-8 pb-16 pt-32 md:px-14 md:pb-20">
            {/* Icon */}
            <div
              className="mb-6 inline-flex"
              style={{
                transform: hovered === 'maritime' ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.4s ease',
              }}
            >
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm">
                <Ship className="text-emerald-300 w-8 h-8" />
              </div>
            </div>

            {/* Label */}
            <div className="mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/70">
                {lang === 'el' ? 'Κατηγορία' : 'Vertical'} 01
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
              {t.verticalMaritime}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
              {t.verticalMaritimeDesc}
            </p>

            {/* CTA row */}
            <div
              className="flex items-center gap-3"
              style={{
                opacity: hovered === 'maritime' ? 1 : 0.5,
                transform: hovered === 'maritime' ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <span className="text-emerald-400 text-sm font-bold">
                {lang === 'el' ? 'Είσοδος' : lang === 'tr' ? 'Giriş' : 'Enter'}
              </span>
              <ArrowRight className="text-emerald-400 w-4 h-4" />
            </div>
          </div>
        </button>

        {/* ── ROAD ── */}
        <button
          type="button"
          onClick={() => onSelect('road')}
          onMouseEnter={() => setHovered('road')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: hovered === 'road' ? '0 0 62%' : hovered === 'maritime' ? '0 0 38%' : '0 0 50%',
            transition: 'flex 0.55s cubic-bezier(0.65,0,0.35,1)',
          }}
          className="relative group text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Επιλογή κατηγορίας: Road"
        >
          {/* Road/asphalt gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(155deg, #0a1525 0%, #071020 40%, #040d1a 70%, #080e14 100%)',
            }}
          />
          {/* Headlight glow */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 70% 70%, rgba(59,130,246,0.22) 0%, transparent 70%)',
              transition: 'opacity 0.5s ease',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: hovered === 'road' ? 0.6 : 0,
              background: 'radial-gradient(ellipse 90% 70% at 80% 80%, rgba(59,130,246,0.32) 0%, transparent 65%)',
              transition: 'opacity 0.5s ease',
            }}
          />
          {/* Scan lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full min-h-[50dvh] md:min-h-[100dvh] px-8 pb-16 pt-16 md:px-14 md:pb-20">
            {/* Icon */}
            <div
              className="mb-6 inline-flex"
              style={{
                transform: hovered === 'road' ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.4s ease',
              }}
            >
              <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm">
                <Truck className="text-blue-300 w-8 h-8" />
              </div>
            </div>

            <div className="mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">
                {lang === 'el' ? 'Κατηγορία' : 'Vertical'} 02
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
              {t.verticalRoad}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
              {t.verticalRoadDesc}
            </p>

            <div
              className="flex items-center gap-3"
              style={{
                opacity: hovered === 'road' ? 1 : 0.5,
                transform: hovered === 'road' ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <span className="text-blue-400 text-sm font-bold">
                {lang === 'el' ? 'Είσοδος' : lang === 'tr' ? 'Giriş' : 'Enter'}
              </span>
              <ArrowRight className="text-blue-400 w-4 h-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default VerticalSelect;
