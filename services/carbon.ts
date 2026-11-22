
import { TransportMode, RouteCostOption, Shipment, ScheduleReliabilityPoint, SpeedProfile, CarbonAwareTradeOff } from '../types';

/**
 * GLEC Framework v3.0 / ISO 14083 Well-to-Wheel (WTW) default emission intensity factors
 * Units: kg CO2e per tonne-km (WTW = Tank-to-Wheel TTW + Well-to-Tank WTT)
 */
export interface GlecModeFactorSpec {
  mode: string;
  wtw: number;
  ttw: number;
  wtt: number;
  unit: string;
  tocSource: string;
}

export const GLEC_FRAMEWORK_METADATA = {
  framework: 'GLEC Framework v3.0',
  standard: 'ISO 14083:2023 Aligned',
  boundary: 'Well-to-Wheel (WTW = TTW + WTT)',
  formula: 'CO2e (kg) = Distance (km) × Cargo Mass (t) × EF_WTW (kg CO2e / t·km)'
};

export const GLEC_MODE_FACTORS: Record<string, GlecModeFactorSpec> = {
  [TransportMode.SEA]: {
    mode: TransportMode.SEA,
    wtw: 0.012,
    ttw: 0.010,
    wtt: 0.002,
    unit: 'kg CO2e / t·km',
    tocSource: 'Container Vessel (Deep/Short-Sea VLSFO, GLEC v3.0)'
  },
  SEA_RAIL: {
    mode: 'SEA_RAIL',
    wtw: 0.017,
    ttw: 0.007,
    wtt: 0.010,
    unit: 'kg CO2e / t·km',
    tocSource: 'Maritime + Electrified Rail Intermodal Composite (GLEC v3.0)'
  },
  [TransportMode.RAIL]: {
    mode: TransportMode.RAIL,
    wtw: 0.025,
    ttw: 0.005,
    wtt: 0.020,
    unit: 'kg CO2e / t·km',
    tocSource: 'Electric / Mixed Freight Rail EU Grid (GLEC v3.0)'
  },
  [TransportMode.ROAD]: {
    mode: TransportMode.ROAD,
    wtw: 0.105,
    ttw: 0.084,
    wtt: 0.021,
    unit: 'kg CO2e / t·km',
    tocSource: 'Articulated Heavy-Duty Truck >34t Euro 6 Diesel (GLEC v3.0)'
  },
  [TransportMode.AIR]: {
    mode: TransportMode.AIR,
    wtw: 1.130,
    ttw: 0.920,
    wtt: 0.210,
    unit: 'kg CO2e / t·km',
    tocSource: 'Long-Haul Air Freighter / Mixed Belly Cargo (GLEC v3.0)'
  }
};

export const EMISSION_FACTORS: Record<string, number> = {
  [TransportMode.AIR]: GLEC_MODE_FACTORS[TransportMode.AIR].wtw,
  [TransportMode.ROAD]: GLEC_MODE_FACTORS[TransportMode.ROAD].wtw,
  [TransportMode.RAIL]: GLEC_MODE_FACTORS[TransportMode.RAIL].wtw,
  [TransportMode.SEA]: GLEC_MODE_FACTORS[TransportMode.SEA].wtw,
  SEA_RAIL: GLEC_MODE_FACTORS.SEA_RAIL.wtw
};

export const DEFAULT_EU_ETS_CARBON_PRICE = 85; // €85 per tonne CO2e
export const DEFAULT_PORT_DWELL_HOURS = 24; // 24h standard port dwell baseline
export const DWELL_STORAGE_EUR_PER_TEU_HOUR = 1.5; // Quay demurrage / yard storage (~€36/TEU/day)
export const DWELL_AUX_FUEL_EUR_PER_TEU_HOUR = 0.75; // Vessel hoteling / terminal reefer & gantry fuel

export const DWELL_TIME_PRESETS = [
  { id: 'fast', hours: 0, key: 'dwellPresetFast' },
  { id: 'normal', hours: 24, key: 'dwellPresetNormal' },
  { id: 'moderate', hours: 48, key: 'dwellPresetModerate' },
  { id: 'congested', hours: 72, key: 'dwellPresetCongested' }
] as const;

