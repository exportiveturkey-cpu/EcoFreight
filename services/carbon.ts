
import {
  TransportMode,
  RouteCostOption,
  Shipment,
  ScheduleReliabilityPoint,
  SpeedProfile,
  CarbonAwareTradeOff,
  SeaServiceType,
  VesselType,
  LinerServiceLine,
  LinerAlertEvent,
  LinerNotificationPrefs,
  CiiGrade,
  EexiCiiRecord,
  TripComplianceAccounting,
  SharedVesselKpiRow,
  GreenFleetReferenceCase
} from '../types';

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

export interface VesselTypeSpec {
  id: VesselType;
  serviceType: SeaServiceType;
  labelKey:
    | 'vesselContainerDeepsea'
    | 'vesselContainerFeeder'
    | 'vesselRoroFerry'
    | 'vesselMppTramp'
    | 'vesselHandysizeBulk'
    | 'vesselCoastalCharter';
  capacityLabel: string;
  defaultSpeedKts: number;
  wtw: number;
  ttw: number;
  wtt: number;
  freightMult: number;
  fuelMult: number;
  reliabilityDelta: number;
  tocSource: string;
}

export const VESSEL_TYPE_SPECS: Record<VesselType, VesselTypeSpec> = {
  CONTAINER_DEEPSEA: {
    id: 'CONTAINER_DEEPSEA',
    serviceType: 'LINER',
    labelKey: 'vesselContainerDeepsea',
    capacityLabel: '14,000 TEU',
    defaultSpeedKts: 20.0,
    wtw: 0.011,
    ttw: 0.009,
    wtt: 0.002,
    freightMult: 0.96,
    fuelMult: 0.94,
    reliabilityDelta: 0,
    tocSource: 'Deep-Sea Container Liner 14k TEU (VLSFO/LNG, GLEC v3.0)'
  },
  CONTAINER_FEEDER: {
    id: 'CONTAINER_FEEDER',
    serviceType: 'LINER',
    labelKey: 'vesselContainerFeeder',
    capacityLabel: '2,500 TEU',
    defaultSpeedKts: 18.0,
    wtw: 0.014,
    ttw: 0.012,
    wtt: 0.002,
    freightMult: 1.03,
    fuelMult: 1.05,
    reliabilityDelta: 1.0,
    tocSource: 'Short-Sea Feeder Container Liner 2.5k TEU (GLEC v3.0)'
  },
  RORO_FERRY: {
    id: 'RORO_FERRY',
    serviceType: 'LINER',
    labelKey: 'vesselRoroFerry',
    capacityLabel: '4,200 lane-m',
    defaultSpeedKts: 21.0,
    wtw: 0.019,
    ttw: 0.016,
    wtt: 0.003,
    freightMult: 1.14,
    fuelMult: 1.18,
    reliabilityDelta: 2.5,
    tocSource: 'Scheduled Ro-Ro / ConRo Liner Vessel (GLEC v3.0)'
  },
  MULTI_PURPOSE_TRAMP: {
    id: 'MULTI_PURPOSE_TRAMP',
    serviceType: 'TRAMP',
    labelKey: 'vesselMppTramp',
    capacityLabel: '15,000 DWT',
    defaultSpeedKts: 14.5,
    wtw: 0.016,
    ttw: 0.013,
    wtt: 0.003,
    freightMult: 1.0,
    fuelMult: 1.04,
    reliabilityDelta: 0,
    tocSource: 'Multi-Purpose Tramp Charter 15k DWT (+12% Ballast, GLEC v3.0)'
  },
  HANDYSIZE_BULK: {
    id: 'HANDYSIZE_BULK',
    serviceType: 'TRAMP',
    labelKey: 'vesselHandysizeBulk',
    capacityLabel: '32,000 DWT',
    defaultSpeedKts: 14.0,
    wtw: 0.013,
    ttw: 0.011,
    wtt: 0.002,
    freightMult: 0.87,
    fuelMult: 0.91,
    reliabilityDelta: -1.5,
    tocSource: 'Handysize Bulk Spot Charter 32k DWT (+12% Ballast, GLEC v3.0)'
  },
  COASTAL_CHARTER: {
    id: 'COASTAL_CHARTER',
    serviceType: 'TRAMP',
    labelKey: 'vesselCoastalCharter',
    capacityLabel: '5,000 DWT',
    defaultSpeedKts: 12.5,
    wtw: 0.018,
    ttw: 0.015,
    wtt: 0.003,
    freightMult: 0.94,
    fuelMult: 1.08,
    reliabilityDelta: 1.5,
    tocSource: 'Coastal General Cargo Coaster Tramp 5k DWT (+12% Ballast, GLEC v3.0)'
  }
};

export const LINER_VESSEL_TYPES: VesselType[] = [
  'CONTAINER_DEEPSEA',
  'CONTAINER_FEEDER',
  'RORO_FERRY'
];

export const TRAMP_VESSEL_TYPES: VesselType[] = [
  'MULTI_PURPOSE_TRAMP',
  'HANDYSIZE_BULK',
  'COASTAL_CHARTER'
];

export const getVesselTypeSpec = (vesselType?: VesselType, mode?: string): VesselTypeSpec => {
  if (vesselType && VESSEL_TYPE_SPECS[vesselType]) {
    return VESSEL_TYPE_SPECS[vesselType];
  }
  if (mode === 'SEA_TRAMP') return VESSEL_TYPE_SPECS.MULTI_PURPOSE_TRAMP;
  if (mode === 'SEA_RAIL') return VESSEL_TYPE_SPECS.CONTAINER_FEEDER;
  return VESSEL_TYPE_SPECS.CONTAINER_DEEPSEA;
};

export const isMaritimeRouteMode = (mode: string): boolean => {
  return mode === 'SEA' || mode === 'SEA_LINER' || mode === 'SEA_TRAMP' || mode === 'SEA_RAIL';
};

export const LINER_SERVICE_LINES: LinerServiceLine[] = [
  {
    lineCode: 'MED-FE1',
    lineName: 'Med–Asia Deep-Sea Loop',
    carrier: 'Global Maritime Group',
    corridorLabel: 'Rotterdam / Piraeus ↔ Singapore',
    corridorKeywords: ['rotterdam', 'singapore', 'asia', 'shanghai', 'suex', 'suez', 'nl', 'sg'],
    vesselType: 'CONTAINER_DEEPSEA',
    frequency: 'Weekly Fixed-Day',
    departureWindowUtc: 'Thu 22:00 UTC',
    cutoffWindowUtc: 'Thu 12:00 UTC',
    predictableEtaWindow: 'Fixed 14d · ±3h berth window',
    etaToleranceHours: 3,
    scheduleReliabilityPct: 91.4,
    weatherWindowStatus: 'clear',
    weatherWindowSummary: 'Clear passage across Med & Red Sea transit gate (Wave < 1.8m)',
    publishedEmissionKgPerTkm: 0.011,
    publishedEmissionGPerTeuKm: 10.8,
    publishedVoyageKgPerTeu: 46.2,
    publicationStandard: 'ISO 14083 / GLEC v3.0 WTW',
    fuelBlend: 'Dual-Fuel LNG + Shore Power',
    yoyIntensityDeltaPct: -12.5
  },
  {
    lineCode: 'AEG-NWE',
    lineName: 'Aegean–North Sea Express',
    carrier: 'Hellenic Container Lines',
    corridorLabel: 'Piraeus / Izmir ↔ Hamburg / Rotterdam',
    corridorKeywords: ['piraeus', 'athens', 'thessaloniki', 'izmir', 'hamburg', 'felixstowe', 'gr', 'de', 'tr'],
    vesselType: 'CONTAINER_FEEDER',
    frequency: '2× Weekly Fixed',
    departureWindowUtc: 'Tue & Fri 18:00 UTC',
    cutoffWindowUtc: 'Mon & Thu 16:00 UTC',
    predictableEtaWindow: 'Fixed 7d · ±2h berth window',
    etaToleranceHours: 2,
    scheduleReliabilityPct: 92.8,
    weatherWindowStatus: 'watch',
    weatherWindowSummary: 'Aegean NE Meltemi 22 kt forecast · Weather routing window open (+1.5h buffer)',
    publishedEmissionKgPerTkm: 0.014,
    publishedEmissionGPerTeuKm: 13.6,
    publishedVoyageKgPerTeu: 32.8,
    publicationStandard: 'Clean Cargo / GLEC v3.0 Audited',
    fuelBlend: 'VLSFO + 15% Bio-LNG',
    yoyIntensityDeltaPct: -9.2
  },
  {
    lineCode: 'BAL-NSL',
    lineName: 'Nordic–Antwerp Ro-Ro Loop',
    carrier: 'Nordic Ro-Ro Express',
    corridorLabel: 'Gothenburg / Oslo ↔ Antwerp / Gdańsk',
    corridorKeywords: ['gothenburg', 'oslo', 'helsinki', 'copenhagen', 'antwerp', 'gdansk', 'gdańsk', 'se', 'no', 'fi', 'dk', 'be', 'pl'],
    vesselType: 'RORO_FERRY',
    frequency: '3× Weekly Fixed',
    departureWindowUtc: 'Mon / Wed / Fri 20:00 UTC',
    cutoffWindowUtc: '4h prior to ETD',
    predictableEtaWindow: 'Fixed 3d · ±1.5h berth window',
    etaToleranceHours: 1.5,
    scheduleReliabilityPct: 94.6,
    weatherWindowStatus: 'clear',
    weatherWindowSummary: 'North Sea Skagerrak weather window green (Beaufort 3)',
    publishedEmissionKgPerTkm: 0.019,
    publishedEmissionGPerTeuKm: 18.2,
    publishedVoyageKgPerTeu: 21.4,
    publicationStandard: 'EU MRV + GLEC v3.0 Verified',
    fuelBlend: 'Battery-Hybrid + MGO',
    yoyIntensityDeltaPct: -14.1
  },
  {
    lineCode: 'ION-ADR',
    lineName: 'Ionian–Adriatic Feeder Line',
    carrier: 'Adriatic Intermodal Liner',
    corridorLabel: 'Igoumenitsa / Valencia ↔ Bari / Genoa',
    corridorKeywords: ['igoumenitsa', 'bari', 'venice', 'genoa', 'milan', 'valencia', 'barcelona', 'split', 'it', 'es', 'hr'],
    vesselType: 'CONTAINER_FEEDER',
    frequency: 'Every 48h Fixed',
    departureWindowUtc: 'Mon / Wed / Fri / Sun 14:00 UTC',
    cutoffWindowUtc: '6h prior to ETD',
    predictableEtaWindow: 'Fixed 2d · ±2h berth window',
    etaToleranceHours: 2,
    scheduleReliabilityPct: 92.1,
    weatherWindowStatus: 'advisory',
    weatherWindowSummary: 'Adriatic southerly swell window advisory Tue 06:00–14:00 UTC',
    publishedEmissionKgPerTkm: 0.014,
    publishedEmissionGPerTeuKm: 14.1,
    publishedVoyageKgPerTeu: 19.5,
    publicationStandard: 'Clean Cargo / GLEC v3.0 Audited',
    fuelBlend: 'VLSFO + Cold Ironing',
    yoyIntensityDeltaPct: -7.6
  }
];

