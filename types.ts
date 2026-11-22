
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

export interface Leg {
  id: string;
  mode: TransportMode;
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