export const CARBON_PRICE_PRESETS = [
  { id: 'eu-ets', label: 'EU ETS / CBAM', price: 85 },
  { id: 'shadow', label: 'Internal Shadow Price', price: 110 },
  { id: 'offset', label: 'Voluntary VCS Offset', price: 25 }
];

export interface DwellImpactBreakdown {
  dwellHours: number;
  dwellDaysAdded: number;
  dwellOperationalCost: number;
  dwellCo2Cost: number;
  dwellCost: number;
  dwellTtwKg: number;
  dwellWttKg: number;
  dwellEmissionsKg: number;
}

export const getDwellModeShare = (mode: string, applyToAllModes: boolean = false): number => {
  if (mode === 'SEA') return 1.0;
  if (mode === 'SEA_RAIL') return 0.65;
  return applyToAllModes ? 0.25 : 0;
};

export const computeDwellImpact = (
  mode: string,
  dwellTimeHours: number,
  containers: number,
  carbonPricePerTonne: number,
  fuelMultiplier: number = 1,
  applyToAllModes: boolean = false
): DwellImpactBreakdown => {
  const safeHours = Math.max(0, Number(dwellTimeHours) || 0);
  const safeContainers = Math.max(0.5, Number(containers) || 1);
  const share = getDwellModeShare(mode, applyToAllModes);
  const dwellHours = Math.round(safeHours * share);

  if (dwellHours <= 0) {
    return {
      dwellHours: 0,
      dwellDaysAdded: 0,
      dwellOperationalCost: 0,
      dwellCo2Cost: 0,
      dwellCost: 0,
      dwellTtwKg: 0,
      dwellWttKg: 0,
      dwellEmissionsKg: 0
    };
  }

  const isMaritime = mode === 'SEA' || mode === 'SEA_RAIL';
  // GLEC v3.0 auxiliary hoteling / logistics terminal emission intensity (kg CO2e / TEU·h)
  const wtwPerTeuHour = isMaritime ? 2.8 : 1.2;
  const ttwPerTeuHour = isMaritime ? 2.3 : 0.85;

  const dwellEmissionsKg = Math.round(dwellHours * safeContainers * wtwPerTeuHour);
  const dwellTtwKg = Math.round(dwellHours * safeContainers * ttwPerTeuHour);
  const dwellWttKg = Math.max(0, dwellEmissionsKg - dwellTtwKg);
  const dwellCo2Cost = Math.round((dwellEmissionsKg / 1000) * Math.max(0, carbonPricePerTonne));
  const dwellOperationalCost = Math.round(
    dwellHours *
      safeContainers *
      (DWELL_STORAGE_EUR_PER_TEU_HOUR + DWELL_AUX_FUEL_EUR_PER_TEU_HOUR * Math.max(0.3, fuelMultiplier))
  );
  const dwellCost = dwellOperationalCost + dwellCo2Cost;
  const dwellDaysAdded = Number((dwellHours / 24).toFixed(1));

  return {
    dwellHours,
    dwellDaysAdded,
    dwellOperationalCost,
    dwellCo2Cost,
    dwellCost,
    dwellTtwKg,
    dwellWttKg,
    dwellEmissionsKg
  };
};

export const SCHEDULE_SLA_TARGET_PCT = 88.0;

export const MODE_BASELINE_SCHEDULE_RELIABILITY: Record<string, number> = {
  SEA: 88.5,
  SEA_RAIL: 93.0,
  RAIL: 94.5,
  ROAD: 96.0,
  AIR: 98.2
};

export const computeModeScheduleReliability = (
  mode: string,
  dwellTimeHours: number = 0,
  applyToAllModes: boolean = false
): { baselineReliabilityPct: number; scheduleReliabilityPct: number } => {
  const baseline = MODE_BASELINE_SCHEDULE_RELIABILITY[mode] ?? 88.5;
  const share = getDwellModeShare(mode, applyToAllModes);
  const effectiveDwell = Math.max(0, Number(dwellTimeHours) || 0) * share;
  const penalty = Math.min(25, effectiveDwell * 0.18);
  const scheduleReliabilityPct = Number(Math.max(55, baseline - penalty).toFixed(1));
  return {
    baselineReliabilityPct: baseline,
    scheduleReliabilityPct
  };
};

