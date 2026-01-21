
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
  portFees: number;
  insurance: number;
  customs: number;
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
  status: ShipmentStatus;
  legs: Leg[];
  costBreakdown: CostBreakdown;
  totalCost: number;
  totalEmissionsKg: number;
  trackingHistory: TrackingEvent[];
  createdAt: string;
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
