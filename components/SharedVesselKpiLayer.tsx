import React, { useMemo, useState } from 'react';
import { Ship, Anchor, BookOpenCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Shipment, VesselType } from '../types';
import { Language, translations } from '../services/i18n';
import {
  DEFAULT_EU_ETS_CARBON_PRICE,
  getSharedVesselKpis,
  getVesselTypeSpec
} from '../services/carbon';
import { formatEUR, formatEmissions, formatNumber } from '../services/formatters';

interface SharedVesselKpiLayerProps {
  shipments: Shipment[];
  lang: Language;
  highlightVesselType?: VesselType | null;
  compact?: boolean;
}

const SharedVesselKpiLayer: React.FC<SharedVesselKpiLayerProps> = ({
  shipments,
  lang,
  highlightVesselType = null,
  compact = false
}) => {
  const t = translations[lang] || translations.en;
  const [serviceFilter, setServiceFilter] = useState<'ALL' | 'LINER' | 'TRAMP'>('ALL');
  const [showFormulas, setShowFormulas] = useState(false);

  const allRows = useMemo(
    () => getSharedVesselKpis(shipments, DEFAULT_EU_ETS_CARBON_PRICE),
    [shipments]
  );

  const rows = useMemo(() => {
    if (serviceFilter === 'ALL') return allRows;
    return allRows.filter((r) => r.serviceType === serviceFilter);
  }, [allRows, serviceFilter]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Ship size={18} className="text-blue-600 shrink-0" />
            <h2 className="text-base font-extrabold text-slate-900">{t.sharedVesselKpiTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.sharedVesselKpiDesc}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {([
              ['ALL', t.seaFilterAll],
              ['LINER', t.seaFilterLiner],
              ['TRAMP', t.seaFilterTramp]
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setServiceFilter(key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  serviceFilter === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFormulas((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              showFormulas
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpenCheck size={14} />
            <span>{t.formulaTransparencyBtn}</span>
            {showFormulas ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {showFormulas && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <p className="font-bold text-slate-900">{t.sharedTransparencyLayerLabel}</p>
          <p className="text-slate-600">{t.formulaTransparencyNote}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 font-mono tabular-nums text-[11px]">
            <div>
              <span className="font-sans font-bold text-slate-500 block">1. GLEC v3.0 CO₂e</span>
              <span>km × tonnes × EF_WTW (TTW + WTT)</span>
            </div>
            <div>
              <span className="font-sans font-bold text-slate-500 block">2. IMO EEXI &amp; CII + TCE</span>
              <span>TCE = (Freight Rev − Voyage Exp) ÷ Days</span>
            </div>
            <div>
              <span className="font-sans font-bold text-slate-500 block">3. Trip ESG Cost</span>
              <span>EU ETS + FuelEU Balance + Dwell + VCS − Rebate</span>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
              <th className="py-2.5 px-3">{t.vesselNameImoCol}</th>
              <th className="py-2.5 px-2">{t.serviceClassCol}</th>
              {!compact && <th className="py-2.5 px-2 text-right">{t.tripsCargoCol}</th>}
              <th className="py-2.5 px-2 text-right">{t.co2PerTripCol}</th>
              <th className="py-2.5 px-2 text-right">{t.reliabilityOtifCol}</th>
              <th className="py-2.5 px-2 text-center">{t.ciiRatingLabel} / EEXI</th>
              <th className="py-2.5 px-2 text-right">{t.tcePerDayLabel}</th>
              <th className="py-2.5 px-3 text-right">{t.totalEsgCostTripLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {rows.map((row) => {
              const spec = getVesselTypeSpec(row.vesselType);
              const isHighlighted = highlightVesselType === row.vesselType;
              const isLiner = row.serviceType === 'LINER';
              return (
                <tr
                  key={row.vesselType}
                  className={isHighlighted ? 'bg-blue-50/60' : 'hover:bg-slate-50'}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      {isLiner ? (
                        <Ship size={14} className="text-blue-600 shrink-0" />
                      ) : (
                        <Anchor size={14} className="text-indigo-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {row.vesselName}{' '}
                          <span className="font-mono text-[11px] font-normal text-slate-500">
                            ({row.imoNumber})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">{t[spec.labelKey]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-sans">
                    <span className={`font-bold ${isLiner ? 'text-blue-700' : 'text-indigo-700'}`}>
                      {isLiner ? t.linerServiceLabel : t.trampServiceLabel}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-500">
                      {row.linerLineCode ? `${row.linerLineCode} · ` : ''}
                      {row.capacityLabel} · {row.defaultSpeedKts} kts
                    </span>
                  </td>
                  {!compact && (
                    <td className="py-2.5 px-2 text-right">
                      {row.shipmentsCount > 0 ? (
                        <>
                          <span className="font-bold text-slate-900">
                            {row.shipmentsCount} {t.liveFleetLabel}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {formatNumber(row.totalTonnes, 1)}t · {formatNumber(row.totalTeuKm)} TEU-km
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-500">{t.benchmarkLabel}</span>
                          <span className="block text-[10px] text-slate-400">0 active trips</span>
                        </>
                      )}
                    </td>
                  )}
                  <td className="py-2.5 px-2 text-right">
                    <span className="font-bold text-emerald-700">
                      {formatEmissions(row.avgCo2PerTripKg)}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {row.glecWtwKgPerTkm.toFixed(3)} kg/t·km
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span
                      className={`font-bold ${
                        row.scheduleReliabilityPct >= 88 ? 'text-teal-700' : 'text-amber-700'
                      }`}
                    >
                      {row.scheduleReliabilityPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-black text-slate-900">
                      {row.ciiGrade}{' '}
                      <span className="font-normal text-slate-500">({row.ciiRatio.toFixed(2)})</span>
                    </span>
                    <span className="block text-[10px] text-emerald-700">
                      EEXI -{row.eexiMarginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="font-bold text-teal-700">
                      {formatEUR(row.avgTceEurPerDay, 0)}/d
                    </span>
                    <span
                      className={`block text-[10px] ${
                        row.avgTceSpreadEurPerDay >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {row.avgTceSpreadEurPerDay >= 0 ? '+' : ''}
                      {formatEUR(row.avgTceSpreadEurPerDay, 0)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-extrabold text-indigo-700">
                      {formatEUR(row.avgEsgCostPerTripEur, 0)}
                    </span>
                    <span className="block text-[10px] text-slate-500">{row.esgSharePct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharedVesselKpiLayer;
