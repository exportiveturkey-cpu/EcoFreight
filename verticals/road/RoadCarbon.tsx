import React, { useState } from 'react';
import { Translations } from '../../services/i18n';
import { formatNumber } from '../../services/formatters';

// Indicative kg CO2e per km per vehicle. Not verified: the source must be confirmed before any client use.
export const ROAD_FACTORS = {
  van: 0.21,
  truck7: 0.55,
  truck18: 0.8,
  truck40: 0.98,
  evan: 0.04
};

export type VehicleKey = keyof typeof ROAD_FACTORS;

const VEHICLE_LABELS: Record<VehicleKey, keyof Translations> = {
  van: 'vtVan',
  truck7: 'vtTruck7',
  truck18: 'vtTruck18',
  truck40: 'vtTruck40',
  evan: 'vtEVan'
};

export const calculateRoadEmissionsKg = (vehicle: VehicleKey, distanceKm: number): number =>
  parseFloat((distanceKm * ROAD_FACTORS[vehicle]).toFixed(1));

const RoadCarbon = ({ t }: { t: Translations }) => {
  const [vehicle, setVehicle] = useState<VehicleKey>('van');
  const [distanceKm, setDistanceKm] = useState(100);
  const emissionsKg = calculateRoadEmissionsKg(vehicle, distanceKm);

  return (
    <div className="max-w-xl bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.vehicleType}</label>
        <select
          value={vehicle}
          onChange={e => setVehicle(e.target.value as VehicleKey)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800"
        >
          {(Object.keys(ROAD_FACTORS) as VehicleKey[]).map(key => (
            <option key={key} value={key}>{t[VEHICLE_LABELS[key]]}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.distanceKm}</label>
        <input
          type="number"
          min={0}
          value={distanceKm}
          onChange={e => setDistanceKm(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800"
        />
      </div>

      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.emissionsResult}</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatNumber(emissionsKg, 1)}</p>
      </div>

      <p className="text-[11px] text-slate-500">{t.indicativeFactors}</p>
    </div>
  );
};

export default RoadCarbon;