export const getShipmentPrimaryMode = (shipment: Shipment): string => {
  const legs = shipment.legs || [];
  if (legs.length === 0) return TransportMode.SEA;
  const modes = new Set(legs.map((l) => l.mode));
  if (modes.has(TransportMode.SEA) && modes.has(TransportMode.RAIL)) return 'SEA_RAIL';
  return legs[0].mode;
};

export const getShipmentScheduleReliability = (shipment: Shipment): number => {
  if (typeof shipment.scheduleReliabilityPct === 'number' && shipment.scheduleReliabilityPct > 0) {
    return shipment.scheduleReliabilityPct;
  }
  const mode = getShipmentPrimaryMode(shipment);
  const dwell = shipment.dwellTimeHours ?? 0;
  const delayPenalty = Math.min(20, Math.max(0, Number(shipment.scheduleDelayHours) || 0) * 0.45);
  const base = computeModeScheduleReliability(mode, dwell, false).scheduleReliabilityPct;
  return Number(Math.max(55, base - (dwell > 0 ? 0 : delayPenalty)).toFixed(1));
};

export const isShipmentOnTime = (shipment: Shipment): boolean => {
  return (Number(shipment.scheduleDelayHours) || 0) <= 4;
};

export interface PortfolioReliabilitySummary {
  overallPct: number;
  deltaPct: number;
  onTimeCount: number;
  totalCount: number;
  avgDelayHours: number;
}

export const getPortfolioScheduleReliability = (
  shipments: Shipment[]
): PortfolioReliabilitySummary | null => {
  if (!shipments || shipments.length === 0) return null;
  const totalCount = shipments.length;
  const relValues = shipments.map((s) => getShipmentScheduleReliability(s));
  const overallPct = Number((relValues.reduce((a, b) => a + b, 0) / totalCount).toFixed(1));
  const onTimeCount = shipments.filter(isShipmentOnTime).length;
  const avgDelayHours = Number(
    (shipments.reduce((sum, s) => sum + Math.max(0, Number(s.scheduleDelayHours) || 0), 0) / totalCount).toFixed(1)
  );
  const priorMonthBenchmark = 89.2;
  const deltaPct = Number((overallPct - priorMonthBenchmark).toFixed(1));
  return {
    overallPct,
    deltaPct,
    onTimeCount,
    totalCount,
    avgDelayHours
  };
};

