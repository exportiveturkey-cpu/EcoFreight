import { Shipment, ShipmentStatus, TransportMode } from '../types';

export const INITIAL_SAMPLE_SHIPMENTS: Shipment[] = [
  {
    id: 'SH-8291',
    customerName: 'AeroDynamics NV',
    origin: 'Rotterdam, NL',
    destination: 'Singapore, SG',
    cargoType: 'Aerospace Precision Components',
    incoterms: 'DAP',
    weightTonnes: 4.2,
    volumeCbm: 12.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Rotterdam Port', destination: 'Suez Canal', distanceKm: 6000, cost: 1400, emissionsKg: 302 },
      { id: 'L2', mode: TransportMode.SEA, origin: 'Suez Canal', destination: 'PSA Singapore', distanceKm: 9500, cost: 2200, emissionsKg: 478 }
    ],
    costBreakdown: { freight: 3100, fuelSurcharge: 300, portFees: 120, insurance: 80, customs: 0 },
    totalCost: 3600,
    totalEmissionsKg: 780,
    trackingHistory: [
      { status: 'Departed Port', location: 'Rotterdam Gate 4', timestamp: '2026-10-02T08:00:00Z', description: 'Vessel EVER-GREEN unmoored' },
      { status: 'In Transit', location: 'Suez Canal Transit', timestamp: '2026-10-06T14:30:00Z', description: 'Northbound convoy clearance obtained' }
    ],
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'SH-8402',
    customerName: 'Hellenic Marine Dynamics',
    origin: 'Piraeus, GR',
    destination: 'Hamburg, DE',
    cargoType: 'Industrial Marine Auxiliary Engines',
    incoterms: 'FOB',
    weightTonnes: 8.5,
    volumeCbm: 24.5,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.RAIL, origin: 'Piraeus Rail Yard', destination: 'Belgrade Intermodal', distanceKm: 980, cost: 1850, emissionsKg: 208 },
      { id: 'L2', mode: TransportMode.RAIL, origin: 'Belgrade Intermodal', destination: 'Hamburg Hub', distanceKm: 1350, cost: 2350, emissionsKg: 286 }
    ],
    costBreakdown: { freight: 3800, fuelSurcharge: 220, portFees: 90, insurance: 90, customs: 0 },
    totalCost: 4200,
    totalEmissionsKg: 494,
    trackingHistory: [
      { status: 'Loaded on Rail', location: 'Piraeus Rail Terminal', timestamp: '2026-10-04T09:15:00Z', description: 'Containers locked onto electrified rail wagons' },
      { status: 'Crossing Corridor', location: 'Subotica Border', timestamp: '2026-10-06T18:00:00Z', description: 'Corridor transit check completed' }
    ],
    createdAt: '2026-10-03T11:20:00Z'
  },
  {
    id: 'SH-8519',
    customerName: 'Mediterranean Agritech SA',
    origin: 'Valencia, ES',
    destination: 'Munich, DE',
    cargoType: 'Cold-Chain Organic Citrus & Extracts',
    incoterms: 'CIF',
    weightTonnes: 12.0,
    volumeCbm: 32.0,
    status: ShipmentStatus.DELIVERED,
    legs: [
      { id: 'L1', mode: TransportMode.ROAD, origin: 'Valencia Packhouse', destination: 'Lyon Terminal', distanceKm: 850, cost: 2100, emissionsKg: 1071 },
      { id: 'L2', mode: TransportMode.RAIL, origin: 'Lyon Terminal', destination: 'Munich Riem', distanceKm: 720, cost: 1600, emissionsKg: 216 }
    ],
    costBreakdown: { freight: 3300, fuelSurcharge: 250, portFees: 0, insurance: 150, customs: 0 },
    totalCost: 3700,
    totalEmissionsKg: 1287,
    trackingHistory: [
      { status: 'Delivered', location: 'Munich Riem Cargo Center', timestamp: '2026-10-05T16:45:00Z', description: 'Consignment accepted by client warehouse' }
    ],
    createdAt: '2026-09-28T07:30:00Z'
  },
  {
    id: 'SH-8630',
    customerName: 'Nordic Solar Solutions',
    origin: 'Gothenburg, SE',
    destination: 'Antwerp, BE',
    cargoType: 'Photovoltaic Inverters & Cells',
    incoterms: 'DDP',
    weightTonnes: 15.2,
    volumeCbm: 42.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Port of Gothenburg', destination: 'Port of Antwerp', distanceKm: 1100, cost: 1950, emissionsKg: 200 }
    ],
    costBreakdown: { freight: 1750, fuelSurcharge: 100, portFees: 80, insurance: 20, customs: 0 },
    totalCost: 1950,
    totalEmissionsKg: 200,
    trackingHistory: [
      { status: 'Departed Quay', location: 'Gothenburg Ro-Ro Gate', timestamp: '2026-10-05T12:00:00Z', description: 'Direct short-sea feeder in North Sea transit' }
    ],
    createdAt: '2026-10-04T14:10:00Z'
  },
  {
    id: 'SH-8744',
    customerName: 'Aegean Hydrogen Tech',
    origin: 'Thessaloniki, GR',
    destination: 'Milan, IT',
    cargoType: 'Electrolyzer Composite Membranes',
    incoterms: 'FCA',
    weightTonnes: 3.8,
    volumeCbm: 10.5,
    status: ShipmentStatus.CUSTOMS,
    legs: [
      { id: 'L1', mode: TransportMode.ROAD, origin: 'Thessaloniki Hub', destination: 'Igoumenitsa Port', distanceKm: 320, cost: 750, emissionsKg: 128 },
      { id: 'L2', mode: TransportMode.SEA, origin: 'Igoumenitsa Port', destination: 'Bari Ferry Terminal', distanceKm: 240, cost: 950, emissionsKg: 11 },
      { id: 'L3', mode: TransportMode.RAIL, origin: 'Bari Intermodal', destination: 'Milan Segrate', distanceKm: 880, cost: 1400, emissionsKg: 83 }
    ],
    costBreakdown: { freight: 2750, fuelSurcharge: 180, portFees: 70, insurance: 100, customs: 0 },
    totalCost: 3100,
    totalEmissionsKg: 222,
    trackingHistory: [
      { status: 'Customs Inspection', location: 'Bari Port Gate 3', timestamp: '2026-10-06T11:00:00Z', description: 'Green channel export clearance check in progress' }
    ],
    createdAt: '2026-10-04T08:00:00Z'
  },
  {
    id: 'SH-8855',
    customerName: 'EuroPharma Logistics',
    origin: 'Basel, CH',
    destination: 'Athens, GR',
    cargoType: 'Temperature-Controlled Biologics',
    incoterms: 'CPT',
    weightTonnes: 1.2,
    volumeCbm: 4.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.AIR, origin: 'EuroAirport Basel', destination: 'Athens Eleftherios Venizelos', distanceKm: 1650, cost: 3800, emissionsKg: 2237 }
    ],
    costBreakdown: { freight: 3400, fuelSurcharge: 250, portFees: 50, insurance: 100, customs: 0 },
    totalCost: 3800,
    totalEmissionsKg: 2237,
    trackingHistory: [
      { status: 'In Flight', location: 'Adriatic Air Corridor', timestamp: '2026-10-07T06:30:00Z', description: 'Cold box temperature steady at +3.8°C' }
    ],
    createdAt: '2026-10-06T15:20:00Z'
  },
  {
    id: 'SH-8961',
    customerName: 'Aegean Olive Oils Ltd',
    origin: 'Heraklion, GR',
    destination: 'London, UK',
    cargoType: 'Extra Virgin Organic Olive Oil',
    incoterms: 'FOB',
    weightTonnes: 21.0,
    volumeCbm: 38.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Heraklion Port', destination: 'Piraeus Port', distanceKm: 320, cost: 800, emissionsKg: 80 },
      { id: 'L2', mode: TransportMode.SEA, origin: 'Piraeus Port', destination: 'Felixstowe Port', distanceKm: 5800, cost: 3100, emissionsKg: 1461 }
    ],
    costBreakdown: { freight: 3400, fuelSurcharge: 300, portFees: 120, insurance: 80, customs: 0 },
    totalCost: 3900,
    totalEmissionsKg: 1541,
    trackingHistory: [
      { status: 'Feeder Sea Leg', location: 'Piraeus Terminal 2', timestamp: '2026-10-05T20:00:00Z', description: 'Transshipped to Mediterranean-UK deep sea loop' }
    ],
    createdAt: '2026-10-03T16:00:00Z'
  },
  {
    id: 'SH-9072',
    customerName: 'Black Sea Timber Co.',
    origin: 'Constanța, RO',
    destination: 'Genoa, IT',
    cargoType: 'FSC-Certified Hardwood Timbers',
    incoterms: 'CFR',
    weightTonnes: 26.5,
    volumeCbm: 55.0,
    status: ShipmentStatus.BOOKED,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Port of Constanța', destination: 'Port of Genoa', distanceKm: 3400, cost: 2800, emissionsKg: 1081 }
    ],
    costBreakdown: { freight: 2500, fuelSurcharge: 180, portFees: 70, insurance: 50, customs: 0 },
    totalCost: 2800,
    totalEmissionsKg: 1081,
    trackingHistory: [
      { status: 'Booking Confirmed', location: 'Constanța Berth 4', timestamp: '2026-10-07T05:00:00Z', description: 'Vessel loading schedule finalized for Oct 9' }
    ],
    createdAt: '2026-10-06T18:40:00Z'
  },
  {
    id: 'SH-9183',
    customerName: 'Iberian Automotive SA',
    origin: 'Barcelona, ES',
    destination: 'Stuttgart, DE',
    cargoType: 'EV Aluminum Battery Trays',
    incoterms: 'DAP',
    weightTonnes: 6.4,
    volumeCbm: 18.0,
    status: ShipmentStatus.DELIVERED,
    legs: [
      { id: 'L1', mode: TransportMode.RAIL, origin: 'Barcelona Can Tunis', destination: 'Lyon Guillotière', distanceKm: 640, cost: 1100, emissionsKg: 102 },
      { id: 'L2', mode: TransportMode.RAIL, origin: 'Lyon Guillotière', destination: 'Stuttgart Hafen', distanceKm: 580, cost: 950, emissionsKg: 93 }
    ],
    costBreakdown: { freight: 1850, fuelSurcharge: 120, portFees: 0, insurance: 80, customs: 0 },
    totalCost: 2050,
    totalEmissionsKg: 195,
    trackingHistory: [
      { status: 'Delivered', location: 'Stuttgart OEM Assembly Plant', timestamp: '2026-10-06T14:00:00Z', description: 'Proof of delivery signed electronically' }
    ],
    createdAt: '2026-10-02T10:15:00Z'
  },
  {
    id: 'SH-9294',
    customerName: 'Danubian Metalworks GmbH',
    origin: 'Linz, AT',
    destination: 'Piraeus, GR',
    cargoType: 'Low-Carbon Green Steel Coils (CBAM)',
    incoterms: 'FOB',
    weightTonnes: 32.0,
    volumeCbm: 28.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.RAIL, origin: 'Linz Voestalpine Siding', destination: 'Budapest Soroksár', distanceKm: 310, cost: 1400, emissionsKg: 248 },
      { id: 'L2', mode: TransportMode.RAIL, origin: 'Budapest Soroksár', destination: 'Piraeus Port Gate', distanceKm: 1450, cost: 3600, emissionsKg: 1160 }
    ],
    costBreakdown: { freight: 4500, fuelSurcharge: 320, portFees: 110, insurance: 70, customs: 0 },
    totalCost: 5000,
    totalEmissionsKg: 1408,
    trackingHistory: [
      { status: 'In Transit', location: 'Thessaloniki Transit Marshaling', timestamp: '2026-10-06T22:30:00Z', description: 'Electric locomotive engine handover completed' }
    ],
    createdAt: '2026-10-03T09:00:00Z'
  },
  {
    id: 'SH-9405',
    customerName: 'Baltic EcoPaper Corp',
    origin: 'Helsinki, FI',
    destination: 'Gdańsk, PL',
    cargoType: 'Recycled Kraft Packaging Rolls',
    incoterms: 'CIF',
    weightTonnes: 18.5,
    volumeCbm: 48.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Helsinki Vuosaari', destination: 'Gdańsk DCT', distanceKm: 780, cost: 1650, emissionsKg: 173 }
    ],
    costBreakdown: { freight: 1450, fuelSurcharge: 110, portFees: 60, insurance: 30, customs: 0 },
    totalCost: 1650,
    totalEmissionsKg: 173,
    trackingHistory: [
      { status: 'Underway', location: 'Gulf of Finland', timestamp: '2026-10-07T03:15:00Z', description: 'Bio-LNG powered feeder on schedule' }
    ],
    createdAt: '2026-10-05T13:40:00Z'
  },
  {
    id: 'SH-9516',
    customerName: 'Rhine Chemical Solutions',
    origin: 'Duisburg, DE',
    destination: 'Rotterdam, NL',
    cargoType: 'Eco-Solvents & Bio-Polymers',
    incoterms: 'EXW',
    weightTonnes: 45.0,
    volumeCbm: 60.0,
    status: ShipmentStatus.DELIVERED,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Duisburg Port', destination: 'Rotterdam Waalhaven', distanceKm: 220, cost: 1200, emissionsKg: 118 }
    ],
    costBreakdown: { freight: 1050, fuelSurcharge: 80, portFees: 40, insurance: 30, customs: 0 },
    totalCost: 1200,
    totalEmissionsKg: 118,
    trackingHistory: [
      { status: 'Barge Discharged', location: 'Rotterdam Waalhaven', timestamp: '2026-10-05T11:00:00Z', description: 'Electric inland barge discharged smoothly' }
    ],
    createdAt: '2026-10-02T14:00:00Z'
  },
  {
    id: 'SH-9627',
    customerName: 'Athenian Microelectronics',
    origin: 'Athens, GR',
    destination: 'Frankfurt, DE',
    cargoType: 'Semiconductor Testing Modules',
    incoterms: 'DAP',
    weightTonnes: 1.5,
    volumeCbm: 3.2,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.AIR, origin: 'Athens International', destination: 'Frankfurt Main Airport', distanceKm: 1820, cost: 2950, emissionsKg: 3084 }
    ],
    costBreakdown: { freight: 2600, fuelSurcharge: 220, portFees: 60, insurance: 70, customs: 0 },
    totalCost: 2950,
    totalEmissionsKg: 3084,
    trackingHistory: [
      { status: 'Air Freight Loaded', location: 'Athens Cargo Gate 7', timestamp: '2026-10-07T04:00:00Z', description: 'ULD container secured on freighter' }
    ],
    createdAt: '2026-10-06T19:30:00Z'
  },
  {
    id: 'SH-9738',
    customerName: 'Adriatic Seafood Coldchain',
    origin: 'Split, HR',
    destination: 'Venice, IT',
    cargoType: 'Fresh Sea Bass & Sea Bream',
    incoterms: 'CPT',
    weightTonnes: 5.2,
    volumeCbm: 14.0,
    status: ShipmentStatus.DELIVERED,
    legs: [
      { id: 'L1', mode: TransportMode.ROAD, origin: 'Split Cold Depot', destination: 'Trieste Terminal', distanceKm: 420, cost: 1100, emissionsKg: 229 },
      { id: 'L2', mode: TransportMode.ROAD, origin: 'Trieste Terminal', destination: 'Venice Tronchetto', distanceKm: 155, cost: 450, emissionsKg: 85 }
    ],
    costBreakdown: { freight: 1350, fuelSurcharge: 120, portFees: 0, insurance: 80, customs: 0 },
    totalCost: 1550,
    totalEmissionsKg: 314,
    trackingHistory: [
      { status: 'Delivered', location: 'Venice Tronchetto Fish Market', timestamp: '2026-10-06T06:00:00Z', description: 'Early morning delivery confirmed' }
    ],
    createdAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'SH-9849',
    customerName: 'Bosphorus Heavy Spares',
    origin: 'Izmir, TR',
    destination: 'Rotterdam, NL',
    cargoType: 'Wind Turbine Casting Castings',
    incoterms: 'FOB',
    weightTonnes: 28.0,
    volumeCbm: 35.0,
    status: ShipmentStatus.IN_TRANSIT,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Port of Alsancak (Izmir)', destination: 'Piraeus Port', distanceKm: 390, cost: 1100, emissionsKg: 131 },
      { id: 'L2', mode: TransportMode.RAIL, origin: 'Piraeus Port', destination: 'Rotterdam Maasvlakte', distanceKm: 2750, cost: 4600, emissionsKg: 1925 }
    ],
    costBreakdown: { freight: 5100, fuelSurcharge: 380, portFees: 120, insurance: 100, customs: 0 },
    totalCost: 5700,
    totalEmissionsKg: 2056,
    trackingHistory: [
      { status: 'Intermodal Transfer', location: 'Piraeus Rail Transfer Hub', timestamp: '2026-10-06T15:00:00Z', description: 'Gantry crane transferred container to block train' }
    ],
    createdAt: '2026-10-03T11:00:00Z'
  },
  {
    id: 'SH-9950',
    customerName: 'Scandinavian Battery Cells',
    origin: 'Oslo, NO',
    destination: 'Copenhagen, DK',
    cargoType: 'Lithium-Iron Phosphate (LFP) Cells',
    incoterms: 'DDP',
    weightTonnes: 9.6,
    volumeCbm: 20.0,
    status: ShipmentStatus.BOOKED,
    legs: [
      { id: 'L1', mode: TransportMode.SEA, origin: 'Port of Oslo', destination: 'Port of Copenhagen', distanceKm: 510, cost: 1350, emissionsKg: 59 }
    ],
    costBreakdown: { freight: 1200, fuelSurcharge: 80, portFees: 40, insurance: 30, customs: 0 },
    totalCost: 1350,
    totalEmissionsKg: 59,
    trackingHistory: [
      { status: 'Scheduled for Loading', location: 'Oslo Sydhavna', timestamp: '2026-10-07T06:00:00Z', description: 'Automated electric ro-ro scheduled for departure' }
    ],
    createdAt: '2026-10-06T21:00:00Z'
  }
];
