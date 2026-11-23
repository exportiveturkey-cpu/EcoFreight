
export enum TransportMode {
  SEA = 'SEA',
  AIR = 'AIR',
  ROAD = 'ROAD',
  RAIL = 'RAIL'
}

export enum ShipmentStatus {
  BOOKED = 'Booked',
  IN_TRANSIT = 'In Transit',
  CUSTOMS = 'Customs',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export type SeaServiceType = 'LINER' | 'TRAMP';

export type VesselType =
  | 'CONTAINER_DEEPSEA'
  | 'CONTAINER_FEEDER'
  | 'RORO_FERRY'
  | 'MULTI_PURPOSE_TRAMP'
  | 'HANDYSIZE_BULK'
  | 'COASTAL_CHARTER';

export interface Leg {
  id: string;
  mode: TransportMode;
  seaServiceType?: SeaServiceType;
  vesselType?: VesselType;
  origin: string;
  destination: string;
  distanceKm: number;
  cost: number;
  emissionsKg: number;
}

export interface CostBreakdown {
  freight: number;
  fuelSurcharge: number;
  carbonCost?: number;
  portFees: number;
  dwellCost?: number;
  insurance: number;
  customs: number;
}

export type SpeedProfile = 'standard' | 'eco';

export interface RouteCostOption {
  mode: string;
  seaServiceType?: SeaServiceType;
  vesselType?: VesselType;
  linerLineCode?: string;
  linerLineName?: string;
  fixedDepartureUtc?: string;
  predictableEtaWindow?: string;
  etaConfidenceHours?: number;
  publishedEmissionGPerTeuKm?: number;
  publishedEmissionMethod?: string;
  ballastPct?: number;
  dwellMultiplier?: number;
  speedProfile?: SpeedProfile;
  slowSteamingPct?: number;
  vesselSpeedKnots?: number;
  fuelSavedUnits?: number;
  fuelSavedEur?: number;
  co2SavedKg?: number;
  co2SavedEur?: number;
  fuelPlusCo2SavedEur?: number;
  estimatedDays: number;
  dwellHours?: number;
  dwellDaysAdded?: number;
  scheduleReliabilityPct?: number;
  baselineReliabilityPct?: number;
  estimatedDistanceKm: number;
  containers: number;
  teuKm: number;
  costPerTeuKm: number;
  emissionsPerTeuKm: number;
  baseFreightCost: number;
  fuelCost: number;
  co2Cost: number;
  fuelPlusCo2Cost: number;
  originPortFee: number;
  destinationPortFee: number;
  portFeeTotal: number;
  dwellCost?: number;
  dwellEmissionsKg?: number;
  linehaulEmissionsKg?: number;
  estimatedCost: number;
  estimatedEmissionsKg: number;
  glecFactorWtw?: number;
  ttwEmissionsKg?: number;
  wttEmissionsKg?: number;
  glecSource?: string;
  fuelConsumption: number;
  fuelUnit: string;
  label: string;
  reasoning: string;
  eexiCii?: EexiCiiRecord;
  tripAccounting?: TripComplianceAccounting;
}

export interface LinerServiceLine {
  lineCode: string;
  lineName: string;
  carrier: string;
  corridorLabel: string;
  corridorKeywords: string[];
  vesselType: VesselType;
  frequency: string;
  departureWindowUtc: string;
  cutoffWindowUtc: string;
  predictableEtaWindow: string;
  etaToleranceHours: number;
  scheduleReliabilityPct: number;
  weatherWindowStatus: 'clear' | 'watch' | 'advisory';
  weatherWindowSummary: string;
  publishedEmissionKgPerTkm: number;
  publishedEmissionGPerTeuKm: number;
  publishedVoyageKgPerTeu: number;
  publicationStandard: string;
  fuelBlend: string;
  yoyIntensityDeltaPct: number;
}

export interface LinerAlertEvent {
  id: string;
  shipmentId: string;
  lineCode: string;
  lineName: string;
  category: 'schedule_change' | 'weather_window';
  severity: 'info' | 'warning';
  channel: 'sms_and_app' | 'app_only';
  recipientPhone: string;
  title: string;
  message: string;
  etaImpact: string;
  timestamp: string;
  read: boolean;
}

export interface LinerNotificationPrefs {
  smsEnabled: boolean;
  inAppEnabled: boolean;
  scheduleChanges: boolean;
  weatherWindows: boolean;
  recipientPhone: string;
}

export type CiiGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface EexiCiiRecord {
  vesselType: VesselType;
  vesselName: string;
  imoNumber: string;
  dwt: number;
  attainedEexi: number;
  requiredEexi: number;
  eexiMarginPct: number;
  eexiCompliant: boolean;
  eplPowerLimitPct: number;
  attainedCii: number;
  requiredCii: number;
  ciiRatio: number;
  ciiGrade: CiiGrade;
  ciiProjectedNextYear: CiiGrade;
  fuelEuIntensityGPerMj: number;
}

export interface TripComplianceAccounting {
  grossFreightRevenueEur: number;
  voyageExpensesEur: number;
  netVoyageContributionEur: number;
  voyageDays: number;
  tceEurPerDay: number;
  benchmarkTceEurPerDay: number;
  tceSpreadEurPerDay: number;
  co2PerTripKg: number;
  co2PerTripTonnes: number;
  co2PerDayKg: number;
  co2PerNmKg: number;
  tcePerTonneCo2: number;
  commercialCostEur: number;
  euEtsCostEur: number;
  fuelEuComplianceEur: number;
  dwellCarbonCostEur: number;
  voluntaryOffsetCostEur: number;
  greenFinancingRebateEur: number;
  totalEsgCostEur: number;
  esgAdjustedCostEur: number;
  esgSharePct: number;
  esgCostPerTeuKm: number;
}

export interface CarbonAwareTradeOff {
  baselineRoute: RouteCostOption;
  recommendedRoute: RouteCostOption;
  recommendationType: 'route_shift' | 'eco_speed' | 'route_and_speed';
  costDeltaEur: number;
  costDeltaPct: number;
  co2SavedKg: number;
  co2SavedPct: number;
  transitDaysDelta: number;
  reliabilityDeltaPct: number;
  abatementEurPerTonne: number | null;
}

export interface Shipment {
  id: string;
  customerName: string;
  origin: string;
  destination: string;
  cargoType: string;
  incoterms: string;
  weightTonnes: number;
  volumeCbm: number;
  containers?: number;
  seaServiceType?: SeaServiceType;
  vesselType?: VesselType;
  linerLineCode?: string;
  linerLineName?: string;
  fixedDepartureUtc?: string;
  predictableEtaWindow?: string;
  etaConfidenceHours?: number;
  publishedEmissionGPerTeuKm?: number;
  dwellTimeHours?: number;
  scheduleDelayHours?: number;
  scheduleReliabilityPct?: number;
  speedProfile?: SpeedProfile;
  slowSteamingPct?: number;
  status: ShipmentStatus;
  legs: Leg[];
  costBreakdown: CostBreakdown;
  totalCost: number;
  totalEmissionsKg: number;
  eexiCii?: EexiCiiRecord;
  tripAccounting?: TripComplianceAccounting;
  trackingHistory: TrackingEvent[];
  createdAt: string;
}

export interface ScheduleReliabilityPoint {
  period: string;
  overallPct: number;
  seaPct: number;
  intermodalPct: number;
  roadPct: number;
  onTimeCount: number;
  totalCount: number;
  avgDelayHours: number;
}

export interface AnalyticsData {
  month: string;
  shipments: number;
  emissions: number;
  cost: number;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}