export const getScheduleReliabilitySeries = (
  shipments: Shipment[],
  timeframe: '6M' | '12W' = '6M'
): ScheduleReliabilityPoint[] => {
  const avgMode = (modeMatches: (m: string) => boolean, fallback: number) => {
    const matched = shipments.filter((s) => modeMatches(getShipmentPrimaryMode(s)));
    if (matched.length === 0) return fallback;
    const sum = matched.reduce((acc, s) => acc + getShipmentScheduleReliability(s), 0);
    return Number((sum / matched.length).toFixed(1));
  };

  const summary = getPortfolioScheduleReliability(shipments);
  const liveOverall = summary?.overallPct ?? 90.4;
  const liveOnTime = summary?.onTimeCount ?? 0;
  const liveTotal = summary?.totalCount ?? 0;
  const liveAvgDelay = summary?.avgDelayHours ?? 2.8;
  const liveSea = avgMode((m) => m === TransportMode.SEA, 85.2);
  const liveIntermodal = avgMode((m) => m === 'SEA_RAIL' || m === TransportMode.RAIL, 93.4);
  const liveRoad = avgMode((m) => m === TransportMode.ROAD, 95.8);

  if (timeframe === '12W') {
    const baseTotal = Math.max(12, liveTotal);
    return [
      { period: 'W-10', overallPct: 86.8, seaPct: 81.4, intermodalPct: 91.2, roadPct: 94.5, onTimeCount: Math.round(baseTotal * 0.82), totalCount: baseTotal, avgDelayHours: 4.9 },
      { period: 'W-8', overallPct: 87.9, seaPct: 82.6, intermodalPct: 91.8, roadPct: 95.0, onTimeCount: Math.round(baseTotal * 0.85), totalCount: baseTotal, avgDelayHours: 4.3 },
      { period: 'W-6', overallPct: 88.4, seaPct: 83.1, intermodalPct: 92.4, roadPct: 95.2, onTimeCount: Math.round(baseTotal * 0.86), totalCount: baseTotal, avgDelayHours: 3.9 },
      { period: 'W-4', overallPct: 89.6, seaPct: 84.5, intermodalPct: 93.0, roadPct: 95.6, onTimeCount: Math.round(baseTotal * 0.88), totalCount: baseTotal, avgDelayHours: 3.5 },
      { period: 'W-2', overallPct: 89.2, seaPct: 84.0, intermodalPct: 92.8, roadPct: 95.4, onTimeCount: Math.round(baseTotal * 0.87), totalCount: baseTotal, avgDelayHours: 3.4 },
      { period: 'Now', overallPct: liveOverall, seaPct: liveSea, intermodalPct: liveIntermodal, roadPct: liveRoad, onTimeCount: liveOnTime, totalCount: liveTotal, avgDelayHours: liveAvgDelay }
    ];
  }

  const baseTotal = Math.max(14, liveTotal);
  return [
    { period: 'May', overallPct: 85.4, seaPct: 79.8, intermodalPct: 90.4, roadPct: 94.2, onTimeCount: Math.round(baseTotal * 0.81), totalCount: baseTotal, avgDelayHours: 5.6 },
    { period: 'Jun', overallPct: 86.7, seaPct: 81.2, intermodalPct: 91.1, roadPct: 94.8, onTimeCount: Math.round(baseTotal * 0.83), totalCount: baseTotal, avgDelayHours: 4.8 },
    { period: 'Jul', overallPct: 87.9, seaPct: 82.5, intermodalPct: 92.0, roadPct: 95.1, onTimeCount: Math.round(baseTotal * 0.85), totalCount: baseTotal, avgDelayHours: 4.2 },
    { period: 'Aug', overallPct: 88.5, seaPct: 83.4, intermodalPct: 92.5, roadPct: 95.3, onTimeCount: Math.round(baseTotal * 0.86), totalCount: baseTotal, avgDelayHours: 3.9 },
    { period: 'Sep', overallPct: 89.2, seaPct: 84.1, intermodalPct: 92.9, roadPct: 95.6, onTimeCount: Math.round(baseTotal * 0.87), totalCount: baseTotal, avgDelayHours: 3.5 },
    { period: 'Oct', overallPct: liveOverall, seaPct: liveSea, intermodalPct: liveIntermodal, roadPct: liveRoad, onTimeCount: liveOnTime, totalCount: liveTotal, avgDelayHours: liveAvgDelay }
  ];
};

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

export const getGlecFactorSpec = (mode: string): GlecModeFactorSpec => {
  return GLEC_MODE_FACTORS[mode] ?? GLEC_MODE_FACTORS[TransportMode.SEA];
};

export interface GlecEmissionBreakdown {
  mode: string;
  distanceKm: number;
  weightTonnes: number;
  factorWtw: number;
  factorTtw: number;
  factorWtt: number;
  ttwKg: number;
  wttKg: number;
  totalKg: number;
  tocSource: string;
}

export const calculateGlecBreakdown = (
  mode: string,
  distanceKm: number,
  weightTonnes: number
): GlecEmissionBreakdown => {
  const spec = getGlecFactorSpec(mode);
  const d = Math.max(0, Number(distanceKm) || 0);
  const w = Math.max(0, Number(weightTonnes) || 0);
  const ttwKg = Math.round(d * w * spec.ttw);
  const wttKg = Math.round(d * w * spec.wtt);
  const totalKg = Math.round(d * w * spec.wtw);
  return {
    mode,
    distanceKm: d,
    weightTonnes: w,
    factorWtw: spec.wtw,
    factorTtw: spec.ttw,
    factorWtt: spec.wtt,
    ttwKg,
    wttKg,
    totalKg,
    tocSource: spec.tocSource
  };
};

