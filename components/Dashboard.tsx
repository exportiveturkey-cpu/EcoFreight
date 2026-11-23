import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Ship, Leaf, Euro, Activity, Box, BookOpenCheck, Clock } from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types';
import { Language, translations, statusLabel } from '../services/i18n';
import { formatEUR, formatNumber, formatEmissions } from '../services/formatters';
import {
  SCHEDULE_SLA_TARGET_PCT,
  getPortfolioScheduleReliability,
  getScheduleReliabilitySeries,
  getShipmentContainers,
  getShipmentDistanceKm,
  getShipmentScheduleReliability,
  getShipmentSeaServiceType,
  getShipmentTeuKm,
  getVesselTypeSpec,
  isShipmentOnTime
} from '../services/carbon';
import GlecMethodPanel from './GlecMethodPanel';

interface DashboardProps {
  shipments: Shipment[];
  lang: Language;
}

type DashboardSection = 'overview' | 'corridors';

const Dashboard: React.FC<DashboardProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [section, setSection] = useState<DashboardSection>('overview');
  const [showGlecMethod, setShowGlecMethod] = useState(false);
  const [reliabilityRange, setReliabilityRange] = useState<'6M' | '12W'>('6M');

  const totalEmissions = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const totalSpend = shipments.reduce((sum, s) => sum + s.totalCost, 0);
  const totalCargoWeight = shipments.reduce((sum, s) => sum + s.weightTonnes, 0);
  const totalContainers = shipments.reduce((sum, s) => sum + getShipmentContainers(s), 0);
  const totalTeuKm = shipments.reduce((sum, s) => sum + getShipmentTeuKm(s), 0);
  const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const deliveredCount = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;

  const reliabilitySummary = getPortfolioScheduleReliability(shipments);
  const reliabilitySeries = getScheduleReliabilitySeries(shipments, reliabilityRange);

  // Dynamic weekly trend data scaled to actual total portfolio
  const baseAvgDailyEmissions = totalEmissions / 7;
  const baseAvgDailySpend = totalSpend / 7;

  const trendData = [
    { name: 'Mon', emissions: Math.round(baseAvgDailyEmissions * 0.85), cost: Math.round(baseAvgDailySpend * 0.9) },
    { name: 'Tue', emissions: Math.round(baseAvgDailyEmissions * 1.15), cost: Math.round(baseAvgDailySpend * 1.1) },
    { name: 'Wed', emissions: Math.round(baseAvgDailyEmissions * 0.75), cost: Math.round(baseAvgDailySpend * 0.8) },
    { name: 'Thu', emissions: Math.round(baseAvgDailyEmissions * 1.3), cost: Math.round(baseAvgDailySpend * 1.25) },
    { name: 'Fri', emissions: Math.round(baseAvgDailyEmissions * 1.05), cost: Math.round(baseAvgDailySpend * 1.0) },
    { name: 'Sat', emissions: Math.round(baseAvgDailyEmissions * 0.55), cost: Math.round(baseAvgDailySpend * 0.5) },
    { name: 'Sun', emissions: Math.round(baseAvgDailyEmissions * 0.35), cost: Math.round(baseAvgDailySpend * 0.45) },
  ];

  const sections: { id: DashboardSection; label: string }[] = [
    { id: 'overview', label: lang === 'el' ? 'Επισκόπηση' : lang === 'tr' ? 'Genel Bakış' : 'Overview' },
    { id: 'corridors', label: lang === 'el' ? 'Ενεργές διαδρομές' : lang === 'tr' ? 'Aktif Koridorlar' : 'Active corridors' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.dashTitle}</h1>
          <p className="text-slate-500 font-medium">{t.dashSubtitle} ({shipments.length} {t.activeConsignments})</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-bold shadow-sm">
          <Activity size={16} className="text-emerald-500" />
          <span className="text-slate-600 uppercase tracking-wider text-[10px]">System Status:</span>
          <span className="text-emerald-600 font-mono">Telemetry Synced</span>
        </div>
      </div>

      {/* Section switch & GLEC v3.0 Method Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                section === s.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowGlecMethod(v => !v)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
            showGlecMethod
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <BookOpenCheck size={15} />
          <span>{t.glecMethodBtn}</span>
        </button>
      </div>

      {showGlecMethod && (
        <GlecMethodPanel lang={lang} onClose={() => setShowGlecMethod(false)} />
      )}

      {section === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <MetricCard
              title={t.totalShipments}
              value={shipments.length}
              subText={`${inTransitCount} ${t.inTransit} • ${deliveredCount} ${t.completed}`}
              icon={<Ship size={20} />}
              color="blue"
            />
            <MetricCard
              title={t.carbonFootprint}
              value={formatEmissions(totalEmissions)}
              subText={totalCargoWeight > 0 ? `${formatNumber(totalEmissions / totalCargoWeight, 0)} kg/t · ${t.carbonEstimate}` : t.carbonEstimate}
              icon={<Leaf size={20} />}
              color="emerald"
            />
            <MetricCard
              title={t.freightSpend}
              value={formatEUR(totalSpend, 0)}
              subText={totalTeuKm > 0 ? `Avg ${formatEUR(totalSpend / Math.max(1, shipments.length), 0)} · ${formatEUR(totalSpend / totalTeuKm, 2)}/TEU-km` : `Avg ${formatEUR(totalSpend / Math.max(1, shipments.length), 0)} / order`}
              icon={<Euro size={20} />}
              color="indigo"
            />
            <MetricCard
              title={`${t.totalTeuKm} (${t.teuKmFormula})`}
              value={totalTeuKm > 0 ? formatNumber(totalTeuKm) : '—'}
              subText={totalTeuKm > 0 ? `${totalContainers} TEU · ${(totalEmissions / totalTeuKm).toFixed(2)} kg CO2/TEU-km` : `${totalContainers} TEU`}
              icon={<Box size={20} />}
              color="amber"
            />
            <MetricCard
              title={t.scheduleReliability}
              value={reliabilitySummary ? `${reliabilitySummary.overallPct.toFixed(1)}%` : '—'}
              subText={
                reliabilitySummary
                  ? `${reliabilitySummary.onTimeCount}/${reliabilitySummary.totalCount} ${t.onTime} · ${t.avgScheduleDelay}: ${reliabilitySummary.avgDelayHours}h`
                  : t.scheduleReliabilityNote
              }
              icon={<Clock size={20} />}
              color="teal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions Trend */}
            <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800 text-lg">{t.emissionsCurve}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.emissionsCurveDesc}</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorEm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      formatter={(val: any) => [`${formatNumber(val)} kg CO2e`, 'Emissions']}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Schedule Reliability Over Time */}
            <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-lg">{t.reliabilityOverTime}</h3>
                    {reliabilitySummary && (
                      <span className={`text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-md ${
                        reliabilitySummary.deltaPct >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {reliabilitySummary.deltaPct >= 0 ? `+${reliabilitySummary.deltaPct}%` : `${reliabilitySummary.deltaPct}%`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.reliabilityOverTimeDesc}</p>
                </div>
                <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setReliabilityRange('6M')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      reliabilityRange === '6M' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t.months6Label}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReliabilityRange('12W')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      reliabilityRange === '12W' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t.weeks12Label}
                  </button>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reliabilitySeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      domain={[72, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${Number(val).toFixed(1)}%`, name]}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine
                      y={SCHEDULE_SLA_TARGET_PCT}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{ value: t.slaTarget, position: 'insideTopRight', fill: '#64748b', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="overallPct"
                      name={`${t.scheduleReliability} (%)`}
                      stroke="#0f172a"
                      strokeWidth={3}
                      dot={{ r: 3.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="intermodalPct"
                      name={`${t.rail} / Intermodal`}
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="seaPct"
                      name={t.sea}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                {t.scheduleReliabilityNote}
              </p>
            </div>
          </div>
        </>
      )}

      {section === 'corridors' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t.activeCorridors}</h3>
              <p className="text-xs text-slate-400">Live operational snapshot of current multimodal consignment legs</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              {inTransitCount} {t.inTransit}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-4">{t.consignment}</th>
                  <th className="pb-4">{t.originDest}</th>
                  <th className="pb-4">{t.cargoWeight}</th>
                  <th className="pb-4 text-right">{t.teuKm}</th>
                  <th className="pb-4">{t.scheduleAdherence}</th>
                  <th className="pb-4">{t.status}</th>
                  <th className="pb-4">{t.emissions}</th>
                  <th className="pb-4 text-right">{t.freightCost}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {shipments.slice(0, 6).map(s => {
                  const teuKm = getShipmentTeuKm(s);
                  const teuCount = getShipmentContainers(s);
                  const distKm = getShipmentDistanceKm(s);
                  const relPct = getShipmentScheduleReliability(s);
                  const onTime = isShipmentOnTime(s);
                  return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-extrabold text-slate-900 font-mono">{s.id}</p>
                      <p className="text-[11px] text-slate-500">{s.customerName}</p>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-slate-700 block">{s.origin} → {s.destination}</span>
                      {getShipmentSeaServiceType(s) && (
                        <span className="text-[11px] font-medium text-slate-500 block">
                          {getShipmentSeaServiceType(s) === 'TRAMP' ? t.seaTramp : t.seaLiner}
                          {s.vesselType ? ` · ${t[getVesselTypeSpec(s.vesselType).labelKey]}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-slate-900">{s.weightTonnes}t · {teuCount} TEU</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">{s.cargoType}</span>
                    </td>
                    <td className="py-4 text-right font-mono tabular-nums">
                      <span className="font-bold text-slate-900 block">{formatNumber(teuKm)}</span>
                      <span className="text-[10px] text-slate-400">{formatNumber(distKm)} km × {teuCount}</span>
                    </td>
                    <td className="py-4 font-mono tabular-nums">
                      <span className={`font-bold block ${relPct >= SCHEDULE_SLA_TARGET_PCT ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {relPct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {onTime ? t.onTime : `+${s.scheduleDelayHours}h ${t.delayed}`}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.status === ShipmentStatus.IN_TRANSIT
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.status === ShipmentStatus.DELIVERED
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}>
                        {statusLabel(s.status, t)}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-slate-800 font-mono">
                      {formatEmissions(s.totalEmissionsKg)}
                    </td>
                    <td className="py-4 text-right font-black text-slate-900 font-mono">
                      {formatEUR(s.totalCost, 0)}
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

const MetricCard = ({ title, value, subText, icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 card-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colorMap[color] || colorMap.blue}`}>{icon}</div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">{value}</h2>
        {subText && <p className="text-[11px] text-slate-500 font-medium mt-1">{subText}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
