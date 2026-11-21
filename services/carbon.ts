
import { TransportMode, RouteCostOption } from '../types';

/**
 * Average CO2e emission factors (kg CO2e per tonne-km)
 * Indicative factors, NOT GLEC-verified. Confirm the source before client use.
 */
export const EMISSION_FACTORS: Record<string, number> = {
  [TransportMode.AIR]: 1.13,   // Long-haul air freight
  [TransportMode.ROAD]: 0.105, // Heavy-duty truck (Euro 6 Diesel)
  [TransportMode.RAIL]: 0.025, // Electrified/mixed freight rail
  [TransportMode.SEA]: 0.012,  // Container vessel
  SEA_RAIL: 0.017              // Short-sea + electric rail intermodal
};

export const DEFAULT_EU_ETS_CARBON_PRICE = 85; // €85 per tonne CO2e

export const CARBON_PRICE_PRESETS = [
  { id: 'eu-ets', label: 'EU ETS / CBAM', price: 85 },
  { id: 'shadow', label: 'Internal Shadow Price', price: 110 },
  { id: 'offset', label: 'Voluntary VCS Offset', price: 25 }
];

export const calculateLegEmissions = (
  mode: TransportMode,
  distanceKm: number,
  weightTonnes: number
): number => {
  const factor = EMISSION_FACTORS[mode] ?? 0.05;
  return parseFloat((weightTonnes * distanceKm * factor).toFixed(2));
};

export const getOffsetPrice = (emissionsKg: number, pricePerTonneEur = 25): number => {
  return parseFloat(((emissionsKg / 1000) * pricePerTonneEur).toFixed(2));
};

export const calculateCO2Cost = (emissionsKg: number, carbonPricePerTonne: number): number => {
  return Math.round((emissionsKg / 1000) * carbonPricePerTonne);
};

export const recalculateRouteWithPricing = (
  route: RouteCostOption,
  carbonPricePerTonne: number,
  fuelMultiplier: number = 1
): RouteCostOption => {
  const adjustedFuelCost = Math.round(route.fuelCost * fuelMultiplier);
  const co2Cost = calculateCO2Cost(route.estimatedEmissionsKg, carbonPricePerTonne);
  const fuelPlusCo2Cost = adjustedFuelCost + co2Cost;
  const estimatedCost = route.baseFreightCost + fuelPlusCo2Cost;
  return {
    ...route,
    fuelCost: adjustedFuelCost,
    co2Cost,
    fuelPlusCo2Cost,
    estimatedCost
  };
};

export const estimateCorridorDistanceKm = (origin: string, destination: string): number => {
  const o = (origin || '').toLowerCase();
  const d = (destination || '').toLowerCase();

  if ((o.includes('rotterdam') || o.includes('nl') || o.includes('hamburg')) && (d.includes('singapore') || d.includes('sg') || d.includes('shanghai'))) {
    return 15500;
  }
  if ((o.includes('piraeus') || o.includes('athens') || o.includes('gr')) && (d.includes('hamburg') || d.includes('rotterdam') || d.includes('de'))) {
    return 2350;
  }
  if ((o.includes('thessaloniki') || o.includes('gr')) && (d.includes('milan') || d.includes('munich') || d.includes('it'))) {
    return 1450;
  }
  if ((o.includes('istanbul') || o.includes('tr')) && (d.includes('munich') || d.includes('frankfurt') || d.includes('de'))) {
    return 1920;
  }
  if ((o.includes('valencia') || o.includes('es')) && (d.includes('munich') || d.includes('de'))) {
    return 1570;
  }
  if ((o.includes('gothenburg') || o.includes('se')) && (d.includes('antwerp') || d.includes('be'))) {
    return 1150;
  }
  return 2100;
};

