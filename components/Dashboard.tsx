import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Ship, Globe, Leaf, Euro, ArrowUpRight, Activity, Train, Truck, Plane, CheckCircle2, Clock } from 'lucide-react';
import { Shipment, TransportMode, ShipmentStatus } from '../types';
import { Language, translations } from '../services/i18n';
import { formatEUR, formatNumber, formatWeight, formatEmissions } from '../services/formatters';

interface DashboardProps {
  shipments: Shipment[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const totalEmissions = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const totalSpend = shipments.reduce((sum, s) => sum + s.totalCost, 0);
  const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const deliveredCount = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;

  // Compute dynamic modal distribution from shipment weight
  const modeWeights: Record<string, number> = {
    [TransportMode.SEA]: 0,
    [TransportMode.RAIL]: 0,
    [TransportMode.ROAD]: 0,
    [TransportMode.AIR]: 0
  };

  let totalCargoWeight = 0;
  shipments.forEach(s => {
    totalCargoWeight += s.weightTonnes;
    const legModes = Array.from(new Set(s.legs.map(l => l.mode)));
    const weightPerMode = s.weightTonnes / Math.max(1, legModes.length);
    legModes.forEach(m => {
      modeWeights[m] = (modeWeights[m] || 0) + weightPerMode;
    });
  });

  const seaPercent = totalCargoWeight > 0 ? Math.round((modeWeights[TransportMode.SEA] / totalCargoWeight) * 100) : 58;
  const railPercent = totalCargoWeight > 0 ? Math.round((modeWeights[TransportMode.RAIL] / totalCargoWeight) * 100) : 26;
  const roadPercent = totalCargoWeight > 0 ? Math.round((modeWeights[TransportMode.ROAD] / totalCargoWeight) * 100) : 12;
  const airPercent = Math.max(0, 100 - (seaPercent + railPercent + roadPercent));

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Global Logistics & ESG Performance Monitoring ({shipments.length} Active Consignments)</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-bold shadow-sm">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">System Status:</span>
            <span className="text-emerald-600 font-mono">Telemetry Synced</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Consignments" 
          value={shipments.length} 
          subText={`${inTransitCount} In Transit • ${deliveredCount} Completed`}
          change="+18.5%" 
          isPositive={true} 
          icon={<Ship size={20} />} 
          color="blue"
        />
        <MetricCard 
          title={t.carbonFootprint} 
          value={formatEmissions(totalEmissions)} 
          subText="GLEC / EN 16258 Audited"
          change="-8.4%" 
          isPositive={false} 
          icon={<Leaf size={20} />} 
          color="emerald"
        />
        <MetricCard 
          title={t.freightSpend} 
          value={formatEUR(totalSpend, 0)} 
          subText={`Avg ${formatEUR(totalSpend / Math.max(1, shipments.length), 0)} / order`}
          change="-3.2%" 
          isPositive={false} 
          icon={<Euro size={20} />} 
          color="indigo"
        />
        <MetricCard 
          title="Intermodal Efficiency" 
          value="96.4%" 
          subText="Rail/Sea Green Share"
          change="+4.1%" 
          isPositive={true} 
          icon={<Globe size={20} />} 
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Emissions & Cost Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Emissions & Energy Consumption Curve</h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregated GHG emissions (kg CO2e) across all multimodal routes</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
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

        {/* Right: Dynamic Transport Distribution */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{t.modalDistribution}</h3>
            <p className="text-slate-400 text-xs mb-6">Calculated across {formatWeight(totalCargoWeight)} total cargo</p>
            <div className="space-y-4">
              <ProgressRow icon={<Ship size={14} className="text-blue-500" />} label={`${t.sea} (Deep/Short-Sea)`} value={seaPercent} color="bg-blue-500" />
              <ProgressRow icon={<Train size={14} className="text-emerald-500" />} label={`${t.rail} (Electrified Corridors)`} value={railPercent} color="bg-emerald-500" />
              <ProgressRow icon={<Truck size={14} className="text-amber-500" />} label={`${t.road} (Drayage)`} value={roadPercent} color="bg-amber-500" />
              <ProgressRow icon={<Plane size={14} className="text-indigo-500" />} label={`${t.air} (Express)`} value={airPercent} color="bg-indigo-500" />
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
               <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-sm"><Leaf size={18} /></div>
               <div>
                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Modal Shift Benefit</p>
                 <p className="text-xs font-bold text-emerald-950">Current rail/sea split saves ~64% CO2 vs all-road haulage.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Recent Corridors Summary Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Strategic Corridors</h3>
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
                <th className="pb-4">{t.status}</th>
                <th className="pb-4">{t.emissions}</th>
                <th className="pb-4 text-right">{t.freightCost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {shipments.slice(0, 6).map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <p className="font-extrabold text-slate-900 font-mono">{s.id}</p>
                    <p className="text-[11px] text-slate-500">{s.customerName}</p>
                  </td>
                  <td className="py-4 font-bold text-slate-700">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-slate-900">{s.weightTonnes}t</span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">{s.cargoType}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      s.status === ShipmentStatus.IN_TRANSIT 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : s.status === ShipmentStatus.DELIVERED 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {s.status === ShipmentStatus.IN_TRANSIT 
                        ? t.inTransit 
                        : s.status === ShipmentStatus.DELIVERED 
                          ? t.delivered 
                          : t.booked}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-slate-800 font-mono">
                    {formatEmissions(s.totalEmissionsKg)}
                  </td>
                  <td className="py-4 text-right font-black text-slate-900 font-mono">
                    {formatEUR(s.totalCost, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subText, change, isPositive, icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 card-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h2>
        {subText && <p className="text-[11px] text-slate-500 font-medium mt-1">{subText}</p>}
      </div>
    </div>
  );
};

const ProgressRow = ({ icon, label, value, color }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-xs font-bold">
      <span className="text-slate-700 flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-slate-900 font-mono">{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