export const getShipmentGlecBreakdown = (shipment: Shipment) => {
  const legs = (shipment.legs || []).map((leg) => {
    const spec = getGlecFactorSpec(leg.mode);
    const glecCalc = calculateGlecBreakdown(leg.mode, leg.distanceKm, shipment.weightTonnes);
    const ratioTtw = spec.wtw > 0 ? spec.ttw / spec.wtw : 0.75;
    const legEmissions = Number(leg.emissionsKg) > 0 ? leg.emissionsKg : glecCalc.totalKg;
    const ttwKg = Math.round(legEmissions * ratioTtw);
    const wttKg = Math.max(0, Math.round(legEmissions - ttwKg));
    return {
      legId: leg.id,
      mode: leg.mode,
      origin: leg.origin,
      destination: leg.destination,
      distanceKm: leg.distanceKm,
      factorWtw: spec.wtw,
      factorTtw: spec.ttw,
      factorWtt: spec.wtt,
      tocSource: spec.tocSource,
      ttwKg,
      wttKg,
      totalKg: Math.round(legEmissions)
    };
  });

  const ttwKg = legs.reduce((s, l) => s + l.ttwKg, 0);
  const wttKg = legs.reduce((s, l) => s + l.wttKg, 0);
  const totalKg = shipment.totalEmissionsKg || legs.reduce((s, l) => s + l.totalKg, 0);

  return {
    legs,
    ttwKg,
    wttKg,
    totalKg
  };
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
  containersOverride?: number,
  dwellTimeHours: number = route.dwellHours ?? DEFAULT_PORT_DWELL_HOURS
): RouteCostOption => {
  const containers = Math.max(0.5, Number(containersOverride ?? route.containers) || 1);
  const adjustedFuelCost = Math.round(route.fuelCost * fuelMultiplier);
  const linehaulEmissionsKg = route.linehaulEmissionsKg ?? Math.max(0, route.estimatedEmissionsKg - (route.dwellEmissionsKg ?? 0));
  const spec = getGlecFactorSpec(route.mode);
  const ratioTtw = spec.wtw > 0 ? spec.ttw / spec.wtw : 0.75;
  const linehaulTtwKg = Math.round(linehaulEmissionsKg * ratioTtw);
  const linehaulWttKg = Math.max(0, Math.round(linehaulEmissionsKg - linehaulTtwKg));

  const dwell = computeDwellImpact(
    route.mode,
    dwellTimeHours,
    containers,
    carbonPricePerTonne,
    fuelMultiplier,
    applyPortFeeToAllModes
  );

  const co2Cost = calculateCO2Cost(linehaulEmissionsKg, carbonPricePerTonne);
  const fuelPlusCo2Cost = adjustedFuelCost + co2Cost;
  const portFeeTotal = computeApplicablePortFee(
    route.mode,
    originPortFee,
    destinationPortFee,
    applyPortFeeToAllModes
  );
  const estimatedCost = route.baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwell.dwellCost;
  const estimatedEmissionsKg = linehaulEmissionsKg + dwell.dwellEmissionsKg;
  const ttwEmissionsKg = linehaulTtwKg + dwell.dwellTtwKg;
  const wttEmissionsKg = linehaulWttKg + dwell.dwellWttKg;
  const baseDays = route.dwellDaysAdded
    ? Math.max(1, Number((route.estimatedDays - route.dwellDaysAdded).toFixed(1)))
    : route.estimatedDays;
  const estimatedDays = Number((baseDays + dwell.dwellDaysAdded).toFixed(1));
  const teuKm = calculateTeuKm(route.estimatedDistanceKm, containers);
  const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
  const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
  const rel = computeModeScheduleReliability(route.mode, dwellTimeHours, applyPortFeeToAllModes);

  return {
    ...route,
    speedProfile: route.speedProfile ?? 'standard',
    estimatedDays,
    dwellHours: dwell.dwellHours,
    dwellDaysAdded: dwell.dwellDaysAdded,
    scheduleReliabilityPct: rel.scheduleReliabilityPct,
    baselineReliabilityPct: rel.baselineReliabilityPct,
    containers,
    teuKm,
    costPerTeuKm,
    emissionsPerTeuKm,
    glecFactorWtw: route.glecFactorWtw ?? spec.wtw,
    ttwEmissionsKg,
    wttEmissionsKg,
    linehaulEmissionsKg,
    dwellEmissionsKg: dwell.dwellEmissionsKg,
    glecSource: route.glecSource ?? spec.tocSource,
    fuelCost: adjustedFuelCost,
    co2Cost,
    fuelPlusCo2Cost,
    originPortFee,
    destinationPortFee,
    portFeeTotal,
    dwellCost: dwell.dwellCost,
    estimatedCost,
    estimatedEmissionsKg
  };
};