export const matchLinerLineForCorridor = (
  origin: string,
  destination: string,
  vesselType?: VesselType
): LinerServiceLine => {
  const combined = `${origin} ${destination}`.toLowerCase();
  const scored = LINER_SERVICE_LINES.map((line) => {
    let score = 0;
    for (const kw of line.corridorKeywords) {
      if (combined.includes(kw)) score += 2;
    }
    if (vesselType && line.vesselType === vesselType) {
      score += 3;
    }
    return { line, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.line ?? LINER_SERVICE_LINES[0];
};

export const DEFAULT_LINER_NOTIFICATION_PREFS: LinerNotificationPrefs = {
  smsEnabled: true,
  inAppEnabled: true,
  scheduleChanges: true,
  weatherWindows: true,
  recipientPhone: '+30 694 018 4420'
};

export const INITIAL_LINER_ALERTS: LinerAlertEvent[] = [
  {
    id: 'AL-101',
    shipmentId: 'SH-8291',
    lineCode: 'MED-FE1',
    lineName: 'Med–Asia Deep-Sea Loop',
    category: 'schedule_change',
    severity: 'info',
    channel: 'sms_and_app',
    recipientPhone: '+30 694 018 4420',
    title: 'Fixed Berth Slot Confirmed · +1.5h Suez Convoy Window',
    message: 'MED-FE1 northbound convoy clearance confirmed; PSA Singapore ETA remains within predictable ±3h SLA window.',
    etaImpact: 'ETA within ±3h SLA',
    timestamp: '2026-10-06T14:40:00Z',
    read: false
  },
  {
    id: 'AL-102',
    shipmentId: 'SH-9849',
    lineCode: 'AEG-NWE',
    lineName: 'Aegean–North Sea Express',
    category: 'weather_window',
    severity: 'warning',
    channel: 'sms_and_app',
    recipientPhone: '+30 694 018 4420',
    title: 'Weather Window Notice · Aegean NE Wind (22 kts)',
    message: 'AEG-NWE feeder adjusted Cyclades passage timing; Piraeus rail handover berth slot preserved.',
    etaImpact: '+1.5h buffer · Intermodal connection safe',
    timestamp: '2026-10-06T16:10:00Z',
    read: false
  }
];

export const createSimulatedLinerAlert = (
  category: 'schedule_change' | 'weather_window',
  shipmentId: string,
  line: LinerServiceLine,
  prefs: LinerNotificationPrefs
): LinerAlertEvent => {
  const nowIso = new Date().toISOString();
  const isSchedule = category === 'schedule_change';
  return {
    id: `AL-${Math.floor(200 + Math.random() * 799)}`,
    shipmentId,
    lineCode: line.lineCode,
    lineName: line.lineName,
    category,
    severity: isSchedule ? 'info' : 'warning',
    channel: prefs.smsEnabled ? 'sms_and_app' : 'app_only',
    recipientPhone: prefs.recipientPhone || '+30 694 018 4420',
    title: isSchedule
      ? `[Demo] Berth Schedule Shift · ${line.lineCode} (${line.departureWindowUtc})`
      : `[Demo] Marine Weather Window Advisory · ${line.lineCode}`,
    message: isSchedule
      ? `Liner loop ${line.lineName} shifted departure window by +2h due to terminal crane balancing. Predictable ETA tolerance (±${line.etaToleranceHours}h) remains locked.`
      : `${line.weatherWindowSummary}. Vessel speed trimmed -5% inside calm corridor window with no missed rail handover.`,
    etaImpact: isSchedule
      ? `ETD +2h · ETA within ±${line.etaToleranceHours}h`
      : 'Weather window buffer +2h · Published SLA held',
    timestamp: nowIso,
    read: false
  };
};

export const GLEC_FRAMEWORK_METADATA = {
  framework: 'GLEC Framework v3.0',
  standard: 'ISO 14083:2023 Aligned',
  boundary: 'Well-to-Wheel (WTW = TTW + WTT)',
  formula: 'CO2e (kg) = Distance (km) × Cargo Mass (t) × EF_WTW (kg CO2e / t·km)'
};

export const GLEC_MODE_FACTORS: Record<string, GlecModeFactorSpec> = {
  SEA_LINER: {
    mode: 'SEA_LINER',
    wtw: 0.012,
    ttw: 0.010,
    wtt: 0.002,
    unit: 'kg CO2e / t·km',
    tocSource: 'Scheduled Container Liner Vessel (VLSFO/LNG, GLEC v3.0)'
  },
  SEA_TRAMP: {
    mode: 'SEA_TRAMP',
    wtw: 0.016,
    ttw: 0.013,
    wtt: 0.003,
    unit: 'kg CO2e / t·km',
    tocSource: 'Tramp / Voyage Charter Vessel (+12% Ballast Repositioning, GLEC v3.0)'
  },
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
    tocSource: 'Maritime Liner + Electrified Rail Intermodal Composite (GLEC v3.0)'
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
  SEA_LINER: GLEC_MODE_FACTORS.SEA_LINER.wtw,
  SEA_TRAMP: GLEC_MODE_FACTORS.SEA_TRAMP.wtw,
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
  if (mode === 'SEA_TRAMP') return 1.35; // Unscheduled charter berth queueing & NOR laytime exposure
  if (mode === 'SEA' || mode === 'SEA_LINER') return 1.0; // Scheduled berth slot
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

  const isMaritime = isMaritimeRouteMode(mode);
  const isTramp = mode === 'SEA_TRAMP';
  // GLEC v3.0 auxiliary hoteling / logistics terminal emission intensity (kg CO2e / TEU·h)
  const wtwPerTeuHour = isTramp ? 3.1 : isMaritime ? 2.8 : 1.2;
  const ttwPerTeuHour = isTramp ? 2.55 : isMaritime ? 2.3 : 0.85;
  const demurrageRateMult = isTramp ? 1.25 : 1.0;

  const dwellEmissionsKg = Math.round(dwellHours * safeContainers * wtwPerTeuHour);
  const dwellTtwKg = Math.round(dwellHours * safeContainers * ttwPerTeuHour);
  const dwellWttKg = Math.max(0, dwellEmissionsKg - dwellTtwKg);
  const dwellCo2Cost = Math.round((dwellEmissionsKg / 1000) * Math.max(0, carbonPricePerTonne));
  const dwellOperationalCost = Math.round(
    dwellHours *
      safeContainers *
      (DWELL_STORAGE_EUR_PER_TEU_HOUR + DWELL_AUX_FUEL_EUR_PER_TEU_HOUR * Math.max(0.3, fuelMultiplier)) *
      demurrageRateMult
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
  SEA_LINER: 90.5,
  SEA_TRAMP: 76.5,
  SEA: 88.5,
  SEA_RAIL: 93.0,
  RAIL: 94.5,
  ROAD: 96.0,
  AIR: 98.2
};

export const computeModeScheduleReliability = (
  mode: string,
  dwellTimeHours: number = 0,
  applyToAllModes: boolean = false,
  vesselType?: VesselType
): { baselineReliabilityPct: number; scheduleReliabilityPct: number } => {
  const vesselDelta =
    vesselType && VESSEL_TYPE_SPECS[vesselType] && (mode === 'SEA_LINER' || mode === 'SEA_TRAMP' || mode === 'SEA')
      ? VESSEL_TYPE_SPECS[vesselType].reliabilityDelta
      : 0;
  const baseline = Number(((MODE_BASELINE_SCHEDULE_RELIABILITY[mode] ?? 88.5) + vesselDelta).toFixed(1));
  const share = getDwellModeShare(mode, applyToAllModes);
  const effectiveDwell = Math.max(0, Number(dwellTimeHours) || 0) * share;
  const decayRate = mode === 'SEA_TRAMP' ? 0.22 : 0.15;
  const penalty = Math.min(25, effectiveDwell * decayRate);
  const scheduleReliabilityPct = Number(Math.max(55, baseline - penalty).toFixed(1));
  return {
    baselineReliabilityPct: baseline,
    scheduleReliabilityPct
  };
};

export const getShipmentSeaServiceType = (shipment: Shipment): SeaServiceType | undefined => {
  if (shipment.seaServiceType) return shipment.seaServiceType;
  const legWithService = (shipment.legs || []).find((l) => l.seaServiceType);
  if (legWithService?.seaServiceType) return legWithService.seaServiceType;
  const hasSea = (shipment.legs || []).some((l) => l.mode === TransportMode.SEA);
  if (!hasSea) return undefined;
  return (shipment.weightTonnes || 0) >= 20 && (shipment.scheduleReliabilityPct ?? 90) < 84 ? 'TRAMP' : 'LINER';
};

export const getShipmentPrimaryMode = (shipment: Shipment): string => {
  const legs = shipment.legs || [];
  if (legs.length === 0) return 'SEA_LINER';
  const modes = new Set(legs.map((l) => l.mode));
  if (modes.has(TransportMode.SEA) && modes.has(TransportMode.RAIL)) return 'SEA_RAIL';
  if (legs[0].mode === TransportMode.SEA) {
    const svc = getShipmentSeaServiceType(shipment);
    return svc === 'TRAMP' ? 'SEA_TRAMP' : 'SEA_LINER';
  }
  return legs[0].mode;
};

export const getShipmentScheduleReliability = (shipment: Shipment): number => {
  if (typeof shipment.scheduleReliabilityPct === 'number' && shipment.scheduleReliabilityPct > 0) {
    return shipment.scheduleReliabilityPct;
  }
  const mode = getShipmentPrimaryMode(shipment);
  const dwell = shipment.dwellTimeHours ?? 0;
  const delayPenalty = Math.min(20, Math.max(0, Number(shipment.scheduleDelayHours) || 0) * 0.45);
  const base = computeModeScheduleReliability(mode, dwell, false, shipment.vesselType).scheduleReliabilityPct;
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
  const liveSea = avgMode(
    (m) => m === TransportMode.SEA || m === 'SEA_LINER' || m === 'SEA_TRAMP',
    85.2
  );
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

export const getGlecFactorSpec = (mode: string, vesselType?: VesselType): GlecModeFactorSpec => {
  if (vesselType && VESSEL_TYPE_SPECS[vesselType] && (mode === 'SEA_LINER' || mode === 'SEA_TRAMP' || mode === 'SEA')) {
    const v = VESSEL_TYPE_SPECS[vesselType];
    return {
      mode,
      wtw: v.wtw,
      ttw: v.ttw,
      wtt: v.wtt,
      unit: 'kg CO2e / t·km',
      tocSource: v.tocSource
    };
  }
  return GLEC_MODE_FACTORS[mode] ?? GLEC_MODE_FACTORS.SEA_LINER;
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
  weightTonnes: number,
  vesselType?: VesselType
): GlecEmissionBreakdown => {
  const spec = getGlecFactorSpec(mode, vesselType);
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

  if (mode === 'SEA' || mode === 'SEA_LINER' || mode === 'SEA_TRAMP') {
    return Math.round(oFee + dFee);
  }
  if (mode === 'SEA_RAIL') {
    // Origin maritime liner port dues + inland intermodal rail terminal discharge (or full if all-modes enabled)
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

export const BASELINE_VESSEL_SPEED_KTS = 20.0;
export const DEFAULT_ECO_SLOW_STEAMING_PCT = 15;

export const SLOW_STEAMING_TIERS = [
  { pct: 0, knots: 20.0, labelKey: 'slowSteamingNormal' },
  { pct: 10, knots: 18.0, labelKey: 'slowSteaming10' },
  { pct: 15, knots: 17.0, labelKey: 'slowSteaming15' },
  { pct: 20, knots: 16.0, labelKey: 'slowSteaming20' },
  { pct: 25, knots: 15.0, labelKey: 'slowSteaming25' }
] as const;

export const getBaselineVesselSpeedKts = (mode: string, vesselType?: VesselType): number => {
  if (vesselType && VESSEL_TYPE_SPECS[vesselType]) {
    return VESSEL_TYPE_SPECS[vesselType].defaultSpeedKts;
  }
  if (mode === 'SEA_TRAMP') return 14.5;
  if (mode === 'SEA_RAIL') return 18.0;
  return BASELINE_VESSEL_SPEED_KTS;
};

export const applySlowSteamingToRoute = (
  route: RouteCostOption,
  slowSteamingPct: number,
  carbonPricePerTonne: number
): RouteCostOption => {
  const pct = Math.min(30, Math.max(0, Number(slowSteamingPct) || 0));
  const speedRatio = 1 - pct / 100;
  const isMaritime = isMaritimeRouteMode(route.mode);
  const baseVesselSpeedKts = getBaselineVesselSpeedKts(route.mode, route.vesselType);
  const vesselSpeedKnots = isMaritime
    ? Number((baseVesselSpeedKts * speedRatio).toFixed(1))
    : undefined;

  if (pct <= 0) {
    return {
      ...route,
      speedProfile: 'standard',
      slowSteamingPct: 0,
      vesselSpeedKnots,
      fuelSavedUnits: 0,
      fuelSavedEur: 0,
      co2SavedKg: 0,
      co2SavedEur: 0,
      fuelPlusCo2SavedEur: 0
    };
  }

  // Admiralty / Propeller Law: maritime propulsion fuel burn per nm scales with speed^2 (~15% aux on Liner, ~18% on Tramp)
  const linerPropulsionFactor = 0.15 + 0.85 * (speedRatio * speedRatio);
  const trampPropulsionFactor = 0.18 + 0.82 * (speedRatio * speedRatio);
  let energyMult = 1;
  let baseFreightMult = 1;
  let reliabilityDelta = 0;

  if (route.mode === 'SEA_LINER' || route.mode === 'SEA') {
    energyMult = linerPropulsionFactor;
    baseFreightMult = 1 + (pct / 100) * 0.25;
    reliabilityDelta = Math.min(2.2, pct * 0.09);
  } else if (route.mode === 'SEA_TRAMP') {
    energyMult = trampPropulsionFactor;
    baseFreightMult = 1 + (pct / 100) * 0.42; // Daily charter hire increases slightly more per extra voyage day
    reliabilityDelta = Math.min(1.5, pct * 0.06);
  } else if (route.mode === 'SEA_RAIL') {
    const railEcoFactor = 1 - (pct / 100) * 0.45;
    energyMult = 0.65 * linerPropulsionFactor + 0.35 * railEcoFactor;
    baseFreightMult = 1 + (pct / 100) * 0.2;
    reliabilityDelta = Math.min(1.4, pct * 0.055);
  } else if (route.mode === 'RAIL') {
    energyMult = 1 - Math.min(0.18, (pct / 100) * 0.72);
    baseFreightMult = 1 + (pct / 100) * 0.12;
    reliabilityDelta = Math.min(0.9, pct * 0.03);
  } else if (route.mode === 'ROAD') {
    energyMult = 1 - Math.min(0.2, (pct / 100) * 0.82);
    baseFreightMult = 1 + (pct / 100) * 0.22;
    reliabilityDelta = -Math.min(1.0, pct * 0.03);
  } else {
    energyMult = 1 - Math.min(0.08, (pct / 100) * 0.35);
    baseFreightMult = 1 + (pct / 100) * 0.06;
  }

  const linehaulBase =
    route.linehaulEmissionsKg ?? Math.max(0, route.estimatedEmissionsKg - (route.dwellEmissionsKg ?? 0));
  const ecoLinehaulKg = Math.round(linehaulBase * energyMult);
  const dwellKg = route.dwellEmissionsKg ?? 0;
  const estimatedEmissionsKg = ecoLinehaulKg + dwellKg;

  const glecSpec = getGlecFactorSpec(route.mode);
  const ratioTtw = glecSpec.wtw > 0 ? glecSpec.ttw / glecSpec.wtw : 0.75;
  const linehaulTtwKg = Math.round(ecoLinehaulKg * ratioTtw);
  const linehaulWttKg = Math.max(0, ecoLinehaulKg - linehaulTtwKg);
  const dwellTtwKg = Math.round(dwellKg * ratioTtw);
  const dwellWttKg = Math.max(0, dwellKg - dwellTtwKg);

  const baseFreightCost = Math.round(route.baseFreightCost * baseFreightMult);
  const fuelCost = Math.round(route.fuelCost * energyMult);
  const co2Cost = calculateCO2Cost(ecoLinehaulKg, carbonPricePerTonne);
  const fuelPlusCo2Cost = fuelCost + co2Cost;
  const portFeeTotal = route.portFeeTotal ?? 0;
  const dwellCost = route.dwellCost ?? 0;
  const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwellCost;

  const linehaulBaseDays = Math.max(1, route.estimatedDays - (route.dwellDaysAdded ?? 0));
  const speedTransitShare =
    route.mode === 'SEA_LINER' || route.mode === 'SEA_TRAMP' || route.mode === 'SEA'
      ? 0.9
      : route.mode === 'SEA_RAIL'
        ? 0.65
        : route.mode === 'RAIL'
          ? 0.35
          : route.mode === 'ROAD'
            ? 0.3
            : 0.2;
  const extraDays = linehaulBaseDays * speedTransitShare * (1 / speedRatio - 1);
  const estimatedDays = Number((route.estimatedDays + extraDays).toFixed(1));

  const fuelConsumption = Math.round(route.fuelConsumption * energyMult);
  const fuelSavedUnits = Math.max(0, route.fuelConsumption - fuelConsumption);
  const fuelSavedEur = Math.max(0, route.fuelCost - fuelCost);
  const co2SavedKg = Math.max(0, route.estimatedEmissionsKg - estimatedEmissionsKg);
  const co2SavedEur = Math.max(0, route.co2Cost - co2Cost);
  const fuelPlusCo2SavedEur = fuelSavedEur + co2SavedEur;

  const containers = Math.max(0.5, route.containers || 1);
  const teuKm = route.teuKm > 0 ? route.teuKm : calculateTeuKm(route.estimatedDistanceKm, containers);
  const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
  const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
  const glecFactorWtw = Number(((route.glecFactorWtw ?? glecSpec.wtw) * energyMult).toFixed(4));
  const baseRel = route.scheduleReliabilityPct ?? 90;
  const scheduleReliabilityPct = Number(Math.min(99.2, Math.max(55, baseRel + reliabilityDelta)).toFixed(1));

  return {
    ...route,
    speedProfile: 'eco',
    slowSteamingPct: pct,
    vesselSpeedKnots,
    fuelSavedUnits,
    fuelSavedEur,
    co2SavedKg,
    co2SavedEur,
    fuelPlusCo2SavedEur,
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

export const applySpeedProfileToRoute = (
  route: RouteCostOption,
  speedProfile: SpeedProfile,
  carbonPricePerTonne: number
): RouteCostOption => {
  return applySlowSteamingToRoute(
    route,
    speedProfile === 'eco' ? DEFAULT_ECO_SLOW_STEAMING_PCT : 0,
    carbonPricePerTonne
  );
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
  dwellTimeHours: number = DEFAULT_PORT_DWELL_HOURS,
  linerVesselType: VesselType = 'CONTAINER_DEEPSEA',
  trampVesselType: VesselType = 'MULTI_PURPOSE_TRAMP'
): RouteCostOption[] => {
  const w = Math.max(0.5, Number(weightTonnes) || 1);
  const containers = Math.max(0.5, Number(customContainers ?? estimateTeuFromCargo(w)) || 1);
  const baseKm = estimateCorridorDistanceKm(origin, destination);
  const defaults = estimatePortFees(origin, destination, w);
  const originPortFee = customOriginPortFee ?? defaults.originPortFee;
  const destinationPortFee = customDestinationPortFee ?? defaults.destinationPortFee;

  const linerVessel = getVesselTypeSpec(linerVesselType, 'SEA_LINER');
  const trampVessel = getVesselTypeSpec(trampVesselType, 'SEA_TRAMP');
  const intermodalVessel = linerVesselType === 'RORO_FERRY' ? VESSEL_TYPE_SPECS.RORO_FERRY : VESSEL_TYPE_SPECS.CONTAINER_FEEDER;

  const specs: Array<{
    mode: string;
    seaServiceType?: SeaServiceType;
    vesselType?: VesselType;
    ballastPct?: number;
    dwellMultiplier?: number;
    distFactor: number;
    daysPer1000Km: number;
    minDays: number;
    baseRatePerTKm: number;
    minBase: number;
    fuelRatePerTKm: number;
    minFuel: number;
    fuelUnit: string;
    fuelAmountFactor: number;
    label: string;
    reasoning: string;
  }> = [
    {
      mode: 'SEA_LINER',
      seaServiceType: 'LINER',
      vesselType: linerVessel.id,
      ballastPct: 0,
      dwellMultiplier: 1.0,
      distFactor: 1.18,
      daysPer1000Km: Number((2.7 * (20 / linerVessel.defaultSpeedKts)).toFixed(2)),
      minDays: 4,
      baseRatePerTKm: Number((0.023 * linerVessel.freightMult).toFixed(4)),
      minBase: Math.round(470 * linerVessel.freightMult),
      fuelRatePerTKm: Number((0.0105 * linerVessel.fuelMult).toFixed(4)),
      minFuel: Math.round(180 * linerVessel.fuelMult),
      fuelUnit: 'L VLSFO',
      fuelAmountFactor: Number((0.0040 * linerVessel.fuelMult).toFixed(5)),
      label: `Scheduled Liner · ${linerVessel.capacityLabel}`,
      reasoning: 'Fixed weekly timetable with TEU slot tariff, priority berth window (0% ballast repositioning), and high schedule adherence.'
    },
    {
      mode: 'SEA_TRAMP',
      seaServiceType: 'TRAMP',
      vesselType: trampVessel.id,
      ballastPct: 12,
      dwellMultiplier: 1.35,
      distFactor: 1.21,
      daysPer1000Km: Number((3.4 * (14.5 / trampVessel.defaultSpeedKts)).toFixed(2)),
      minDays: 5,
      // Tramp charter has higher fixed mobilization floor for small loads, but lower marginal rate per t·km for heavy cargo
      baseRatePerTKm: Number((0.0175 * trampVessel.freightMult).toFixed(4)),
      minBase: Math.round(780 * trampVessel.freightMult),
      fuelRatePerTKm: Number((0.0132 * trampVessel.fuelMult * 1.12).toFixed(4)),
      minFuel: Math.round(250 * trampVessel.fuelMult),
      fuelUnit: 'L VLSFO/MGO',
      fuelAmountFactor: Number((0.0048 * trampVessel.fuelMult * 1.12).toFixed(5)),
      label: `Voyage Charter Tramp · ${trampVessel.capacityLabel}`,
      reasoning: 'On-demand spot charter with economies of scale for heavy tonnage, offset by +12% ballast leg fuel and +35% berth laytime queueing exposure.'
    },
    {
      mode: 'SEA_RAIL',
      seaServiceType: 'LINER',
      vesselType: intermodalVessel.id,
      ballastPct: 0,
      dwellMultiplier: 0.65,
      distFactor: 1.06,
      daysPer1000Km: 1.9,
      minDays: 3,
      baseRatePerTKm: 0.029,
      minBase: 560,
      fuelRatePerTKm: 0.014,
      minFuel: 230,
      fuelUnit: 'Mixed (VLSFO + kWh)',
      fuelAmountFactor: 0.005,
      label: 'Sea (Liner) + Electric Rail Intermodal',
      reasoning: 'Combines scheduled coastal liner feeder with electrified inland rail to balance lead time, port dues, and carbon cost.'
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
      label: 'Express Air Freight',
      reasoning: 'Shortest transit window for time-critical cargo, carrying maximum Jet-A1 fuel and carbon cost overhead.'
    }
  ];

  const matchedLiner = matchLinerLineForCorridor(origin, destination, linerVessel.id);
  const matchedFeederLiner = matchLinerLineForCorridor(origin, destination, intermodalVessel.id);

  return specs.map((spec) => {
    const distanceKm = Math.round(baseKm * spec.distFactor);
    const baseEstimatedDays = Math.max(spec.minDays, Math.round((distanceKm / 1000) * spec.daysPer1000Km));
    const baseFreightCost = Math.round(Math.max(spec.minBase, distanceKm * w * spec.baseRatePerTKm));
    const fuelCost = Math.round(Math.max(spec.minFuel, distanceKm * w * spec.fuelRatePerTKm) * fuelMultiplier);
    const glec = calculateGlecBreakdown(spec.mode, distanceKm, w, spec.vesselType);
    const ballastFactor = 1 + (spec.ballastPct ?? 0) / 100;
    const linehaulEmissionsKg = Math.round(glec.totalKg * ballastFactor);
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
    const ttwEmissionsKg = Math.round(glec.ttwKg * ballastFactor) + dwell.dwellTtwKg;
    const wttEmissionsKg = Math.max(0, linehaulEmissionsKg - Math.round(glec.ttwKg * ballastFactor)) + dwell.dwellWttKg;
    const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwell.dwellCost;
    const fuelConsumption = Math.round(distanceKm * w * spec.fuelAmountFactor);
    const teuKm = calculateTeuKm(distanceKm, containers);
    const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
    const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
    const rel = computeModeScheduleReliability(spec.mode, dwellTimeHours, applyPortFeeToAllModes, spec.vesselType);
    const isLinerLine = spec.mode === 'SEA_LINER' || spec.mode === 'SEA_RAIL';
    const activeLine = spec.mode === 'SEA_LINER' ? matchedLiner : spec.mode === 'SEA_RAIL' ? matchedFeederLiner : undefined;
    const etaTolerance = spec.mode === 'SEA_LINER'
      ? (activeLine?.etaToleranceHours ?? 2.5)
      : spec.mode === 'SEA_RAIL'
        ? 4
        : spec.mode === 'SEA_TRAMP'
          ? 28
          : undefined;
    const predictableEtaWindow = spec.mode === 'SEA_LINER' && activeLine
      ? `Fixed ${estimatedDays}d (±${activeLine.etaToleranceHours}h)`
      : spec.mode === 'SEA_RAIL'
        ? `Fixed ${estimatedDays}d (±4h)`
        : spec.mode === 'SEA_TRAMP'
          ? `Unscheduled ${estimatedDays}d (±24–36h)`
          : undefined;

    return {
      mode: spec.mode,
      seaServiceType: spec.seaServiceType,
      vesselType: spec.vesselType,
      linerLineCode: activeLine?.lineCode,
      linerLineName: activeLine?.lineName,
      fixedDepartureUtc: isLinerLine ? activeLine?.departureWindowUtc : undefined,
      predictableEtaWindow,
      etaConfidenceHours: etaTolerance,
      publishedEmissionGPerTeuKm: isLinerLine
        ? Number((glec.factorWtw * 980).toFixed(1))
        : undefined,
      publishedEmissionMethod: isLinerLine ? activeLine?.publicationStandard : undefined,
      ballastPct: spec.ballastPct,
      dwellMultiplier: spec.dwellMultiplier,
      vesselSpeedKnots: isMaritimeRouteMode(spec.mode)
        ? getBaselineVesselSpeedKts(spec.mode, spec.vesselType)
        : undefined,
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
      glecFactorWtw: Number((glec.factorWtw * ballastFactor).toFixed(4)),
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

export const FLEET_EEXI_CII_RECORDS: Record<VesselType, EexiCiiRecord> = {
  CONTAINER_DEEPSEA: {
    vesselType: 'CONTAINER_DEEPSEA',
    vesselName: 'MV Aegea Horizon',
    imoNumber: 'IMO 9842105',
    dwt: 145000,
    attainedEexi: 11.4,
    requiredEexi: 14.2,
    eexiMarginPct: 19.7,
    eexiCompliant: true,
    eplPowerLimitPct: 0,
    attainedCii: 5.38,
    requiredCii: 6.9,
    ciiRatio: 0.78,
    ciiGrade: 'A',
    ciiProjectedNextYear: 'A',
    fuelEuIntensityGPerMj: 79.4
  },
  CONTAINER_FEEDER: {
    vesselType: 'CONTAINER_FEEDER',
    vesselName: 'MV Piraeus Express',
    imoNumber: 'IMO 9718440',
    dwt: 32000,
    attainedEexi: 16.8,
    requiredEexi: 18.9,
    eexiMarginPct: 11.1,
    eexiCompliant: true,
    eplPowerLimitPct: 0,
    attainedCii: 8.62,
    requiredCii: 9.8,
    ciiRatio: 0.88,
    ciiGrade: 'B',
    ciiProjectedNextYear: 'B',
    fuelEuIntensityGPerMj: 86.2
  },
  RORO_FERRY: {
    vesselType: 'RORO_FERRY',
    vesselName: 'MV Nordic Skagerrak',
    imoNumber: 'IMO 9690312',
    dwt: 18500,
    attainedEexi: 19.6,
    requiredEexi: 22.1,
    eexiMarginPct: 11.3,
    eexiCompliant: true,
    eplPowerLimitPct: 0,
    attainedCii: 10.63,
    requiredCii: 12.5,
    ciiRatio: 0.85,
    ciiGrade: 'B',
    ciiProjectedNextYear: 'B',
    fuelEuIntensityGPerMj: 81.8
  },
  MULTI_PURPOSE_TRAMP: {
    vesselType: 'MULTI_PURPOSE_TRAMP',
    vesselName: 'MV Levante Tramp',
    imoNumber: 'IMO 9485122',
    dwt: 15000,
    attainedEexi: 21.8,
    requiredEexi: 22.4,
    eexiMarginPct: 2.7,
    eexiCompliant: true,
    eplPowerLimitPct: 12,
    attainedCii: 10.61,
    requiredCii: 10.2,
    ciiRatio: 1.04,
    ciiGrade: 'C',
    ciiProjectedNextYear: 'C',
    fuelEuIntensityGPerMj: 92.8
  },
  HANDYSIZE_BULK: {
    vesselType: 'HANDYSIZE_BULK',
    vesselName: 'MV Cyclades Trader',
    imoNumber: 'IMO 9531098',
    dwt: 32000,
    attainedEexi: 7.6,
    requiredEexi: 7.8,
    eexiMarginPct: 2.6,
    eexiCompliant: true,
    eplPowerLimitPct: 14,
    attainedCii: 9.64,
    requiredCii: 8.1,
    ciiRatio: 1.19,
    ciiGrade: 'D',
    ciiProjectedNextYear: 'E',
    fuelEuIntensityGPerMj: 94.1
  },
  COASTAL_CHARTER: {
    vesselType: 'COASTAL_CHARTER',
    vesselName: 'MV Ionian Coaster',
    imoNumber: 'IMO 9412884',
    dwt: 5000,
    attainedEexi: 24.5,
    requiredEexi: 25.1,
    eexiMarginPct: 2.4,
    eexiCompliant: true,
    eplPowerLimitPct: 10,
    attainedCii: 13.74,
    requiredCii: 13.6,
    ciiRatio: 1.01,
    ciiGrade: 'C',
    ciiProjectedNextYear: 'D',
    fuelEuIntensityGPerMj: 91.6
  }
};

export const gradeCiiRatio = (ratio: number): CiiGrade => {
  if (ratio <= 0.83) return 'A';
  if (ratio <= 0.94) return 'B';
  if (ratio <= 1.06) return 'C';
  if (ratio <= 1.18) return 'D';
  return 'E';
};

export const getEffectiveVesselCompliance = (
  vesselType?: VesselType,
  slowSteamingPct: number = 0,
  mode?: string
): EexiCiiRecord => {
  const resolvedVessel: VesselType = vesselType && FLEET_EEXI_CII_RECORDS[vesselType]
    ? vesselType
    : mode === 'SEA_TRAMP'
      ? 'MULTI_PURPOSE_TRAMP'
      : mode === 'SEA_RAIL'
        ? 'CONTAINER_FEEDER'
        : 'CONTAINER_DEEPSEA';

  const base = FLEET_EEXI_CII_RECORDS[resolvedVessel];
  const pct = Math.min(30, Math.max(0, Number(slowSteamingPct) || 0));
  if (pct <= 0) return base;

  const speedRatio = 1 - pct / 100;
  // Attained CII improves under slow steaming along propeller power curve
  const energyFactor = 0.15 + 0.85 * (speedRatio * speedRatio);
  const attainedCii = Number((base.attainedCii * energyFactor).toFixed(2));
  const ciiRatio = Number((attainedCii / base.requiredCii).toFixed(2));
  const ciiGrade = gradeCiiRatio(ciiRatio);
  // IMO CII tightens ~2% annually (next year factor)
  const ciiProjectedNextYear = gradeCiiRatio(Number((ciiRatio * 1.022).toFixed(2)));
  const eexiMarginPct = Number((base.eexiMarginPct + pct * 0.15).toFixed(1));

  return {
    ...base,
    eexiMarginPct,
    attainedCii,
    ciiRatio,
    ciiGrade,
    ciiProjectedNextYear
  };
};

export const FUEL_EU_2026_LIMIT_G_PER_MJ = 89.34; // 2% reduction below 91.16 gCO2e/MJ reference

export const computeRouteTripAccounting = (
  route: RouteCostOption,
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE,
  _weightTonnes?: number
): TripComplianceAccounting => {
  const isMaritime = isMaritimeRouteMode(route.mode);
  const compliance = isMaritime
    ? getEffectiveVesselCompliance(route.vesselType, route.slowSteamingPct ?? 0, route.mode)
    : null;

  // Gross Freight / Charter Revenue Allocation: commercial freight margin model per segment
  const marginMarkup =
    route.mode === 'AIR'
      ? 1.16
      : route.mode === 'ROAD'
        ? 1.18
        : route.mode === 'SEA_TRAMP'
          ? 1.24
          : route.mode === 'SEA_LINER' || route.mode === 'SEA'
            ? 1.28
            : 1.25;

  const dwellTotal = route.dwellCost ?? 0;
  const commercialCostEur = Math.max(
    1,
    Math.round(route.baseFreightCost + route.fuelCost + route.portFeeTotal + dwellTotal)
  );
  const grossFreightRevenueEur = Math.round(commercialCostEur * marginMarkup);

  // TCE Formula: (Gross Freight Revenue - Voyage Expenses) / Voyage Days
  // Voyage expenses exclude vessel capital/hire (baseFreightCost) and comprise Bunker Fuel + Port Dues + Dwell + Direct CO2/ETS
  const voyageExpensesEur = Math.round(route.fuelCost + route.portFeeTotal + dwellTotal + route.co2Cost);
  const netVoyageContributionEur = Math.round(grossFreightRevenueEur - voyageExpensesEur);
  const voyageDays = Math.max(1, Number(route.estimatedDays) || 1);
  const tceEurPerDay = Math.round(netVoyageContributionEur / voyageDays);

  const benchmarkTceEurPerDay =
    route.mode === 'SEA_TRAMP'
      ? 920
      : route.mode === 'SEA_LINER' || route.mode === 'SEA'
        ? 1040
        : route.mode === 'SEA_RAIL'
          ? 1120
          : route.mode === 'RAIL'
            ? 1280
            : route.mode === 'AIR'
              ? 2850
              : 1380;
  const tceSpreadEurPerDay = tceEurPerDay - benchmarkTceEurPerDay;

  const co2PerTripKg = Math.round(route.estimatedEmissionsKg);
  const co2PerTripTonnes = Number((co2PerTripKg / 1000).toFixed(2));
  const co2PerDayKg = Math.round(co2PerTripKg / voyageDays);
  const distanceNm = Math.max(1, route.estimatedDistanceKm / 1.852);
  const co2PerNmKg = Number((co2PerTripKg / distanceNm).toFixed(1));
  const tcePerTonneCo2 = co2PerTripTonnes > 0 ? Math.round(tceEurPerDay / co2PerTripTonnes) : tceEurPerDay;

  // ESG Cost Accounting per trip (EU ETS + FuelEU Maritime balance + Port Dwell Carbon + Voluntary Offset - Green Rebate)
  const euEtsCostEur = Math.max(0, Math.round(route.co2Cost));
  const dwellCarbonCostEur = Math.round(((route.dwellEmissionsKg ?? 0) / 1000) * Math.max(0, carbonPricePerTonne));
  const voluntaryOffsetCostEur = Math.round(getOffsetPrice(co2PerTripKg, 25));

  // FuelEU Maritime GHG balance (€2,400/t VLSFOeq penalty converted to consignment energy slice)
  const fuelIntensity = compliance
    ? compliance.fuelEuIntensityGPerMj
    : route.mode === 'RAIL'
      ? 38.0
      : route.mode === 'ROAD'
        ? 93.4
        : 95.8;
  const energyMj = isMaritime
    ? Math.max(1000, route.fuelConsumption * 40.5)
    : Math.max(1000, route.estimatedDistanceKm * 18);
  const intensityDelta = fuelIntensity - FUEL_EU_2026_LIMIT_G_PER_MJ;
  // Compliance deficit cost (+EUR) or green pooling surplus credit (-EUR)
  const rawFuelEu = isMaritime
    ? Math.round((intensityDelta * energyMj * 2400) / (41000 * 1_000_000) * 60)
    : 0;
  const fuelEuComplianceEur = Math.max(-220, Math.min(480, rawFuelEu));

  // Poseidon Principles / Port Green Award rebate for A/B grades or electrified rail
  const ciiGrade = compliance?.ciiGrade;
  const greenFinancingRebateEur =
    ciiGrade === 'A' || route.mode === 'RAIL'
      ? Math.round(route.baseFreightCost * 0.025)
      : ciiGrade === 'B'
        ? Math.round(route.baseFreightCost * 0.015)
        : 0;

  const totalEsgCostEur = Math.max(
    0,
    Math.round(
      euEtsCostEur +
        dwellCarbonCostEur +
        voluntaryOffsetCostEur +
        fuelEuComplianceEur -
        greenFinancingRebateEur
    )
  );
  const esgAdjustedCostEur = commercialCostEur + totalEsgCostEur;
  const esgSharePct =
    esgAdjustedCostEur > 0 ? Number(((totalEsgCostEur / esgAdjustedCostEur) * 100).toFixed(1)) : 0;
  const esgCostPerTeuKm =
    route.teuKm > 0 ? Number((totalEsgCostEur / route.teuKm).toFixed(3)) : 0;

  return {
    grossFreightRevenueEur,
    voyageExpensesEur,
    netVoyageContributionEur,
    voyageDays,
    tceEurPerDay,
    benchmarkTceEurPerDay,
    tceSpreadEurPerDay,
    co2PerTripKg,
    co2PerTripTonnes,
    co2PerDayKg,
    co2PerNmKg,
    tcePerTonneCo2,
    commercialCostEur,
    euEtsCostEur,
    fuelEuComplianceEur,
    dwellCarbonCostEur,
    voluntaryOffsetCostEur,
    greenFinancingRebateEur,
    totalEsgCostEur,
    esgAdjustedCostEur,
    esgSharePct,
    esgCostPerTeuKm
  };
};

export const getShipmentComplianceAccounting = (
  shipment: Shipment,
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE
): { compliance: EexiCiiRecord | null; accounting: TripComplianceAccounting } => {
  const mode = getShipmentPrimaryMode(shipment);
  const distanceKm = Math.max(100, getShipmentDistanceKm(shipment));
  const containers = getShipmentContainers(shipment);
  const isMaritime = isMaritimeRouteMode(mode);

  const compliance = isMaritime
    ? getEffectiveVesselCompliance(shipment.vesselType, shipment.slowSteamingPct ?? 0, mode)
    : null;

  const baseDays =
    mode === 'AIR'
      ? Math.max(1, Math.round(distanceKm / 4000))
      : mode === 'ROAD'
        ? Math.max(1, Math.round((distanceKm / 1000) * 1.1))
        : mode === 'RAIL'
          ? Math.max(2, Math.round((distanceKm / 1000) * 1.45))
          : Math.max(2, Math.round((distanceKm / 1000) * 2.5));
  const dwellDays = (shipment.dwellTimeHours ?? 0) / 24;
  const voyageDays = Math.max(1, Number((baseDays + dwellDays).toFixed(1)));

  const baseFreightCost = shipment.costBreakdown?.freight ?? Math.round(shipment.totalCost * 0.78);
  const fuelCost = shipment.costBreakdown?.fuelSurcharge ?? Math.round(shipment.totalCost * 0.14);
  const portFeeTotal = shipment.costBreakdown?.portFees ?? 0;
  const dwellCost = shipment.costBreakdown?.dwellCost ?? 0;
  const co2Cost =
    shipment.costBreakdown?.carbonCost ?? calculateCO2Cost(shipment.totalEmissionsKg, carbonPricePerTonne);

  const syntheticRoute: RouteCostOption = {
    mode,
    seaServiceType: getShipmentSeaServiceType(shipment),
    vesselType: shipment.vesselType,
    slowSteamingPct: shipment.slowSteamingPct ?? 0,
    estimatedDays: voyageDays,
    dwellHours: shipment.dwellTimeHours ?? 0,
    estimatedDistanceKm: distanceKm,
    containers,
    teuKm: calculateTeuKm(distanceKm, containers),
    costPerTeuKm: 0,
    emissionsPerTeuKm: 0,
    baseFreightCost,
    fuelCost,
    co2Cost,
    fuelPlusCo2Cost: fuelCost + co2Cost,
    originPortFee: Math.round(portFeeTotal / 2),
    destinationPortFee: Math.round(portFeeTotal / 2),
    portFeeTotal,
    dwellCost,
    dwellEmissionsKg: Math.round((shipment.dwellTimeHours ?? 0) * containers * (isMaritime ? 2.8 : 0.8)),
    estimatedCost: shipment.totalCost,
    estimatedEmissionsKg: shipment.totalEmissionsKg,
    fuelConsumption: Math.round(distanceKm * Math.max(1, shipment.weightTonnes) * 0.0045),
    fuelUnit: isMaritime ? 'L VLSFO' : 'kWh / Diesel',
    label: mode,
    reasoning: ''
  };

  return {
    compliance,
    accounting: computeRouteTripAccounting(syntheticRoute, carbonPricePerTonne, shipment.weightTonnes)
  };
};

export const getPortfolioComplianceAccountingSummary = (
  shipments: Shipment[],
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE
) => {
  const rows = shipments.map((s) => ({
    shipment: s,
    ...getShipmentComplianceAccounting(s, carbonPricePerTonne)
  }));
  const count = Math.max(1, rows.length);
  const maritimeRows = rows.filter((r) => r.compliance !== null);
  const avgTceEurPerDay = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.accounting.tceEurPerDay, 0) / count)
    : 0;
  const avgCo2PerTripKg = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.accounting.co2PerTripKg, 0) / count)
    : 0;
  const totalEsgCostEur = rows.reduce((sum, r) => sum + r.accounting.totalEsgCostEur, 0);
  const avgEsgCostPerTripEur = rows.length ? Math.round(totalEsgCostEur / count) : 0;
  const totalCommercialEur = rows.reduce((sum, r) => sum + r.accounting.commercialCostEur, 0);
  const portfolioEsgSharePct =
    totalCommercialEur + totalEsgCostEur > 0
      ? Number(((totalEsgCostEur / (totalCommercialEur + totalEsgCostEur)) * 100).toFixed(1))
      : 0;
  const avgCiiRatio = maritimeRows.length
    ? Number(
        (
          maritimeRows.reduce((sum, r) => sum + (r.compliance?.ciiRatio ?? 0.9), 0) /
          maritimeRows.length
        ).toFixed(2)
      )
    : 0.88;
  const portfolioCiiGrade = gradeCiiRatio(avgCiiRatio);
  const eexiCompliantCount = maritimeRows.filter((r) => r.compliance?.eexiCompliant).length;

  return {
    rows,
    avgTceEurPerDay,
    avgCo2PerTripKg,
    totalEsgCostEur,
    avgEsgCostPerTripEur,
    portfolioEsgSharePct,
    maritimeCount: maritimeRows.length,
    eexiCompliantCount,
    avgCiiRatio,
    portfolioCiiGrade
  };
};

export const ALL_FLEET_VESSEL_TYPES: VesselType[] = [
  'CONTAINER_DEEPSEA',
  'CONTAINER_FEEDER',
  'RORO_FERRY',
  'MULTI_PURPOSE_TRAMP',
  'HANDYSIZE_BULK',
  'COASTAL_CHARTER'
];

export const resolveShipmentVesselType = (shipment: Shipment): VesselType | null => {
  if (shipment.vesselType && VESSEL_TYPE_SPECS[shipment.vesselType]) {
    return shipment.vesselType;
  }
  const hasSea = (shipment.legs || []).some((l) => l.mode === TransportMode.SEA);
  if (!hasSea) return null;
  const legWithVessel = (shipment.legs || []).find((l) => l.vesselType);
  if (legWithVessel?.vesselType) return legWithVessel.vesselType;
  const svc = getShipmentSeaServiceType(shipment);
  if (svc === 'TRAMP') {
    return (shipment.weightTonnes || 0) >= 24 ? 'HANDYSIZE_BULK' : 'MULTI_PURPOSE_TRAMP';
  }
  const distKm = getShipmentDistanceKm(shipment);
  return distKm >= 4000 ? 'CONTAINER_DEEPSEA' : 'CONTAINER_FEEDER';
};

export const getSharedVesselKpis = (
  shipments: Shipment[],
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE
): SharedVesselKpiRow[] => {
  const transparencyMethod = `GLEC v3.0 WTW · IMO MEPC.328 · EU ETS €${Math.round(carbonPricePerTonne)}/t`;

  return ALL_FLEET_VESSEL_TYPES.map((vt) => {
    const spec = getVesselTypeSpec(vt);
    const compliance = getEffectiveVesselCompliance(vt, 0);
    const matchedLine = LINER_SERVICE_LINES.find((l) => l.vesselType === vt);
    const vesselShipments = (shipments || []).filter((s) => resolveShipmentVesselType(s) === vt);

    if (vesselShipments.length === 0) {
      // Deterministic baseline single-voyage benchmark using exact same route/accounting transparency formulas
      const benchmarkMode = spec.serviceType === 'TRAMP' ? 'SEA_TRAMP' : 'SEA_LINER';
      const baselineDistanceKm = vt === 'CONTAINER_DEEPSEA' ? 9500 : vt === 'HANDYSIZE_BULK' ? 3400 : 2100;
      const baselineWeightTonnes = vt === 'CONTAINER_DEEPSEA' ? 18 : vt === 'HANDYSIZE_BULK' ? 28 : 14;
      const syntheticOpt = buildDeterministicRouteOptions(
        'Piraeus, GR',
        'Rotterdam, NL',
        baselineWeightTonnes,
        carbonPricePerTonne,
        1,
        undefined,
        undefined,
        false,
        undefined,
        DEFAULT_PORT_DWELL_HOURS,
        spec.serviceType === 'LINER' ? vt : 'CONTAINER_DEEPSEA',
        spec.serviceType === 'TRAMP' ? vt : 'MULTI_PURPOSE_TRAMP'
      ).find((o) => o.mode === benchmarkMode);

      const fallbackTce = syntheticOpt
        ? computeRouteTripAccounting(syntheticOpt, carbonPricePerTonne, baselineWeightTonnes)
        : null;
      const baselineRel = computeModeScheduleReliability(benchmarkMode, DEFAULT_PORT_DWELL_HOURS, false, vt);
      const baselineCo2Kg = syntheticOpt
        ? syntheticOpt.estimatedEmissionsKg
        : Math.round(baselineDistanceKm * baselineWeightTonnes * spec.wtw);

      return {
        vesselType: vt,
        vesselName: compliance.vesselName,
        imoNumber: compliance.imoNumber,
        serviceType: spec.serviceType,
        capacityLabel: spec.capacityLabel,
        linerLineCode: matchedLine?.lineCode,
        defaultSpeedKts: spec.defaultSpeedKts,
        shipmentsCount: 0,
        totalTonnes: 0,
        totalTeuKm: 0,
        avgCo2PerTripKg: baselineCo2Kg,
        totalCo2Kg: 0,
        glecWtwKgPerTkm: spec.wtw,
        scheduleReliabilityPct: baselineRel.scheduleReliabilityPct,
        eexiMarginPct: compliance.eexiMarginPct,
        ciiGrade: compliance.ciiGrade,
        ciiRatio: compliance.ciiRatio,
        fuelEuIntensityGPerMj: compliance.fuelEuIntensityGPerMj,
        avgTceEurPerDay: fallbackTce?.tceEurPerDay ?? (spec.serviceType === 'LINER' ? 1120 : 945),
        avgTceSpreadEurPerDay: fallbackTce?.tceSpreadEurPerDay ?? 45,
        avgEsgCostPerTripEur: fallbackTce?.totalEsgCostEur ?? 110,
        esgSharePct: fallbackTce?.esgSharePct ?? 4.8,
        transparencyMethod
      };
    }

    const totalTonnes = Number(vesselShipments.reduce((sum, s) => sum + s.weightTonnes, 0).toFixed(1));
    const totalTeuKm = vesselShipments.reduce((sum, s) => sum + getShipmentTeuKm(s), 0);
    const totalCo2Kg = Math.round(vesselShipments.reduce((sum, s) => sum + s.totalEmissionsKg, 0));
    const avgCo2PerTripKg = Math.round(totalCo2Kg / vesselShipments.length);

    const relSum = vesselShipments.reduce((sum, s) => sum + getShipmentScheduleReliability(s), 0);
    const scheduleReliabilityPct = Number((relSum / vesselShipments.length).toFixed(1));

    const avgSlowPct =
      vesselShipments.reduce((sum, s) => sum + (s.slowSteamingPct ?? 0), 0) / vesselShipments.length;
    const effectiveComp = getEffectiveVesselCompliance(vt, avgSlowPct);

    const accList = vesselShipments.map((s) => getShipmentComplianceAccounting(s, carbonPricePerTonne).accounting);
    const avgTceEurPerDay = Math.round(accList.reduce((sum, a) => sum + a.tceEurPerDay, 0) / accList.length);
    const avgTceSpreadEurPerDay = Math.round(
      accList.reduce((sum, a) => sum + a.tceSpreadEurPerDay, 0) / accList.length
    );
    const avgEsgCostPerTripEur = Math.round(
      accList.reduce((sum, a) => sum + a.totalEsgCostEur, 0) / accList.length
    );
    const totalCommercial = accList.reduce((sum, a) => sum + a.commercialCostEur, 0);
    const totalEsg = accList.reduce((sum, a) => sum + a.totalEsgCostEur, 0);
    const esgSharePct =
      totalCommercial + totalEsg > 0
        ? Number(((totalEsg / (totalCommercial + totalEsg)) * 100).toFixed(1))
        : 0;

    return {
      vesselType: vt,
      vesselName: effectiveComp.vesselName,
      imoNumber: effectiveComp.imoNumber,
      serviceType: spec.serviceType,
      capacityLabel: spec.capacityLabel,
      linerLineCode: matchedLine?.lineCode,
      defaultSpeedKts: spec.defaultSpeedKts,
      shipmentsCount: vesselShipments.length,
      totalTonnes,
      totalTeuKm,
      avgCo2PerTripKg,
      totalCo2Kg,
      glecWtwKgPerTkm: spec.wtw,
      scheduleReliabilityPct,
      eexiMarginPct: effectiveComp.eexiMarginPct,
      ciiGrade: effectiveComp.ciiGrade,
      ciiRatio: effectiveComp.ciiRatio,
      fuelEuIntensityGPerMj: effectiveComp.fuelEuIntensityGPerMj,
      avgTceEurPerDay,
      avgTceSpreadEurPerDay,
      avgEsgCostPerTripEur,
      esgSharePct,
      transparencyMethod
    };
  });
};

/**
 * Reference benchmark case comparing Conventional VLSFO vs. Dual-Fuel Methanol-Ready vessels,
 * including green e-methanol premium pricing (illustrative reference case, not an active booking flow).
 */
export const getGreenFleetMethanolReferenceCases = (
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE,
  greenFuelPremiumEurPerTonneVlsfoEq: number = 290
): GreenFleetReferenceCase[] => {
  const baseCharterRateEurPerTeu = 1180;
  const baselineFuelTonnesPerTeu = 0.24; // Reference Med-Europe / Deep-Sea feeder voyage slice per TEU
  const baselineCo2TonnesPerTeu = baselineFuelTonnesPerTeu * 3.15; // ~0.756 t WTW CO2e / TEU

  // 1. Conventional VLSFO Vessel
  const convWtwGPerMj = 91.2;
  const convEuEts = Math.round(baselineCo2TonnesPerTeu * carbonPricePerTonne);
  const convFuelEuDeficit = 36; // > 89.34 g/MJ limit penalty exposure
  const convAllIn = baseCharterRateEurPerTeu + convEuEts + convFuelEuDeficit;

  // 2. Methanol-Ready Dual-Fuel Vessel (Operating on VLSFO / Grey Methanol bridge)
  const readyWtwGPerMj = 82.4;
  const readyCo2ReductionPct = 10;
  const readyCapexPremium = 68; // +5.8% newbuild readiness charter premium
  const readyEuEts = Math.round(baselineCo2TonnesPerTeu * (1 - readyCo2ReductionPct / 100) * carbonPricePerTonne);
  const readyFuelEuBalance = -18; // Slightly below 89.34 g/MJ limit
  const readyGreenRebate = 18; // Poseidon Principles B-grade green loan rebate
  const readyAllIn =
    baseCharterRateEurPerTeu +
    readyCapexPremium +
    readyEuEts +
    readyFuelEuBalance -
    readyGreenRebate;
  const readyNetPremium = readyAllIn - convAllIn;
  const readyAbatement = Math.round(
    Math.max(0, readyNetPremium) / Math.max(0.05, baselineCo2TonnesPerTeu * (readyCo2ReductionPct / 100))
  );

  // 3. Green e-Methanol Active Vessel (Premium Pricing Case)
  const greenWtwGPerMj = 25.5;
  const greenCo2ReductionPct = 72;
  const greenCapexPremium = 68;
  const greenFuelPremium = Math.round(baselineFuelTonnesPerTeu * Math.max(120, greenFuelPremiumEurPerTonneVlsfoEq));
  const greenEuEts = Math.round(baselineCo2TonnesPerTeu * (1 - greenCo2ReductionPct / 100) * carbonPricePerTonne);
  const greenFuelEuSurplus = -74; // FuelEU Maritime zero/low-GHG compliance surplus pooling credit
  const greenRebate = 32; // Tier-A ESG financing / Green Corridor port discount
  const greenAllIn =
    baseCharterRateEurPerTeu +
    greenCapexPremium +
    greenFuelPremium +
    greenEuEts +
    greenFuelEuSurplus -
    greenRebate;
  const greenNetPremium = greenAllIn - convAllIn;
  const greenCo2SavedTonnes = baselineCo2TonnesPerTeu * (greenCo2ReductionPct / 100);
  const greenAbatement =
    greenNetPremium > 0 ? Math.round(greenNetPremium / Math.max(0.05, greenCo2SavedTonnes)) : null;

  return [
    {
      id: 'conventional_vlsfo',
      vesselProfile: 'Conventional Container / Tramp (VLSFO)',
      fuelPathway: 'VLSFO 0.5% S (Fossil Baseline)',
      isPremiumCase: false,
      wtwIntensityGPerMj: convWtwGPerMj,
      co2ReductionPct: 0,
      ciiGrade: 'C',
      baseCharterRateEurPerTeu,
      capexReadinessPremiumEurPerTeu: 0,
      greenFuelPremiumEurPerTeu: 0,
      euEtsCostEurPerTeu: convEuEts,
      fuelEuBalanceEurPerTeu: convFuelEuDeficit,
      greenRebateEurPerTeu: 0,
      netAllInCostEurPerTeu: convAllIn,
      netPremiumVsConventionalEurPerTeu: 0,
      netPremiumPct: 0,
      abatementCostEurPerTonne: null
    },
    {
      id: 'methanol_ready_bridge',
      vesselProfile: 'Methanol-Ready Dual-Fuel (Bridge Ops)',
      fuelPathway: 'VLSFO + 15% Bio-Blend Readiness',
      isPremiumCase: false,
      wtwIntensityGPerMj: readyWtwGPerMj,
      co2ReductionPct: readyCo2ReductionPct,
      ciiGrade: 'B',
      baseCharterRateEurPerTeu,
      capexReadinessPremiumEurPerTeu: readyCapexPremium,
      greenFuelPremiumEurPerTeu: 0,
      euEtsCostEurPerTeu: readyEuEts,
      fuelEuBalanceEurPerTeu: readyFuelEuBalance,
      greenRebateEurPerTeu: readyGreenRebate,
      netAllInCostEurPerTeu: readyAllIn,
      netPremiumVsConventionalEurPerTeu: readyNetPremium,
      netPremiumPct: Number(((readyNetPremium / convAllIn) * 100).toFixed(1)),
      abatementCostEurPerTonne: readyNetPremium > 0 ? readyAbatement : null
    },
    {
      id: 'green_methanol_premium',
      vesselProfile: 'Methanol-Ready Vessel · Green e-Methanol',
      fuelPathway: 'Renewable e-Methanol / Bio-Methanol (Premium Case)',
      isPremiumCase: true,
      wtwIntensityGPerMj: greenWtwGPerMj,
      co2ReductionPct: greenCo2ReductionPct,
      ciiGrade: 'A',
      baseCharterRateEurPerTeu,
      capexReadinessPremiumEurPerTeu: greenCapexPremium,
      greenFuelPremiumEurPerTeu: greenFuelPremium,
      euEtsCostEurPerTeu: greenEuEts,
      fuelEuBalanceEurPerTeu: greenFuelEuSurplus,
      greenRebateEurPerTeu: greenRebate,
      netAllInCostEurPerTeu: greenAllIn,
      netPremiumVsConventionalEurPerTeu: greenNetPremium,
      netPremiumPct: Number(((greenNetPremium / convAllIn) * 100).toFixed(1)),
      abatementCostEurPerTonne: greenAbatement
    }
  ];
};