export const buildDeterministicRouteOptions = (
  origin: string,
  destination: string,
  weightTonnes: number,
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE,
  fuelMultiplier: number = 1
): RouteCostOption[] => {
  const w = Math.max(0.5, Number(weightTonnes) || 1);
  const baseKm = estimateCorridorDistanceKm(origin, destination);

  const specs = [
    {
      mode: 'SEA',
      distFactor: 1.18,
      daysPer1000Km: 2.8,
      minDays: 4,
      baseRatePerTKm: 0.022,
      minBase: 480,
      fuelRatePerTKm: 0.011,
      minFuel: 190,
      fuelUnit: 'L VLSFO',
      fuelAmountFactor: 0.0042,
      emissionFactor: EMISSION_FACTORS[TransportMode.SEA],
      label: 'All-Sea Maritime Corridor',
      reasoning: 'Deep-sea or short-sea feeder vessel minimizes fuel burn per tonne-km and keeps EU ETS CO2 exposure lowest.'
    },
    {
      mode: 'SEA_RAIL',
      distFactor: 1.06,
      daysPer1000Km: 1.9,
      minDays: 3,
      baseRatePerTKm: 0.029,
      minBase: 560,
      fuelRatePerTKm: 0.014,
      minFuel: 230,
      fuelUnit: 'Mixed (VLSFO + kWh)',
      fuelAmountFactor: 0.005,
      emissionFactor: EMISSION_FACTORS.SEA_RAIL,
      label: 'Sea + Electric Rail Intermodal',
      reasoning: 'Combines coastal maritime efficiency with electrified inland rail to balance lead time, fuel spend, and carbon cost.'
    },
    {
      mode: 'RAIL',
      distFactor: 1.02,
      daysPer1000Km: 1.45,
      minDays: 2,
      baseRatePerTKm: 0.036,
      minBase: 640,
      fuelRatePerTKm: 0.017,
      minFuel: 260,
      fuelUnit: 'kWh',
      fuelAmountFactor: 0.022,
      emissionFactor: EMISSION_FACTORS[TransportMode.RAIL],
      label: 'Direct Electric Rail Corridor',
      reasoning: 'High traction energy stability shields against diesel volatility while maintaining low Scope 3 CO2 liabilities.'
    },
    {
      mode: 'ROAD',
      distFactor: 1.0,
      daysPer1000Km: 1.1,
      minDays: 1,
      baseRatePerTKm: 0.044,
      minBase: 690,
      fuelRatePerTKm: 0.046,
      minFuel: 420,
      fuelUnit: 'L Diesel',
      fuelAmountFactor: 0.028,
      emissionFactor: EMISSION_FACTORS[TransportMode.ROAD],
      label: 'Direct Heavy-Duty Road',
      reasoning: 'Door-to-door flexibility, but exposed to steep diesel surcharges and high CO2 compliance costs.'
    },
    {
      mode: 'AIR',
      distFactor: 0.92,
      daysPer1000Km: 0.25,
      minDays: 1,
      baseRatePerTKm: 0.22,
      minBase: 1450,
      fuelRatePerTKm: 0.26,
      minFuel: 1300,
      fuelUnit: 'L Jet-A1',
      fuelAmountFactor: 0.32,
      emissionFactor: EMISSION_FACTORS[TransportMode.AIR],
      label: 'Express Air Freight',
      reasoning: 'Shortest transit window for time-critical cargo, carrying maximum Jet-A1 fuel and carbon cost overhead.'
    }
  ];

  return specs.map((spec) => {
    const distanceKm = Math.round(baseKm * spec.distFactor);
    const estimatedDays = Math.max(spec.minDays, Math.round((distanceKm / 1000) * spec.daysPer1000Km));
    const baseFreightCost = Math.round(Math.max(spec.minBase, distanceKm * w * spec.baseRatePerTKm));
    const fuelCost = Math.round(Math.max(spec.minFuel, distanceKm * w * spec.fuelRatePerTKm) * fuelMultiplier);
    const estimatedEmissionsKg = Math.round(distanceKm * w * spec.emissionFactor);
    const co2Cost = calculateCO2Cost(estimatedEmissionsKg, carbonPricePerTonne);
    const fuelPlusCo2Cost = fuelCost + co2Cost;
    const estimatedCost = baseFreightCost + fuelPlusCo2Cost;
    const fuelConsumption = Math.round(distanceKm * w * spec.fuelAmountFactor);

    return {
      mode: spec.mode,
      estimatedDays,
      estimatedDistanceKm: distanceKm,
      baseFreightCost,
      fuelCost,
      co2Cost,
      fuelPlusCo2Cost,
      estimatedCost,
      estimatedEmissionsKg,
      fuelConsumption,
      fuelUnit: spec.fuelUnit,
      label: spec.label,
      reasoning: spec.reasoning
    };
  });
};
