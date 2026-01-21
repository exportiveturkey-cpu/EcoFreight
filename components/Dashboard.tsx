
import React from 'react';
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
import { TrendingUp, TrendingDown, Ship, Globe, Leaf, DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import { Shipment } from '../types';
import { Language, translations } from '../services/i18n';

interface DashboardProps {
  shipments: Shipment[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ shipments, lang }) => {
  const t = translations[lang];
  const totalEmissions = shipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0);
  const totalSpend = shipments.reduce((sum, s) => sum + s.totalCost, 0);
  
  const trendData = [
    { name: 'Mon', emissions: 400, cost: 2400 },
    { name: 'Tue', emissions: 300, cost: 1398 },
    { name: 'Wed', emissions: 200, cost: 9800 },
    { name: 'Thu', emissions: 278, cost: 3908 },
    { name: 'Fri', emissions: 189, cost: 4800 },
    { name: 'Sat', emissions: 239, cost: 3800 },
    { name: 'Sun', emissions: 349, cost: 4300 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Global Logistics & ESG Performance Monitoring</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-bold shadow-sm">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">System Status:</span>
            <span className="text-emerald-600">Optimal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t.totalShipments} 
          value={shipments.length} 
          change="+12.5%" 
          isPositive={true} 
          icon={<Ship size={20} />} 
          color="blue"
        />
        <MetricCard 
          title={t.carbonFootprint} 
          value={`${(totalEmissions / 1000).toFixed(2)}t`} 
          change="-4.2%" 
          isPositive={false} 
          icon={<Leaf size={20} />} 
          color="emerald"
        />
        <MetricCard 
          title={t.freightSpend} 
          value={`$${totalSpend.toLocaleString()}`} 
          change="+2.1%" 
          isPositive={true} 
          icon={<DollarSign size={20} />} 
          color="indigo"
        />
        <MetricCard 
          title="Avg Efficiency" 
          value="94%" 
          change="+0.5%" 
          isPositive={true} 
          icon={<Globe size={20} />} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 text-lg">Emissions Trend (Weekly)</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Transport Distribution</h3>
            <p className="text-slate-400 text-xs mb-6">Percentage of cargo by mode</p>
            <div className="space-y-4">
              <ProgressRow label="Maritime" value={72} color="bg-blue-500" />
              <ProgressRow label="Air Freight" value={18} color="bg-indigo-500" />
              <ProgressRow label="Road Transport" value={10} color="bg-emerald-500" />
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
               <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-600"><Leaf size={20} /></div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sustainability Tip</p>
                 <p className="text-xs font-bold text-slate-700">Switching 5% more to Rail could save 12t CO2/mo.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, isPositive, icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 card-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isPositive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</h2>
          <ArrowUpRight size={14} className="text-slate-300" />
        </div>
      </div>
    </div>
  );
};

const ProgressRow = ({ label, value, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
