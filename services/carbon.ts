
import { TransportMode, RouteCostOption, Shipment } from '../types';

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

export const estimateTeuFromCargo = (weightTonnes: number, volumeCbm?: number): number => {
  const w = Math.max(0.1, Number(weightTonnes) || 1);
  const v = Math.max(0.1, Number(volumeCbm) || w * 2.4);
  // Standard 20ft container (1 TEU): ~14 tonnes typical cargo payload / ~28 cbm usable volume
  return Math.max(1, Math.ceil(Math.max(w / 14, v / 28)));
};

export const calculateTeuKm = (distanceKm: number, containers: number): number => {
  return Math.round(Math.max(0, Number(distanceKm) || 0) * Math.max(0, Number(containers) || 0));
};

export const getShipmentDistanceKm = (shipment: Shipment): number => {
  return (shipment.legs || []).reduce((sum, l) => sum + (Number(l.distanceKm) || 0), 0);
};

export const getShipmentContainers = (shipment: Shipment): number => {
  if (shipment.containers && shipment.containers > 0) return shipment.containers;
  return estimateTeuFromCargo(shipment.weightTonnes, shipment.volumeCbm);
};

export const getShipmentTeuKm = (shipment: Shipment): number => {
  return calculateTeuKm(getShipmentDistanceKm(shipment), getShipmentContainers(shipment));
};

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

export const getSinglePortBaseFee = (location: string): number => {
  const loc = (location || '').toLowerCase();
  if (loc.includes('singapore') || loc.includes('shanghai')) return 410;
  if (loc.includes('rotterdam') || loc.includes('antwerp')) return 380;
  if (loc.includes('hamburg') || loc.includes('bremen')) return 360;
  if (loc.includes('piraeus') || loc.includes('athens')) return 260;
  if (loc.includes('thessaloniki') || loc.includes('igoumenitsa')) return 210;
  if (loc.includes('istanbul') || loc.includes('izmir') || loc.includes('mersin')) return 240;
  if (loc.includes('valencia') || loc.includes('barcelona')) return 275;
  if (loc.includes('gothenburg') || loc.includes('oslo')) return 310;
  if (loc.includes('milan') || loc.includes('munich') || loc.includes('frankfurt')) return 145;
  return 240;
};

export const estimatePortFees = (
  origin: string,
  destination: string,
  weightTonnes: number
): { originPortFee: number; destinationPortFee: number } => {
  const w = Math.max(0.5, Number(weightTonnes) || 1);
  const tonnageHandling = Math.round(w * 11);
  return {
    originPortFee: getSinglePortBaseFee(origin) + tonnageHandling,
    destinationPortFee: getSinglePortBaseFee(destination) + tonnageHandling
  };
};

export const computeApplicablePortFee = (
  mode: string,
  originPortFee: number,
  destinationPortFee: number,
  applyToAllModes: boolean = false
): number => {
  const oFee = Math.max(0, Number(originPortFee) || 0);
  const dFee = Math.max(0, Number(destinationPortFee) || 0);

  if (mode === 'SEA') {
    return Math.round(oFee + dFee);
  }
  if (mode === 'SEA_RAIL') {
    // Origin maritime port dues + inland intermodal rail terminal discharge (or full if all-modes enabled)
    return applyToAllModes
      ? Math.round(oFee + dFee)
      : Math.round(oFee + dFee * 0.55);
  }
  if (applyToAllModes) {
    // Terminal / dry-port handling charges on Rail / Road / Air when enabled
    return Math.round((oFee + dFee) * 0.5);
  }
  return 0;
};

export const recalculateRouteWithPricing = (
  route: RouteCostOption,
  carbonPricePerTonne: number,
  fuelMultiplier: number = 1,
  originPortFee: number = route.originPortFee ?? 0,
  destinationPortFee: number = route.destinationPortFee ?? 0,
  applyPortFeeToAllModes: boolean = false,
  containersOverride?: number
): RouteCostOption => {
  const adjustedFuelCost = Math.round(route.fuelCost * fuelMultiplier);
  const co2Cost = calculateCO2Cost(route.estimatedEmissionsKg, carbonPricePerTonne);
  const fuelPlusCo2Cost = adjustedFuelCost + co2Cost;
  const portFeeTotal = computeApplicablePortFee(
    route.mode,
    originPortFee,
    destinationPortFee,
    applyPortFeeToAllModes
  );
  const estimatedCost = route.baseFreightCost + fuelPlusCo2Cost + portFeeTotal;
  const containers = Math.max(0.5, Number(containersOverride ?? route.containers) || 1);
  const teuKm = calculateTeuKm(route.estimatedDistanceKm, containers);
  const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
  const emissionsPerTeuKm = teuKm > 0 ? Number((route.estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
  return {
    ...route,
    containers,
    teuKm,
    costPerTeuKm,
    emissionsPerTeuKm,
    fuelCost: adjustedFuelCost,
    co2Cost,
    fuelPlusCo2Cost,
    originPortFee,
    destinationPortFee,
    portFeeTotal,
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
  fuelMultiplier: number = 1,
  customOriginPortFee?: number,
  customDestinationPortFee?: number,
  applyPortFeeToAllModes: boolean = false,
  customContainers?: number
): RouteCostOption[] => {
  const w = Math.max(0.5, Number(weightTonnes) || 1);
  const containers = Math.max(0.5, Number(customContainers ?? estimateTeuFromCargo(w)) || 1);
  const baseKm = estimateCorridorDistanceKm(origin, destination);
  const defaults = estimatePortFees(origin, destination, w);
  const originPortFee = customOriginPortFee ?? defaults.originPortFee;
  const destinationPortFee = customDestinationPortFee ?? defaults.destinationPortFee;

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
      reasoning: 'Combines coastal maritime efficiency with electrified inland rail to balance lead time, port dues, and carbon cost.'
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
      reasoning: 'High traction energy stability shields against diesel volatility and avoids maritime port congestion dues.'
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
      reasoning: 'Door-to-door flexibility without maritime port dues, but exposed to steep diesel and CO2 compliance costs.'
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
    const portFeeTotal = computeApplicablePortFee(
      spec.mode,
      originPortFee,
      destinationPortFee,
      applyPortFeeToAllModes
    );
    const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal;
    const fuelConsumption = Math.round(distanceKm * w * spec.fuelAmountFactor);
    const teuKm = calculateTeuKm(distanceKm, containers);
    const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
    const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;

    return {
      mode: spec.mode,
      estimatedDays,
      estimatedDistanceKm: distanceKm,
      containers,
      teuKm,
      costPerTeuKm,
      emissionsPerTeuKm,
      baseFreightCost,
      fuelCost,
      co2Cost,
      fuelPlusCo2Cost,
      originPortFee,
      destinationPortFee,
      portFeeTotal,
      estimatedCost,
      estimatedEmissionsKg,
      fuelConsumption,
      fuelUnit: spec.fuelUnit,
      label: spec.label,
      reasoning: spec.reasoning
    };
  });
};
