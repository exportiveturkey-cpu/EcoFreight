import React from 'react';
import { BookOpenCheck, X } from 'lucide-react';
import { GLEC_FRAMEWORK_METADATA, GLEC_MODE_FACTORS, getGlecFactorSpec } from '../services/carbon';
import { formatNumber } from '../services/formatters';
import { Language, translations } from '../services/i18n';

export interface GlecLiveExample {
  label: string;
  mode: string;
  distanceKm: number;
  weightTonnes: number;
  ttwKg: number;
  wttKg: number;
  totalKg: number;
  dwellHours?: number;
  dwellKg?: number;
  linehaulKg?: number;
}

interface GlecMethodPanelProps {
  lang: Language;
  liveExample?: GlecLiveExample | null;
  highlightMode?: string;
  onClose?: () => void;
  compact?: boolean;
}

const getModeDisplay = (mode: string, t: typeof translations['en']) => {
  switch (mode) {
    case 'SEA':
      return t.sea;
    case 'SEA_RAIL':
      return `${t.sea} + ${t.rail}`;
    case 'RAIL':
      return t.rail;
    case 'ROAD':
      return t.road;
    case 'AIR':
      return t.air;
    default:
      return mode;
  }
};

const GlecMethodPanel: React.FC<GlecMethodPanelProps> = ({
  lang,
  liveExample,
  highlightMode,
  onClose,
  compact = false
}) => {
  const t = translations[lang] || translations.en;
  const factors = Object.values(GLEC_MODE_FACTORS);
  const exampleSpec = liveExample ? getGlecFactorSpec(liveExample.mode) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
            <BookOpenCheck size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.glecMethodTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.glecMethodSubtitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={t.close}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Standard, Boundary & Core Formula Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[11px] font-semibold text-slate-500">{t.glecStandardLabel}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {GLEC_FRAMEWORK_METADATA.framework} · {GLEC_FRAMEWORK_METADATA.standard}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500">{t.glecBoundaryLabel}</p>
          <p className="text-sm font-bold text-emerald-700 mt-1">
            {GLEC_FRAMEWORK_METADATA.boundary}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500">{t.glecFormulaLabel}</p>
          <p className="text-xs font-mono tabular-nums font-semibold text-slate-800 mt-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {GLEC_FRAMEWORK_METADATA.formula}
          </p>
        </div>
      </div>

      {/* Optional Live Worked Example */}
      {liveExample && exampleSpec && (
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-emerald-800">
              {t.glecLiveCalculation} · {liveExample.label}
            </p>
            <p className="text-xs font-mono tabular-nums text-slate-700">
              {formatNumber(liveExample.distanceKm)} km × {formatNumber(liveExample.weightTonnes, 1)} t ×{' '}
              <span className="font-bold text-emerald-800">{exampleSpec.wtw.toFixed(3)}</span> kg/t·km
              {liveExample.dwellKg && liveExample.dwellKg > 0 ? (
                <>
                  {' '}
                  = {formatNumber(liveExample.linehaulKg ?? liveExample.totalKg - liveExample.dwellKg)} kg +{' '}
                  <span className="text-rose-700 font-bold">
                    {formatNumber(liveExample.dwellKg)} kg ({t.dwellTimeHours}: {liveExample.dwellHours ?? 0}h)
                  </span>{' '}
                  = <span className="font-extrabold text-slate-900">{formatNumber(liveExample.totalKg)} kg CO2e</span>
                </>
              ) : (
                <>
                  {' '}
                  = <span className="font-extrabold text-slate-900">{formatNumber(liveExample.totalKg)} kg CO2e</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{t.glecTtwLabel}</span>
              <span className="font-bold text-slate-800">{formatNumber(liveExample.ttwKg)} kg</span>
            </div>
            <span className="text-slate-300">+</span>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{t.glecWttLabel}</span>
              <span className="font-bold text-slate-800">{formatNumber(liveExample.wttKg)} kg</span>
            </div>
            <span className="text-slate-300">=</span>
            <div>
              <span className="text-emerald-700 block text-[10px] font-sans font-semibold">WTW Total</span>
              <span className="font-extrabold text-emerald-800">{formatNumber(liveExample.totalKg)} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Emission Factors Table */}
      {!compact && (
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 mb-2.5">{t.glecFactorsTableTitle}</p>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                  <th className="py-2.5 px-3">{t.mode}</th>
                  <th className="py-2.5 px-3">{t.glecTocSource}</th>
                  <th className="py-2.5 px-3 text-right">{t.glecTtwLabel}</th>
                  <th className="py-2.5 px-3 text-right">{t.glecWttLabel}</th>
                  <th className="py-2.5 px-3 text-right">{t.glecTotalWtwLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {factors.map((spec) => {
                  const isHighlighted = highlightMode === spec.mode;
                  return (
                    <tr key={spec.mode} className={isHighlighted ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {getModeDisplay(spec.mode, t)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{spec.tocSource}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                        {spec.ttw.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                        {spec.wtt.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-extrabold text-emerald-700">
                        {spec.wtw.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlecMethodPanel;