interface EcoSpeedModeSpec {
  emissionsMult: number;
  fuelMult: number;
  baseFreightMult: number;
  addedDays: number;
  reliabilityDelta: number;
}

export const ECO_SPEED_SPECS: Record<string, EcoSpeedModeSpec> = {
  SEA: {
    emissionsMult: 0.78, // ~22% propulsion WTW CO2 reduction via slow steaming
    fuelMult: 0.78,
    baseFreightMult: 1.045, // minor vessel charter extension
    addedDays: 2.0,
    reliabilityDelta: 1.4
  },
  SEA_RAIL: {
    emissionsMult: 0.84, // ~16% reduction across sea feeder + off-peak rail traction
    fuelMult: 0.84,
    baseFreightMult: 1.03,
    addedDays: 1.3,
    reliabilityDelta: 0.8
  },
  RAIL: {
    emissionsMult: 0.88, // ~12% reduction via eco-pacing & off-peak renewable grid mix
    fuelMult: 0.88,
    baseFreightMult: 1.02,
    addedDays: 0.6,
    reliabilityDelta: 0.5
  },
  ROAD: {
    emissionsMult: 0.87, // ~13% diesel savings at 80 km/h eco-cruise
    fuelMult: 0.87,
    baseFreightMult: 1.035, // extra driver duty time
    addedDays: 0.4,
    reliabilityDelta: -0.4
  },
  AIR: {
    emissionsMult: 0.94, // ~6% fuel-optimized cruise Mach profile
    fuelMult: 0.94,
    baseFreightMult: 1.01,
    addedDays: 0.3,
    reliabilityDelta: 0
  }
};

