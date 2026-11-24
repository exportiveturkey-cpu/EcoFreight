import React, { useMemo, useState } from 'react';
import { Leaf, Info, Fuel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, translations } from '../services/i18n';
import { DEFAULT_EU_ETS_CARBON_PRICE, getGreenFleetMethanolReferenceCases } from '../services/carbon';
import { formatEUR } from '../services/formatters';

interface GreenFleetReferencePanelProps {
  lang: Language;
}

const FUEL_PREMIUM_TIERS = [190, 290, 380];
const ETS_PRICE_TIERS = [85, 120, 150];

const GreenFleetReferencePanel: React.FC<GreenFleetReferencePanelProps> = ({ lang }) => {
  const t = translations[lang] || translations.en;
  const [fuelPremiumEurPerTonne, setFuelPremiumEurPerTonne] = useState<number>(290);
  const [etsPriceEurPerTonne, setEtsPriceEurPerTonne] = useState<number>(DEFAULT_EU_ETS_CARBON_PRICE);

  const cases = useMemo(
    () => getGreenFleetMethanolReferenceCases(etsPriceEurPerTonne, fuelPremiumEurPerTonne),
    [etsPriceEurPerTonne, fuelPremiumEurPerTonne]
  );

  const chartData = useMemo(
    () =>
      cases.map((c) => ({
        name:
          c.id === 'conventional_vlsfo'
            ? 'VLSFO'
            : c.id === 'methanol_ready_bridge'
              ? 'MeOH-Ready'
              : 'e-Methanol',
        [t.charterCapexCol]: c.baseCharterRateEurPerTeu + c.capexReadinessPremiumEurPerTeu,
        [t.greenFuelPremCol]: c.greenFuelPremiumEurPerTeu,
        [t.euEtsLiabilityLabel]: Math.max(0, c.euEtsCostEurPerTeu + Math.max(0, c.fuelEuBalanceEurPerTeu))
      })),
    [cases, t]
  );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Fuel size={18} className="text-emerald-600 shrink-0" />
            <h2 className="text-base font-extrabold text-slate-900">{t.greenFleetRefTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.greenFleetRefDesc}</p>
          <p className="text-[11px] font-semibold text-blue-700 mt-1.5 flex items-center gap-1.5">
            <Info size={13} className="shrink-0" />
            <span>{t.referenceCaseNotice}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 px-2">{t.greenFuelPremiumLabel}:</span>
            {FUEL_PREMIUM_TIERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFuelPremiumEurPerTonne(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-bold transition-colors ${
                  fuelPremiumEurPerTonne === p
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                +€{p}/t
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 px-2">EU ETS:</span>
            {ETS_PRICE_TIERS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEtsPriceEurPerTonne(e)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums font-bold transition-colors ${
                  etsPriceEurPerTonne === e
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                €{e}/t
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                <th className="py-2.5 px-3">{t.vesselPathwayCol}</th>
                <th className="py-2.5 px-2 text-right">{t.wtwIntensityCol}</th>
                <th className="py-2.5 px-2 text-center">{t.ciiRatingLabel}</th>
                <th className="py-2.5 px-2 text-right">{t.charterCapexCol}</th>
                <th className="py-2.5 px-2 text-right">{t.greenFuelPremCol}</th>
                <th className="py-2.5 px-2 text-right">{t.netsComplianceCol}</th>
                <th className="py-2.5 px-2 text-right">{t.netAllInCostCol}</th>
                <th className="py-2.5 px-3 text-right">{t.premiumVsConvCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {cases.map((c) => {
                const netCompliance = c.euEtsCostEurPerTeu + c.fuelEuBalanceEurPerTeu - c.greenRebateEurPerTeu;
                return (
                  <tr
                    key={c.id}
                    className={c.isPremiumCase ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3 px-3 font-sans">
                      <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        {c.isPremiumCase && <Leaf size={13} className="text-emerald-600 shrink-0" />}
                        <span>{c.vesselProfile}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">{c.fuelPathway}</p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-bold ${c.co2ReductionPct >= 50 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {c.wtwIntensityGPerMj.toFixed(1)} g/MJ
                      </span>
                      {c.co2ReductionPct > 0 && (
                        <span className="block text-[10px] text-emerald-700 font-bold">
                          -{c.co2ReductionPct}% CO₂e
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-black text-slate-900">{c.ciiGrade}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-slate-800">
                      {formatEUR(c.baseCharterRateEurPerTeu, 0)}
                      {c.capexReadinessPremiumEurPerTeu > 0 && (
                        <span className="block text-[10px] text-blue-700">
                          +{formatEUR(c.capexReadinessPremiumEurPerTeu, 0)} CAPEX
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {c.greenFuelPremiumEurPerTeu > 0 ? (
                        <span className="font-bold text-amber-700">
                          +{formatEUR(c.greenFuelPremiumEurPerTeu, 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400">€0</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={netCompliance <= 0 ? 'font-bold text-emerald-700' : 'text-slate-700'}>
                        {netCompliance > 0 ? '+' : ''}
                        {formatEUR(netCompliance, 0)}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        ETS {formatEUR(c.euEtsCostEurPerTeu, 0)} · FuelEU{' '}
                        {c.fuelEuBalanceEurPerTeu > 0 ? `+${c.fuelEuBalanceEurPerTeu}` : c.fuelEuBalanceEurPerTeu}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-slate-900">
                      {formatEUR(c.netAllInCostEurPerTeu, 0)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.id === 'conventional_vlsfo' ? (
                        <span className="text-slate-500">Baseline</span>
                      ) : (
                        <>
                          <span className="font-extrabold text-indigo-700">
                            {c.netPremiumVsConventionalEurPerTeu >= 0 ? '+' : ''}
                            {formatEUR(c.netPremiumVsConventionalEurPerTeu, 0)} ({c.netPremiumPct >= 0 ? '+' : ''}
                            {c.netPremiumPct}%)
                          </span>
                          {c.abatementCostEurPerTonne !== null && (
                            <span className="block text-[10px] text-slate-500">
                              €{c.abatementCostEurPerTonne}/t CO₂
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-4 h-56 lg:h-auto min-h-[210px] flex flex-col justify-between">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip formatter={(val: any, name: any) => [formatEUR(Number(val), 0), name]} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey={t.charterCapexCol} stackId="ref" fill="#334155" />
              <Bar dataKey={t.greenFuelPremCol} stackId="ref" fill="#f59e0b" />
              <Bar dataKey={t.euEtsLiabilityLabel} stackId="ref" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GreenFleetReferencePanel;
