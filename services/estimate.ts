/**
 * Rough operating figures for an ordered route. Every number here is an
 * estimate: the distance comes from great-circle hops between stops, so the
 * road factor and the fixed averages below stand in for real road data. The
 * assumptions are exported so the UI can show them next to the figures.
 */
export const ROUTE_ASSUMPTIONS = {
  /** Average urban speed, km/h. */
  speedKmh: 25,
  /** Service time at each stop, minutes. */
  minutesPerStop: 8,
  /** Diesel price, € per litre. */
  fuelPricePerLitre: 1.8,
  /** Road distance over straight-line distance. */
  roadFactor: 1.35,
  /** Van consumption, litres per 100 km. */
  litresPer100Km: 10,
} as const;

export interface RouteEstimate {
  roadKm: number;
  minutes: number;
  litres: number;
  fuelCost: number;
}

export function estimateRoute(straightLineKm: number, stopCount: number): RouteEstimate {
  const a = ROUTE_ASSUMPTIONS;
  const roadKm = straightLineKm * a.roadFactor;
  const litres = (roadKm * a.litresPer100Km) / 100;

  return {
    roadKm: Math.round(roadKm * 10) / 10,
    minutes: Math.round((roadKm / a.speedKmh) * 60 + stopCount * a.minutesPerStop),
    litres: Math.round(litres * 10) / 10,
    fuelCost: Math.round(litres * a.fuelPricePerLitre * 100) / 100,
  };
}

/** "2 ώρ. 15 λ." — duration in Greek, as shown in the UI. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} ώρ. ${m} λ.` : `${m} λ.`;
}