export const applySpeedProfileToRoute = (
  route: RouteCostOption,
  speedProfile: SpeedProfile,
  carbonPricePerTonne: number
): RouteCostOption => {
  if (speedProfile === 'standard') {
    return { ...route, speedProfile: 'standard' };
  }

  const spec = ECO_SPEED_SPECS[route.mode] ?? ECO_SPEED_SPECS.SEA;
  const linehaulBase = route.linehaulEmissionsKg ?? Math.max(0, route.estimatedEmissionsKg - (route.dwellEmissionsKg ?? 0));
  const ecoLinehaulKg = Math.round(linehaulBase * spec.emissionsMult);
  const dwellKg = route.dwellEmissionsKg ?? 0;
  const estimatedEmissionsKg = ecoLinehaulKg + dwellKg;

  const glecSpec = getGlecFactorSpec(route.mode);
  const ratioTtw = glecSpec.wtw > 0 ? glecSpec.ttw / glecSpec.wtw : 0.75;
  const linehaulTtwKg = Math.round(ecoLinehaulKg * ratioTtw);
  const linehaulWttKg = Math.max(0, ecoLinehaulKg - linehaulTtwKg);
  const dwellTtwKg = Math.round(dwellKg * ratioTtw);
  const dwellWttKg = Math.max(0, dwellKg - dwellTtwKg);

  const baseFreightCost = Math.round(route.baseFreightCost * spec.baseFreightMult);
  const fuelCost = Math.round(route.fuelCost * spec.fuelMult);
  const co2Cost = calculateCO2Cost(ecoLinehaulKg, carbonPricePerTonne);
  const fuelPlusCo2Cost = fuelCost + co2Cost;
  const portFeeTotal = route.portFeeTotal ?? 0;
  const dwellCost = route.dwellCost ?? 0;
  const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwellCost;

  const estimatedDays = Number((route.estimatedDays + spec.addedDays).toFixed(1));
  const fuelConsumption = Math.round(route.fuelConsumption * spec.fuelMult);
  const containers = Math.max(0.5, route.containers || 1);
  const teuKm = route.teuKm > 0 ? route.teuKm : calculateTeuKm(route.estimatedDistanceKm, containers);
  const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
  const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
  const glecFactorWtw = Number(((route.glecFactorWtw ?? glecSpec.wtw) * spec.emissionsMult).toFixed(4));
  const baseRel = route.scheduleReliabilityPct ?? 90;
  const scheduleReliabilityPct = Number(Math.min(99.2, Math.max(55, baseRel + spec.reliabilityDelta)).toFixed(1));

  return {
    ...route,
    speedProfile: 'eco',
    estimatedDays,
    scheduleReliabilityPct,
    baseFreightCost,
    fuelCost,
    co2Cost,
    fuelPlusCo2Cost,
    estimatedCost,
    linehaulEmissionsKg: ecoLinehaulKg,
    estimatedEmissionsKg,
    ttwEmissionsKg: linehaulTtwKg + dwellTtwKg,
    wttEmissionsKg: linehaulWttKg + dwellWttKg,
    glecFactorWtw,
    fuelConsumption,
    costPerTeuKm,
    emissionsPerTeuKm
  };
};

export const computeCarbonAwareTradeOff = (
  standardOptions: RouteCostOption[],
  carbonPricePerTonne: number,
  maxCostDeltaPct: number = 10
): CarbonAwareTradeOff | null => {
  if (!standardOptions || standardOptions.length === 0) return null;

  // Cost-optimal standard-speed option serves as the baseline comparison anchor
  const sortedByCost = [...standardOptions].sort((a, b) => a.estimatedCost - b.estimatedCost);
  const baselineRoute: RouteCostOption = {
    ...sortedByCost[0],
    speedProfile: 'standard'
  };

  // Build candidate pool across both Standard and Eco speed profiles
  const candidates: RouteCostOption[] = [];
  for (const opt of standardOptions) {
    candidates.push({ ...opt, speedProfile: 'standard' });
    candidates.push(applySpeedProfileToRoute(opt, 'eco', carbonPricePerTonne));
  }

  const maxAllowedCost = baselineRoute.estimatedCost * (1 + Math.max(0, maxCostDeltaPct) / 100);

  // Candidates within the cost tolerance window that reduce CO2e relative to baseline
  const eligible = candidates.filter(
    (c) =>
      !(c.mode === baselineRoute.mode && (c.speedProfile ?? 'standard') === 'standard') &&
      c.estimatedCost <= maxAllowedCost &&
      c.estimatedEmissionsKg < baselineRoute.estimatedEmissionsKg
  );

  // Pick candidate with maximum CO2 savings (tie-break by lowest cost)
  let recommendedRoute: RouteCostOption | undefined = eligible.sort((a, b) => {
    const co2Diff = a.estimatedEmissionsKg - b.estimatedEmissionsKg;
    if (co2Diff !== 0) return co2Diff;
    return a.estimatedCost - b.estimatedCost;
  })[0];

  if (!recommendedRoute) {
    // Always evaluate at least Eco-Speed on the lowest-emission mode within budget or baseline
    recommendedRoute = applySpeedProfileToRoute(baselineRoute, 'eco', carbonPricePerTonne);
  }

  const costDeltaEur = recommendedRoute.estimatedCost - baselineRoute.estimatedCost;
  const costDeltaPct =
    baselineRoute.estimatedCost > 0
      ? Number(((costDeltaEur / baselineRoute.estimatedCost) * 100).toFixed(1))
      : 0;
  const co2SavedKg = Math.max(0, baselineRoute.estimatedEmissionsKg - recommendedRoute.estimatedEmissionsKg);
  const co2SavedPct =
    baselineRoute.estimatedEmissionsKg > 0
      ? Number(((co2SavedKg / baselineRoute.estimatedEmissionsKg) * 100).toFixed(1))
      : 0;
  const transitDaysDelta = Number((recommendedRoute.estimatedDays - baselineRoute.estimatedDays).toFixed(1));
  const reliabilityDeltaPct = Number(
    ((recommendedRoute.scheduleReliabilityPct ?? 90) - (baselineRoute.scheduleReliabilityPct ?? 90)).toFixed(1)
  );
  const abatementEurPerTonne =
    co2SavedKg > 0 && costDeltaEur > 0 ? Math.round((costDeltaEur / co2SavedKg) * 1000) : null;

  const modeChanged = recommendedRoute.mode !== baselineRoute.mode;
  const speedChanged = (recommendedRoute.speedProfile ?? 'standard') === 'eco';
  const recommendationType =
    modeChanged && speedChanged
      ? 'route_and_speed'
      : modeChanged
        ? 'route_shift'
        : 'eco_speed';

  return {
    baselineRoute,
    recommendedRoute,
    recommendationType,
    costDeltaEur,
    costDeltaPct,
    co2SavedKg,
    co2SavedPct,
    transitDaysDelta,
    reliabilityDeltaPct,
    abatementEurPerTonne
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
  customContainers?: number,
  dwellTimeHours: number = DEFAULT_PORT_DWELL_HOURS
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
    const baseEstimatedDays = Math.max(spec.minDays, Math.round((distanceKm / 1000) * spec.daysPer1000Km));
    const baseFreightCost = Math.round(Math.max(spec.minBase, distanceKm * w * spec.baseRatePerTKm));
    const fuelCost = Math.round(Math.max(spec.minFuel, distanceKm * w * spec.fuelRatePerTKm) * fuelMultiplier);
    const glec = calculateGlecBreakdown(spec.mode, distanceKm, w);
    const linehaulEmissionsKg = glec.totalKg;
    const co2Cost = calculateCO2Cost(linehaulEmissionsKg, carbonPricePerTonne);
    const fuelPlusCo2Cost = fuelCost + co2Cost;
    const portFeeTotal = computeApplicablePortFee(
      spec.mode,
      originPortFee,
      destinationPortFee,
      applyPortFeeToAllModes
    );
    const dwell = computeDwellImpact(
      spec.mode,
      dwellTimeHours,
      containers,
      carbonPricePerTonne,
      fuelMultiplier,
      applyPortFeeToAllModes
    );
    const estimatedDays = Number((baseEstimatedDays + dwell.dwellDaysAdded).toFixed(1));
    const estimatedEmissionsKg = linehaulEmissionsKg + dwell.dwellEmissionsKg;
    const ttwEmissionsKg = glec.ttwKg + dwell.dwellTtwKg;
    const wttEmissionsKg = glec.wttKg + dwell.dwellWttKg;
    const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwell.dwellCost;
    const fuelConsumption = Math.round(distanceKm * w * spec.fuelAmountFactor);
    const teuKm = calculateTeuKm(distanceKm, containers);
    const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
    const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
    const rel = computeModeScheduleReliability(spec.mode, dwellTimeHours, applyPortFeeToAllModes);

    return {
      mode: spec.mode,
      estimatedDays,
      dwellHours: dwell.dwellHours,
      dwellDaysAdded: dwell.dwellDaysAdded,
      scheduleReliabilityPct: rel.scheduleReliabilityPct,
      baselineReliabilityPct: rel.baselineReliabilityPct,
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
      dwellCost: dwell.dwellCost,
      dwellEmissionsKg: dwell.dwellEmissionsKg,
      linehaulEmissionsKg,
      estimatedCost,
      estimatedEmissionsKg,
      glecFactorWtw: glec.factorWtw,
      ttwEmissionsKg,
      wttEmissionsKg,
      glecSource: glec.tocSource,
      fuelConsumption,
      fuelUnit: spec.fuelUnit,
      label: spec.label,
      reasoning: spec.reasoning
    };
  });
};
