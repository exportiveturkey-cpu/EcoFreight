export type Language = 'en' | 'el' | 'tr';

export interface Translations {
  dashboard: string;
  shipments: string;
  tracking: string;
  sustainability: string;
  globalNetwork: string;
  docs: string;
  settings: string;
  aiAssistant: string;
  operationalOverview: string;
  realTimeMetrics: string;
  totalShipments: string;
  carbonFootprint: string;
  freightSpend: string;
  avgIntensity: string;
  newShipment: string;
  createShipment: string;
  customer: string;
  origin: string;
  destination: string;
  weight: string;
  volume: string;
  incoterms: string;
  mode: string;
  status: string;
  history: string;
  aiInsights: string;
  offsetting: string;
  search: string;
  cancel: string;
  book: string;
  esgScore: string;
  
  // Navigation & User
  signOut: string;
  switchMode: string;
  daysRemaining: string;
  days: string;
  
  // Demo & Roles
  demoJury: string;
  demoClient: string;
  demoAccount: string;
  tryDemo: string;
  tryDemoDesc: string;
  readOnly: string;
  readOnlyNoticeTitle: string;
  readOnlyNoticeDesc: string;
  demoExpired: string;
  demoExpiredDesc: string;
  renewDemo: string;
  contact: string;
  
  // Login & Demo selector
  quickDemoAccess: string;
  instantAccess: string;
  orCorporate: string;
  juryCardTitle: string;
  juryCardDesc: string;
  startJury: string;
  clientCardTitle: string;
  clientCardDesc: string;
  startClient: string;
  linkCopied: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signInBtn: string;
  
  // Consignment Table & Modes
  consignment: string;
  originDest: string;
  cargoWeight: string;
  emissions: string;
  freightCost: string;
  inTransit: string;
  delivered: string;
  booked: string;
  sea: string;
  rail: string;
  road: string;
  air: string;
  modalDistribution: string;
  weeklyTrend: string;
  customs: string;
  cancelled: string;
  actions: string;
  route: string;
  idCustomer: string;
  back: string;
  close: string;
  dashTitle: string;
  dashSubtitle: string;
  activeConsignments: string;
  completed: string;
  intermodalEfficiency: string;
  greenShare: string;
  emissionsCurve: string;
  emissionsCurveDesc: string;
  activeCorridors: string;
  modalShiftBenefit: string;
  modalShiftDesc: string;
  shipTitle: string;
  shipSubtitle: string;
  newShipmentAnalysis: string;
  dropBol: string;
  analyzeOptions: string;
  fillRequired: string;
  bookNow: string;
  shipmentDetails: string;
  legs: string;
  totalCost: string;
  publicPortal: string;
  copyTrackingLink: string;
  copied: string;
  trackTitle: string;
  trackSubtitle: string;
  chokepointAlerts: string;
  consignmentMetrics: string;
  milestoneHistory: string;
  damageAudit: string;
  uploadPhoto: string;
  noShipments: string;
  sustTitle: string;
  sustSubtitle: string;
  complianceEngine: string;
  exportReport: string;
  offsetMarket: string;
  offsetDesc: string;
  investNow: string;
  neutralized: string;
  verticalTitle: string;
  verticalSub: string;
  verticalMaritime: string;
  verticalMaritimeDesc: string;
  verticalRoad: string;
  verticalRoadDesc: string;
  comingSoon: string;
  roadFleet: string;
  roadRoutes: string;
  roadDrivers: string;
  roadCarbon: string;
  roadCompliance: string;
  switchVertical: string;
  vehicleType: string;
  distanceKm: string;
  emissionsResult: string;
  indicativeFactors: string;
  routeEstimate: string;
  routeAssumptions: string;
  placeholderNote: string;
  vtVan: string;
  vtTruck7: string;
  vtTruck18: string;
  vtTruck40: string;
  vtEVan: string;
  carbonEstimate: string;
  cbamLabel: string;
  cbamSub: string;
  complianceSub: string;
  targetProgress: string;
  coPilot: string;
  emissionsByZone: string;
  netTitle: string;
  netSubtitle: string;
  aiTitle: string;
  aiSubtitle: string;
  aiWelcome: string;
  aiPlaceholder: string;
  aiThinking: string;
  aiError: string;
  voiceInput: string;
  listening: string;
  voiceUnsupported: string;
  quickPrompts: string;
  qpSuez: string;
  qpSuezQ: string;
  qpEmissions: string;
  qpEmissionsQ: string;
  qpFleet: string;
  qpFleetQ: string;
  notifications: string;
  preferredCarrier: string;
  preferredCarrierSet: string;

  // Route Cost Optimization (Fuel + CO2 + Port Fees)
  routeOptimizer: string;
  routeOptimizerTitle: string;
  routeOptimizerSubtitle: string;
  fuelCost: string;
  co2Cost: string;
  fuelPlusCo2: string;
  baseFreight: string;
  totalLandedCost: string;
  carbonPriceLabel: string;
  fuelIndexLabel: string;
  optimizePriority: string;
  priorityTotalCost: string;
  priorityFuelCo2: string;
  priorityFastest: string;
  optimalChoice: string;
  savingsVsRoad: string;
  runCostOptimization: string;
  corridorPresets: string;
  bookSelectedRoute: string;
  transitDays: string;
  costBreakdownTitle: string;
  portFees: string;
  originPortFee: string;
  destinationPortFee: string;
  autoEstimatePorts: string;
  applyTerminalFeesAllModes: string;
  portFeesActiveNote: string;
  shipmentLedgerTitle: string;

  // TEU-km Metrics (Distance x Containers)
  containersTeu: string;
  teuKm: string;
  teuKmFormula: string;
  costPerTeuKm: string;
  co2PerTeuKm: string;
  totalTeuKm: string;
  unitCostTeuKm: string;

  // GLEC Framework v3.0 Methodology Disclosure
  glecMethodBtn: string;
  glecMethodTitle: string;
  glecMethodSubtitle: string;
  glecStandardLabel: string;
  glecBoundaryLabel: string;
  glecFormulaLabel: string;
  glecTtwLabel: string;
  glecWttLabel: string;
  glecTotalWtwLabel: string;
  glecLiveCalculation: string;
  glecFactorsTableTitle: string;
  glecTocSource: string;

  // Port Dwell Time (Demurrage & Hoteling Impact)
  dwellTimeHours: string;
  dwellCost: string;
  dwellEmissions: string;
  dwellImpactLabel: string;
  dwellPresetFast: string;
  dwellPresetNormal: string;
  dwellPresetModerate: string;
  dwellPresetCongested: string;
  dwellNote: string;

  // Schedule Reliability Over Time (OTIF / Planned ETA Adherence)
  scheduleReliability: string;
  reliabilityOverTime: string;
  reliabilityOverTimeDesc: string;
  scheduleReliabilityNote: string;
  onTimeArrivals: string;
  avgScheduleDelay: string;
  slaTarget: string;
  priorityReliability: string;
  scheduleAdherence: string;
  onTime: string;
  delayed: string;
  months6Label: string;
  weeks12Label: string;

  // Carbon-Aware Routing & Cost/Speed Trade-Off
  priorityCarbonAware: string;
  speedProfileLabel: string;
  standardSpeed: string;
  ecoSpeedLabel: string;
  carbonAwareTitle: string;
  carbonAwareDesc: string;
  costTolerance: string;
  similarCostBand: string;
  baselineOption: string;
  carbonAwareOption: string;
  applyCarbonAware: string;
  carbonAwareApplied: string;
  co2SavingsLabel: string;
  costDeltaLabel: string;
  transitDeltaLabel: string;
  reliabilityDeltaLabel: string;
  abatementCostLabel: string;
  tradeoffChartTitle: string;
  tradeoffChartDesc: string;
  recTypeRouteAndSpeed: string;
  recTypeRouteShift: string;
  recTypeEcoSpeed: string;

  // Slow Steaming Fuel & CO2 Savings
  slowSteamingTitle: string;
  slowSteamingDesc: string;
  slowSteamingSpeedReduction: string;
  slowSteamingNormal: string;
  slowSteaming10: string;
  slowSteaming15: string;
  slowSteaming20: string;
  slowSteaming25: string;
  fuelSavedLabel: string;
  co2SavedLabel: string;
  combinedSavingsLabel: string;
  vesselSpeedLabel: string;
  speedSavingsCurveTitle: string;
  propellerLawNote: string;

  // Vessel & Sea Service Subcategories (Liner vs. Tramp)
  seaLiner: string;
  seaTramp: string;
  seaServiceSubcategories: string;
  linerServiceLabel: string;
  trampServiceLabel: string;
  linerVesselTypeLabel: string;
  trampVesselTypeLabel: string;
  seaFilterAll: string;
  seaFilterLiner: string;
  seaFilterTramp: string;
  linerLogicSummary: string;
  trampLogicSummary: string;
  serviceLogicTitle: string;
  pricingModelLabel: string;
  berthDwellLogicLabel: string;
  ballastFactorLabel: string;
  reliabilityBaselineLabel: string;
  cruisingSpeedLabel: string;
  vesselContainerDeepsea: string;
  vesselContainerFeeder: string;
  vesselRoroFerry: string;
  vesselMppTramp: string;
  vesselHandysizeBulk: string;
  vesselCoastalCharter: string;

  // Liner Fixed Schedules, Predictable ETAs, SMS/Weather Alerts & Published Line Emissions
  fixedScheduleLabel: string;
  predictableEtaLabel: string;
  publishedLineEmissionsTitle: string;
  publishedLineEmissionsDesc: string;
  linerLineCol: string;
  sailingScheduleCol: string;
  etaWindowCol: string;
  publishedIntensityCol: string;
  weatherWindowCol: string;
  smsAlertsTitle: string;
  smsAlertsScopeNote: string;
  smsChannelLabel: string;
  inAppChannelLabel: string;
  scheduleChangeAlertsLabel: string;
  weatherWindowAlertsLabel: string;
  demoPhoneLabel: string;
  simulateScheduleAlertBtn: string;
  simulateWeatherAlertBtn: string;
  alertDispatchedLogTitle: string;
  markAllReadBtn: string;
  cutoffLabel: string;
  yoyTrendLabel: string;

  // Compliance & Accounting: EEXI/CII, TCE & CO2 per Trip, ESG Cost Accounting
  complianceAccountingTitle: string;
  complianceAccountingSubtitle: string;
  eexiCiiTrackerTitle: string;
  eexiCiiTrackerDesc: string;
  eexiAttainedReqLabel: string;
  eexiCompliantLabel: string;
  eplLimitLabel: string;
  ciiRatingLabel: string;
  ciiAttainedReqLabel: string;
  ciiRatioLabel: string;
  ciiNextYearLabel: string;
  fuelEuIntensityLabel: string;
  slowSteamingCiiPreview: string;
  tceCo2TripTitle: string;
  tceCo2TripDesc: string;
  tcePerDayLabel: string;
  tceBenchmarkLabel: string;
  tceFormulaNote: string;
  grossFreightRevLabel: string;
  voyageExpensesLabel: string;
  co2PerTripLabel: string;
  co2PerDayLabel: string;
  tcePerTonneCo2Label: string;
  esgCostAccountingTitle: string;
  esgCostAccountingDesc: string;
  euEtsLiabilityLabel: string;
  fuelEuBalanceLabel: string;
  dwellCarbonLabel: string;
  voluntaryOffsetLabel: string;
  greenRebateLabel: string;
  totalEsgCostTripLabel: string;
  esgAdjustedCostLabel: string;
  esgShareLabel: string;
  commercialCostLabel: string;
  portfolioTripLedgerTitle: string;

  // Shared Per-Vessel KPI Transparency Layer & Green Fleet Reference Case
  sharedVesselKpiTitle: string;
  sharedVesselKpiDesc: string;
  sharedTransparencyLayerLabel: string;
  vesselNameImoCol: string;
  serviceClassCol: string;
  tripsCargoCol: string;
  co2PerTripCol: string;
  reliabilityOtifCol: string;
  formulaTransparencyBtn: string;
  formulaTransparencyNote: string;
  greenFleetRefTitle: string;
  greenFleetRefDesc: string;
  referenceCaseNotice: string;
  greenFuelPremiumLabel: string;
  vesselPathwayCol: string;
  wtwIntensityCol: string;
  charterCapexCol: string;
  greenFuelPremCol: string;
  netsComplianceCol: string;
  netAllInCostCol: string;
  premiumVsConvCol: string;
  benchmarkLabel: string;
  liveFleetLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    shipments: "Shipments",
    tracking: "Live Tracking",
    sustainability: "Sustainability",
    globalNetwork: "Global Network",
    docs: "System Docs",
    settings: "Settings",
    aiAssistant: "AI Assistant",
    operationalOverview: "Operational Overview",
    realTimeMetrics: "Real-time logistics and sustainability metrics.",
    totalShipments: "Total Shipments",
    carbonFootprint: "Carbon Footprint",
    freightSpend: "Total Freight Spend",
    avgIntensity: "Avg Emission Intensity",
    newShipment: "New Shipment",
    createShipment: "Create Shipment",
    customer: "Customer",
    origin: "Origin",
    destination: "Destination",
    weight: "Weight (Tonnes)",
    volume: "Volume (CBM)",
    incoterms: "Incoterms",
    mode: "Transport Mode",
    status: "Status",
    history: "Shipment History",
    aiInsights: "AI Sustainability Recommendations",
    offsetting: "Carbon Offsetting",
    search: "Search shipments...",
    cancel: "Cancel",
    book: "Book Shipment",
    esgScore: "ESG Score",
    
    signOut: "Sign Out",
    switchMode: "Switch Mode",
    daysRemaining: "days left",
    days: "Days",
    
    demoJury: "NBG Seeds Jury Access",
    demoClient: "Client Preview",
    demoAccount: "Demo Account",
    tryDemo: "Try Demo",
    tryDemoDesc: "Instant access with sample data, no sign-up",
    readOnly: "Read-Only",
    readOnlyNoticeTitle: "Client Preview Mode (Read-Only)",
    readOnlyNoticeDesc: "Creating and deleting shipments is disabled in this preview mode. All 16 sample shipments and AI insights are available for review.",
    demoExpired: "Demo Period Completed",
    demoExpiredDesc: "This demo evaluation session has concluded. For full enterprise integration and active account access, please reach out to the EcoFreight team.",
    renewDemo: "Renew Demo",
    contact: "Contact",
    
    quickDemoAccess: "Instant Demo & Evaluation Access",
    instantAccess: "1-Click Access",
    orCorporate: "or sign in with corporate account",
    juryCardTitle: "NBG Seeds Competition & Jury Access",
    juryCardDesc: "Full evaluation access: Multi-modal route optimization, CBAM intelligence & AI enabled",
    startJury: "Launch as Jury (14 Days Full Access)",
    clientCardTitle: "Potential Client Preview",
    clientCardDesc: "Protected mode: Review 16 shipments, live interactive maps & decarbonization metrics",
    startClient: "Launch Client Preview (3 Days • Read-Only)",
    linkCopied: "Direct access link copied to clipboard!",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    signInBtn: "Sign In Securely",
    
    consignment: "Consignment",
    originDest: "Origin → Destination",
    cargoWeight: "Cargo / Weight",
    emissions: "Emissions",
    freightCost: "Freight Cost",
    inTransit: "In Transit",
    delivered: "Delivered",
    booked: "Booked",
    sea: "Sea",
    rail: "Rail",
    road: "Road",
    air: "Air",
    modalDistribution: "Modal Distribution",
    weeklyTrend: "Weekly Emissions & Spend",
    customs: "Customs",
    cancelled: "Cancelled",
    actions: "Actions",
    route: "Route",
    idCustomer: "ID / Customer",
    back: "Back",
    close: "Close",
    dashTitle: "Executive Dashboard",
    dashSubtitle: "Global Logistics & ESG Performance Monitoring",
    activeConsignments: "Active Consignments",
    completed: "Completed",
    intermodalEfficiency: "Intermodal Efficiency",
    greenShare: "Rail/Sea Green Share",
    emissionsCurve: "Emissions Trend",
    emissionsCurveDesc: "Aggregated GHG emissions (kg CO2e) across all multimodal routes",
    activeCorridors: "Active Strategic Corridors",
    modalShiftBenefit: "Modal Shift Benefit",
    modalShiftDesc: "Current rail/sea split saves ~64% CO2 vs all-road haulage.",
    shipTitle: "Shipment Management",
    shipSubtitle: "Consignment operations, cost & emissions per shipment",
    newShipmentAnalysis: "New Shipment Analysis",
    dropBol: "Upload a Bill of Lading to auto-fill",
    analyzeOptions: "Analyze Options",
    fillRequired: "Fill in customer, origin, destination and a weight above 0.",
    bookNow: "Book Now",
    shipmentDetails: "Shipment Details",
    legs: "Transport Legs",
    totalCost: "Total Cost",
    publicPortal: "Public Tracking Portal",
    copyTrackingLink: "Copy Tracking Link",
    copied: "Copied!",
    trackTitle: "Logistics Command Center",
    trackSubtitle: "Corridor tracking, risk alerts & AI cargo inspection",
    chokepointAlerts: "Chokepoint Alerts",
    consignmentMetrics: "Consignment Metrics",
    milestoneHistory: "Milestone History",
    damageAudit: "AI Cargo Integrity Audit",
    uploadPhoto: "Upload Inspection Photo",
    noShipments: "No shipments match your search.",
    sustTitle: "Sustainability Intelligence",
    sustSubtitle: "Emissions analytics & decarbonization planning",
    complianceEngine: "Compliance Engine",
    exportReport: "Export shipments CSV",
    offsetMarket: "Offset Market",
    offsetDesc: "Simulation only. No credits are bought. Real offsets need a certified registry.",
    investNow: "Simulate offset",
    neutralized: "Offset simulated (no purchase)",
    verticalTitle: "Choose your vertical",
    verticalSub: "Pick the module you want to open.",
    verticalMaritime: "Maritime",
    verticalMaritimeDesc: "Ocean & multimodal freight",
    verticalRoad: "Road",
    verticalRoadDesc: "Fleet & road freight (preview)",
    comingSoon: "Coming soon",
    roadFleet: "Fleet overview",
    roadRoutes: "Routes",
    roadDrivers: "Drivers",
    roadCarbon: "Carbon",
    roadCompliance: "Compliance",
    switchVertical: "Switch vertical",
    vehicleType: "Vehicle type",
    distanceKm: "Distance (km)",
    emissionsResult: "Estimated CO₂e (kg)",
    indicativeFactors: "Indicative factors, not verified. Confirm the source before use.",
    routeEstimate: "Estimated drive time and fuel (straight-line distance)",
    routeAssumptions: "Assumptions: road factor 1.35, average 25 km/h, 10 l/100 km, diesel 1.80 €/l",
    placeholderNote: "This section is a preview. No data yet.",
    vtVan: "Van",
    vtTruck7: "Truck 7.5 t",
    vtTruck18: "Truck 18 t",
    vtTruck40: "Truck 40 t",
    vtEVan: "Electric van",
    carbonEstimate: "GLEC v3.0 · ISO 14083 (WTW)",
    cbamLabel: "Indicative carbon cost (demo)",
    cbamSub: "Not a CBAM or ETS calculation",
    complianceSub: "Indicative only, not a regulatory filing",
    targetProgress: "Reduction target progress (sample)",
    coPilot: "Sustainability Co-Pilot",
    emissionsByZone: "Emissions by Regulatory Zone",
    netTitle: "Supplier Intelligence",
    netSubtitle: "Carrier ESG Scorecard & Global Network Leaderboard",
    aiTitle: "AI Command Center",
    aiSubtitle: "Multimodal logistics intelligence with Google Gemini",
    aiWelcome: "Welcome to the EcoFreight AI Command Center powered by Google Gemini. How can I help with route decarbonization, emissions tracking, or multimodal logistics today?",
    aiPlaceholder: "Ask about routes, emissions factors, or multimodal options...",
    aiThinking: "Gemini is analyzing...",
    aiError: "The AI response could not be completed. Please check your connection.",
    voiceInput: "Voice Input",
    listening: "Listening...",
    voiceUnsupported: "Voice input is not supported in this browser. Please type your message.",
    quickPrompts: "Quick AI Prompts",
    qpSuez: "Check Suez Delays",
    qpSuezQ: "What is the current status of Suez Canal and Red Sea maritime traffic, and how should we mitigate delays and emissions?",
    qpEmissions: "Emission Summary",
    qpEmissionsQ: "Summarize the carbon emission reduction potential across Road vs Rail vs Sea transport modes.",
    qpFleet: "Fleet Optimization",
    qpFleetQ: "What operational strategies can our fleet adopt to minimize fuel consumption and reduce GHG emissions?",
    notifications: "Latest Updates",
    preferredCarrier: "Preferred Carrier",
    preferredCarrierSet: "Preferred",

    routeOptimizer: "Route Optimizer",
    routeOptimizerTitle: "Route Cost & Carbon Optimizer",
    routeOptimizerSubtitle: "Combined fuel expenditure, CO2 compliance cost, and port fee modeling across multimodal corridors.",
    fuelCost: "Fuel Cost",
    co2Cost: "CO2 Cost",
    fuelPlusCo2: "Fuel + CO2",
    baseFreight: "Base Freight",
    totalLandedCost: "Total Cost",
    carbonPriceLabel: "Carbon Price (€ / t CO2e)",
    fuelIndexLabel: "Fuel Price Index",
    optimizePriority: "Optimization Objective",
    priorityTotalCost: "Lowest Total Cost (Freight + Fuel + CO2 + Ports)",
    priorityFuelCo2: "Lowest Fuel + CO2 Cost",
    priorityFastest: "Fastest Transit",
    optimalChoice: "Optimal Cost Route",
    savingsVsRoad: "Savings vs. All-Road",
    runCostOptimization: "Calculate Optimal Route",
    corridorPresets: "Quick Corridor Presets",
    bookSelectedRoute: "Book Selected Route",
    transitDays: "Transit",
    costBreakdownTitle: "Cost Composition: Freight, Fuel, CO2 & Port Fees",
    portFees: "Port Fees",
    originPortFee: "Origin Port Fee (€)",
    destinationPortFee: "Destination Port Fee (€)",
    autoEstimatePorts: "Auto-Estimate",
    applyTerminalFeesAllModes: "Include terminal handling fees on Rail / Road / Air",
    portFeesActiveNote: "Active on Sea & Intermodal · Optional on inland/air",
    shipmentLedgerTitle: "Shipment Cost Ledger",
    containersTeu: "Containers (TEU)",
    teuKm: "TEU-km",
    teuKmFormula: "distance × containers",
    costPerTeuKm: "€/TEU-km",
    co2PerTeuKm: "CO2 / TEU-km",
    totalTeuKm: "Total TEU-km",
    unitCostTeuKm: "Unit Cost / TEU-km",
    glecMethodBtn: "GLEC v3.0 Method",
    glecMethodTitle: "GLEC Framework v3.0 CO2e Methodology",
    glecMethodSubtitle: "ISO 14083 aligned Well-to-Wheel (WTW) carbon accounting across all transport legs.",
    glecStandardLabel: "Standard",
    glecBoundaryLabel: "System Boundary",
    glecFormulaLabel: "Core Formula",
    glecTtwLabel: "TTW (Direct Exhaust)",
    glecWttLabel: "WTT (Energy Production)",
    glecTotalWtwLabel: "Total WTW Factor",
    glecLiveCalculation: "Live Calculation Breakdown",
    glecFactorsTableTitle: "GLEC v3.0 Default Emission Factors (kg CO2e / t·km)",
    glecTocSource: "Transport Operation Category",
    dwellTimeHours: "Port Dwell Time (Hours)",
    dwellCost: "Dwell Cost",
    dwellEmissions: "Dwell CO2e",
    dwellImpactLabel: "Dwell Impact",
    dwellPresetFast: "0h Fast-Track",
    dwellPresetNormal: "24h Normal",
    dwellPresetModerate: "48h Moderate",
    dwellPresetCongested: "72h Congested",
    dwellNote: "Quay storage + vessel hoteling (GLEC v3.0: 2.8 kg CO2e/TEU·h)",
    scheduleReliability: "Schedule Reliability",
    reliabilityOverTime: "Schedule Reliability Over Time",
    reliabilityOverTimeDesc: "On-time ETA adherence (%) across portfolio & transport modes",
    scheduleReliabilityNote: "Tracks planned vs. actual schedule adherence (excludes cargo insurance).",
    onTimeArrivals: "On-Time Runs",
    avgScheduleDelay: "Avg Delay",
    slaTarget: "SLA Target (88%)",
    priorityReliability: "Highest Schedule Reliability",
    scheduleAdherence: "Schedule ETA",
    onTime: "On Time",
    delayed: "Delayed",
    months6Label: "6M Monthly",
    weeks12Label: "12W Bi-weekly",
    priorityCarbonAware: "Carbon-Aware (Lowest CO2 for Similar Cost)",
    speedProfileLabel: "Speed Regime",
    standardSpeed: "Standard Speed",
    ecoSpeedLabel: "Eco-Speed (Slow Steaming)",
    carbonAwareTitle: "Carbon-Aware Routing & Trade-Off",
    carbonAwareDesc: "Lower-CO2 route or speed within your cost budget, showing exact cost, emission & transit trade-offs.",
    costTolerance: "Cost Window",
    similarCostBand: "Similar Cost",
    baselineOption: "Cost-Optimal Baseline",
    carbonAwareOption: "Carbon-Aware Suggestion",
    applyCarbonAware: "Apply Carbon-Aware Option",
    carbonAwareApplied: "Active",
    co2SavingsLabel: "CO2e Reduction",
    costDeltaLabel: "Cost Difference",
    transitDeltaLabel: "Transit Trade-Off",
    reliabilityDeltaLabel: "Schedule Impact",
    abatementCostLabel: "Abatement Cost",
    tradeoffChartTitle: "Cost vs. CO2e Frontier",
    tradeoffChartDesc: "Standard vs. Eco-Speed across modes (lower-left is better)",
    recTypeRouteAndSpeed: "Route Shift + Eco-Speed",
    recTypeRouteShift: "Intermodal Route Shift",
    recTypeEcoSpeed: "Slow Steaming / Eco-Speed",
    slowSteamingTitle: "Slow Steaming Speed & Fuel / CO2 Savings",
    slowSteamingDesc: "Reduce cruising speed to cut propulsion fuel burn and CO2e under the Admiralty propeller curve.",
    slowSteamingSpeedReduction: "Speed Reduction",
    slowSteamingNormal: "0% Normal (20 kts)",
    slowSteaming10: "-10% (18 kts)",
    slowSteaming15: "-15% Eco (17 kts)",
    slowSteaming20: "-20% Slow (16 kts)",
    slowSteaming25: "-25% Super Slow (15 kts)",
    fuelSavedLabel: "Fuel Saved",
    co2SavedLabel: "CO2e Saved",
    combinedSavingsLabel: "Fuel + CO2 Savings",
    vesselSpeedLabel: "Vessel Speed",
    speedSavingsCurveTitle: "Savings by Speed Reduction Tier",
    propellerLawNote: "Propeller curve: reducing vessel speed 15% cuts propulsion fuel & CO2e by ~23.6%.",
    seaLiner: "Sea (Liner)",
    seaTramp: "Sea (Tramp)",
    seaServiceSubcategories: "Vessel & Sea Service Subcategories",
    linerServiceLabel: "Liner Service",
    trampServiceLabel: "Tramp Charter",
    linerVesselTypeLabel: "Liner Vessel Type",
    trampVesselTypeLabel: "Tramp Vessel Type",
    seaFilterAll: "All (Liner + Tramp)",
    seaFilterLiner: "Liner Only",
    seaFilterTramp: "Tramp Only",
    linerLogicSummary: "Fixed weekly sailing · TEU slot tariff · Priority berth · 0% ballast",
    trampLogicSummary: "Spot voyage charter · Tonnage scale rate · 1.35× berth laytime · +12% ballast",
    serviceLogicTitle: "Liner vs. Tramp Maritime Operating Logic",
    pricingModelLabel: "Freight Tariff Model",
    berthDwellLogicLabel: "Berth & Dwell Rule",
    ballastFactorLabel: "Ballast Repositioning",
    reliabilityBaselineLabel: "Schedule Adherence",
    cruisingSpeedLabel: "Design Speed",
    vesselContainerDeepsea: "Deep-Sea Container Liner (14k TEU)",
    vesselContainerFeeder: "Short-Sea Feeder Container (2.5k TEU)",
    vesselRoroFerry: "Ro-Ro / ConRo Liner",
    vesselMppTramp: "Multi-Purpose Tramp (15k DWT)",
    vesselHandysizeBulk: "Handysize Bulk Charter (32k DWT)",
    vesselCoastalCharter: "Short-Sea Coaster Tramp (5k DWT)",
    fixedScheduleLabel: "Fixed Sailing Schedule",
    predictableEtaLabel: "Predictable ETA Window",
    publishedLineEmissionsTitle: "Liner Fixed Schedules & Published Emissions per Line",
    publishedLineEmissionsDesc: "Fixed weekly sailing windows, predictable berth ETAs (±1.5–3h), and audited Well-to-Wheel emissions per liner service loop.",
    linerLineCol: "Liner Line / Carrier",
    sailingScheduleCol: "Fixed Sailing & Cut-Off",
    etaWindowCol: "Predictable ETA & SLA",
    publishedIntensityCol: "Published Line Emissions",
    weatherWindowCol: "Weather Window",
    smsAlertsTitle: "Liner Schedule & Weather Window Alerts",
    smsAlertsScopeNote: "Demo scope: in-app notification center + simulated SMS dispatch preview (no external carrier telecom gateway billed).",
    smsChannelLabel: "SMS Dispatch (Demo)",
    inAppChannelLabel: "In-App Bell Alerts",
    scheduleChangeAlertsLabel: "Schedule / Berth Shift (>2h)",
    weatherWindowAlertsLabel: "Marine Weather Windows",
    demoPhoneLabel: "Demo SMS Recipient",
    simulateScheduleAlertBtn: "Simulate Schedule Change Alert",
    simulateWeatherAlertBtn: "Simulate Weather Window Alert",
    alertDispatchedLogTitle: "Dispatched Liner Alerts & SMS Log",
    markAllReadBtn: "Mark all read",
    cutoffLabel: "Cargo Cut-Off",
    yoyTrendLabel: "YoY Intensity",

    complianceAccountingTitle: "Maritime Compliance & Trip ESG Accounting",
    complianceAccountingSubtitle: "IMO EEXI & CII vessel rating tracking, daily TCE vs. CO2 evaluation, and itemized ESG cost accounting per trip.",
    eexiCiiTrackerTitle: "IMO EEXI & CII Rating Tracking",
    eexiCiiTrackerDesc: "Attained vs. required EEXI efficiency index, EPL power limiters, and 2026 CII rating grades (A–E) with slow-steaming impact.",
    eexiAttainedReqLabel: "EEXI (Att. / Req.)",
    eexiCompliantLabel: "EEXI Compliant",
    eplLimitLabel: "EPL Limiter",
    ciiRatingLabel: "CII Rating",
    ciiAttainedReqLabel: "CII AER (Att. / Req.)",
    ciiRatioLabel: "CII Ratio",
    ciiNextYearLabel: "2027 Proj.",
    fuelEuIntensityLabel: "FuelEU GHG",
    slowSteamingCiiPreview: "Slow-Steaming CII Effect",
    tceCo2TripTitle: "TCE & CO2 per Trip Evaluation",
    tceCo2TripDesc: "Daily Time Charter Equivalent return net of bunker, port, dwell & carbon costs vs. trip CO2 intensity.",
    tcePerDayLabel: "TCE (€/day)",
    tceBenchmarkLabel: "Market Benchmark",
    tceFormulaNote: "TCE = (Gross Freight Revenue − Voyage Expenses) ÷ Voyage Days",
    grossFreightRevLabel: "Gross Freight Rev.",
    voyageExpensesLabel: "Voyage Expenses",
    co2PerTripLabel: "CO2 / Trip",
    co2PerDayLabel: "CO2 / Day",
    tcePerTonneCo2Label: "TCE / t CO2",
    esgCostAccountingTitle: "ESG Cost Accounting per Trip",
    esgCostAccountingDesc: "Itemized EU ETS allowances, FuelEU Maritime GHG balance, dwell carbon, voluntary offsets, and green financing rebates.",
    euEtsLiabilityLabel: "EU ETS / Carbon Levy",
    fuelEuBalanceLabel: "FuelEU Maritime Balance",
    dwellCarbonLabel: "Dwell Carbon Cost",
    voluntaryOffsetLabel: "Voluntary VCS Offset",
    greenRebateLabel: "Green ESG Rebate",
    totalEsgCostTripLabel: "Total ESG Cost / Trip",
    esgAdjustedCostLabel: "ESG-Adjusted Trip Cost",
    esgShareLabel: "ESG Share of Trip",
    commercialCostLabel: "Commercial Freight Cost",
    portfolioTripLedgerTitle: "Per-Trip Compliance, TCE & ESG Accounting Ledger",

    sharedVesselKpiTitle: "Shared Per-Vessel KPI Transparency Layer",
    sharedVesselKpiDesc: "Single source of truth per vessel across Dashboard, Sustainability, Global Network & Tracking.",
    sharedTransparencyLayerLabel: "Shared Transparency Engine: GLEC v3.0 WTW · IMO MEPC.328 · EU ETS",
    vesselNameImoCol: "Vessel / IMO",
    serviceClassCol: "Service & Capacity",
    tripsCargoCol: "Trips / Volume",
    co2PerTripCol: "Avg CO2 / Trip",
    reliabilityOtifCol: "OTIF Reliability",
    formulaTransparencyBtn: "Show Transparency Formulas",
    formulaTransparencyNote: "Identical GLEC WTW, IMO EEXI/CII, TCE (€/day) and EU ETS + FuelEU formulas are computed once and shared across all tabs.",
    greenFleetRefTitle: "Green Fleet Reference Case: Conventional vs. Methanol-Ready Vessels",
    greenFleetRefDesc: "Illustrative benchmark comparing conventional VLSFO vs. dual-fuel methanol-ready vessels, including the green e-methanol premium pricing case.",
    referenceCaseNotice: "Reference Benchmark Case (Read-Only): Not an active methanol booking or bunkering feature.",
    greenFuelPremiumLabel: "e-Methanol Fuel Premium",
    vesselPathwayCol: "Vessel & Fuel Pathway",
    wtwIntensityCol: "WTW GHG",
    charterCapexCol: "Base + Readiness",
    greenFuelPremCol: "Green Fuel Prem.",
    netsComplianceCol: "ETS + FuelEU − Rebate",
    netAllInCostCol: "All-In / TEU",
    premiumVsConvCol: "Net Premium vs. VLSFO",
    benchmarkLabel: "Model Baseline",
    liveFleetLabel: "Live Portfolio"
  },
  tr: {
    dashboard: "Panel",
    shipments: "Sevkiyatlar",
    tracking: "Canlı Takip",
    sustainability: "Sürdürülebilirlik",
    globalNetwork: "Küresel Ağ",
    docs: "Sistem Dökümanları",
    settings: "Ayarlar",
    aiAssistant: "AI Asistanı",
    operationalOverview: "Operasyonel Genel Bakış",
    realTimeMetrics: "Gerçek zamanlı lojistik ve sürdürülebilirlik metrikleri.",
    totalShipments: "Toplam Sevkiyat",
    carbonFootprint: "Karbon Ayak İzi",
    freightSpend: "Toplam Harcama",
    avgIntensity: "Ort. Emisyon Yoğunluğu",
    newShipment: "Yeni Sevkiyat",
    createShipment: "Sevkiyat Oluştur",
    customer: "Müşteri",
    origin: "Çıkış Noktası",
    destination: "Varış Noktası",
    weight: "Ağırlık (Ton)",
    volume: "Hacim (CBM)",
    incoterms: "Teslim Şekli",
    mode: "Taşıma Modu",
    status: "Durum",
    history: "Sevkiyat Geçmişi",
    aiInsights: "AI Sürdürülebilirlik Önerileri",
    offsetting: "Karbon Dengeleme",
    search: "Sevkiyat ara...",
    cancel: "İptal",
    book: "Sevkiyatı Rezerve Et",
    esgScore: "ESG Skoru",
    
    signOut: "Çıkış Yap",
    switchMode: "Mod Değiştir",
    daysRemaining: "gün kaldı",
    days: "Gün",
    
    demoJury: "NBG Seeds Jüri Erişimi",
    demoClient: "Müşteri Önizleme",
    demoAccount: "Demo Hesabı",
    tryDemo: "Demo'yu Dene",
    tryDemoDesc: "Örnek verilerle anında erişim, kayıt gerekmez",
    readOnly: "Salt Okunur",
    readOnlyNoticeTitle: "Müşteri Önizleme Modu (Salt Okunur)",
    readOnlyNoticeDesc: "Bu önizleme modunda sevkiyat ekleme ve silme işlemleri devre dışıdır. 16 gerçekçi örnek sevkiyat ve AI analizleri incelenebilir.",
    demoExpired: "Demo Süresi Tamamlandı",
    demoExpiredDesc: "Bu demo oturumunun kullanım süresi dolmuştur. Tam yetkili kurumsal entegrasyon ve üyelik için EcoFreight ekibiyle iletişime geçebilirsiniz.",
    renewDemo: "Demoyu Yenile",
    contact: "İletişim",
    
    quickDemoAccess: "Hızlı Demo ve Değerlendirme Girişleri",
    instantAccess: "Şifresiz Tek Tık",
    orCorporate: "veya kurumsal hesapla giriş",
    juryCardTitle: "NBG Seeds Yarışma & Jüri Girişi",
    juryCardDesc: "Tam yetkili değerlendirme: Rota optimizasyonu, CBAM ve AI testleri açık",
    startJury: "Jüri Olarak Başlat (14 Günlük Tam Erişim)",
    clientCardTitle: "Potansiyel Müşteri Önizlemesi",
    clientCardDesc: "Korumalı mod: 16 sevkiyat, harita ve analizleri inceler, veri değiştirilemez",
    startClient: "Müşteri Önizlemesini Başlat (3 Gün • Salt Okunur)",
    linkCopied: "Paylaşım bağlantısı panoya kopyalandı!",
    emailPlaceholder: "E-posta Adresi",
    passwordPlaceholder: "Şifre",
    signInBtn: "Güvenli Giriş Yap",
    
    consignment: "Sevkiyat No",
    originDest: "Çıkış → Varış",
    cargoWeight: "Yük / Ağırlık",
    emissions: "Emisyonlar",
    freightCost: "Navlun Maliyeti",
    inTransit: "Yolda",
    delivered: "Teslim Edildi",
    booked: "Rezerve Edildi",
    sea: "Deniz",
    rail: "Demiryolu",
    road: "Karayolu",
    air: "Havayolu",
    modalDistribution: "Taşıma Türü Dağılımı",
    weeklyTrend: "Haftalık Emisyon ve Harcama Trendi",
    customs: "Gümrükte",
    cancelled: "İptal Edildi",
    actions: "İşlemler",
    route: "Rota",
    idCustomer: "ID / Müşteri",
    back: "Geri",
    close: "Kapat",
    dashTitle: "Yönetici Paneli",
    dashSubtitle: "Küresel Lojistik ve ESG Performans İzleme",
    activeConsignments: "Aktif Sevkiyat",
    completed: "Tamamlandı",
    intermodalEfficiency: "İntermodal Verimlilik",
    greenShare: "Demiryolu/Deniz Yeşil Payı",
    emissionsCurve: "Emisyon Trendi",
    emissionsCurveDesc: "Tüm çok modlu rotalarda toplam sera gazı emisyonu (kg CO2e)",
    activeCorridors: "Aktif Stratejik Koridorlar",
    modalShiftBenefit: "Mod Değişimi Faydası",
    modalShiftDesc: "Mevcut demiryolu/deniz dağılımı, tamamen karayoluna göre ~%64 CO2 tasarrufu sağlar.",
    shipTitle: "Sevkiyat Yönetimi",
    shipSubtitle: "Sevkiyat operasyonları, maliyet ve emisyonlar",
    newShipmentAnalysis: "Yeni Sevkiyat Analizi",
    dropBol: "Otomatik doldurmak için konşimento yükleyin",
    analyzeOptions: "Seçenekleri Analiz Et",
    fillRequired: "Müşteri, çıkış, varış ve 0'dan büyük ağırlık girin.",
    bookNow: "Şimdi Rezerve Et",
    shipmentDetails: "Sevkiyat Detayları",
    legs: "Taşıma Ayakları",
    totalCost: "Toplam Maliyet",
    publicPortal: "Halka Açık Takip Portalı",
    copyTrackingLink: "Takip Linkini Kopyala",
    copied: "Kopyalandı!",
    trackTitle: "Lojistik Komuta Merkezi",
    trackSubtitle: "Koridor takibi, risk uyarıları ve AI kargo denetimi",
    chokepointAlerts: "Darboğaz Uyarıları",
    consignmentMetrics: "Sevkiyat Metrikleri",
    milestoneHistory: "Kilometre Taşı Geçmişi",
    damageAudit: "AI Kargo Bütünlük Denetimi",
    uploadPhoto: "Denetim Fotoğrafı Yükle",
    noShipments: "Aramanızla eşleşen sevkiyat yok.",
    sustTitle: "Sürdürülebilirlik Zekası",
    sustSubtitle: "Emisyon analitiği ve karbonsuzlaştırma planlaması",
    complianceEngine: "Uyum Motoru",
    exportReport: "Gönderileri CSV olarak indir",
    offsetMarket: "Dengeleme Pazarı",
    offsetDesc: "Yalnızca simülasyon. Kredi satın alınmaz. Gerçek dengeleme için sertifikalı bir kayıt gerekir.",
    investNow: "Dengelemeyi simüle et",
    neutralized: "Dengeleme simüle edildi (satın alma yok)",
    verticalTitle: "Dikey pazarınızı seçin",
    verticalSub: "Açmak istediğiniz modülü seçin.",
    verticalMaritime: "Denizcilik",
    verticalMaritimeDesc: "Deniz ve çok modlu taşımacılık",
    verticalRoad: "Karayolu",
    verticalRoadDesc: "Filo & karayolu taşımacılığı (önizleme)",
    comingSoon: "Yakında",
    roadFleet: "Filo genel bakış",
    roadRoutes: "Rotalar",
    roadDrivers: "Sürücüler",
    roadCarbon: "Karbon",
    roadCompliance: "Uyumluluk",
    switchVertical: "Dikey değiştir",
    vehicleType: "Araç tipi",
    distanceKm: "Mesafe (km)",
    emissionsResult: "Tahmini CO₂e (kg)",
    indicativeFactors: "Gösterge niteliğinde faktörler, doğrulanmamış. Kullanımdan önce kaynağı teyit edin.",
    routeEstimate: "Tahmini sürüş süresi ve yakıt (kuş uçuşu mesafe)",
    routeAssumptions: "Varsayımlar: yol faktörü 1,35, ortalama 25 km/s, 10 l/100 km, dizel 1,80 €/l",
    placeholderNote: "Bu bölüm bir önizlemedir. Henüz veri yok.",
    vtVan: "Panelvan",
    vtTruck7: "Kamyon 7,5 t",
    vtTruck18: "Kamyon 18 t",
    vtTruck40: "Kamyon 40 t",
    vtEVan: "Elektrikli van",
    carbonEstimate: "GLEC v3.0 · ISO 14083 (WTW)",
    cbamLabel: "Gösterge niteliğinde karbon maliyeti (demo)",
    cbamSub: "CBAM veya ETS hesabı değildir",
    complianceSub: "Yalnızca gösterge niteliğinde, resmi bildirim değildir",
    targetProgress: "Azaltım hedefi ilerlemesi (örnek)",
    coPilot: "Sürdürülebilirlik Yardımcısı",
    emissionsByZone: "Düzenleyici Bölgeye Göre Emisyonlar",
    netTitle: "Tedarikçi Zekası",
    netSubtitle: "Taşıyıcı ESG Karnesi ve Küresel Ağ Sıralaması",
    aiTitle: "AI Komuta Merkezi",
    aiSubtitle: "Google Gemini ile çok modlu lojistik zekası",
    aiWelcome: "Google Gemini destekli EcoFreight AI Komuta Merkezi'ne hoş geldiniz. Rota karbonsuzlaştırma, emisyon takibi veya çok modlu lojistik konusunda nasıl yardımcı olabilirim?",
    aiPlaceholder: "Rotalar, emisyon faktörleri veya çok modlu seçenekler hakkında sorun...",
    aiThinking: "Gemini analiz ediyor...",
    aiError: "AI yanıtı tamamlanamadı. Lütfen bağlantınızı kontrol edin.",
    voiceInput: "Sesli Giriş",
    listening: "Dinleniyor...",
    voiceUnsupported: "Bu tarayıcı sesli girişi desteklemiyor. Lütfen mesajınızı yazın.",
    quickPrompts: "Hızlı AI Komutları",
    qpSuez: "Süveyş Gecikmelerini Kontrol Et",
    qpSuezQ: "Süveyş Kanalı ve Kızıldeniz deniz trafiğinin güncel durumu nedir, gecikmeleri ve emisyonları nasıl azaltmalıyız?",
    qpEmissions: "Emisyon Özeti",
    qpEmissionsQ: "Karayolu, Demiryolu ve Deniz ulaşım modları arasındaki karbon emisyonu azaltım potansiyelini özetle.",
    qpFleet: "Filo Optimizasyonu",
    qpFleetQ: "Filomuz yakıt tüketimini azaltmak ve sera gazı emisyonlarını düşürmek için hangi stratejileri benimseyebilir?",
    notifications: "Son Güncellemeler",
    preferredCarrier: "Tercih Edilen Taşıyıcı",
    preferredCarrierSet: "Tercih Edildi",

    routeOptimizer: "Rota Maliyet Opt.",
    routeOptimizerTitle: "Rota Yakıt, Karbon ve Liman Maliyet Optimizasyonu",
    routeOptimizerSubtitle: "Çok modlu koridorlarda yakıt maliyeti, CO2 maliyeti ve liman ücretlerini birlikte hesaplayın.",
    fuelCost: "Yakıt Maliyeti",
    co2Cost: "CO2 Maliyeti",
    fuelPlusCo2: "Yakıt + CO2",
    baseFreight: "Temel Navlun",
    totalLandedCost: "Toplam Maliyet",
    carbonPriceLabel: "Karbon Fiyatı (€ / ton CO2e)",
    fuelIndexLabel: "Yakıt Fiyat Endeksi",
    optimizePriority: "Optimizasyon Hedefi",
    priorityTotalCost: "En Düşük Toplam Maliyet (Navlun + Yakıt + CO2 + Liman)",
    priorityFuelCo2: "En Düşük Yakıt + CO2 Maliyeti",
    priorityFastest: "En Hızlı Teslimat",
    optimalChoice: "En Maliyet-Etkin Rota",
    savingsVsRoad: "Karayoluna Göre Tasarruf",
    runCostOptimization: "Maliyet Optimizasyonunu Hesapla",
    corridorPresets: "Hazır Koridorlar",
    bookSelectedRoute: "Seçili Rotayı Rezerve Et",
    transitDays: "Süre",
    costBreakdownTitle: "Maliyet Dağılımı: Navlun, Yakıt, CO2 ve Liman Ücretleri",
    portFees: "Liman Ücreti",
    originPortFee: "Çıkış Limanı Ücreti (€)",
    destinationPortFee: "Varış Limanı Ücreti (€)",
    autoEstimatePorts: "Otomatik Tahmin",
    applyTerminalFeesAllModes: "Demiryolu / Karayolu / Havayoluna terminal ücreti uygula",
    portFeesActiveNote: "Deniz & İntermodal'da aktif · Diğer modlarda opsiyonel",
    shipmentLedgerTitle: "Sevkiyat Maliyet Dökümü",
    containersTeu: "Konteyner (TEU)",
    teuKm: "TEU-km",
    teuKmFormula: "mesafe × konteyner",
    costPerTeuKm: "€/TEU-km",
    co2PerTeuKm: "CO2 / TEU-km",
    totalTeuKm: "Toplam TEU-km",
    unitCostTeuKm: "Birim Maliyet / TEU-km",
    glecMethodBtn: "GLEC v3.0 Yöntemi",
    glecMethodTitle: "GLEC Framework v3.0 CO2e Hesaplama Yöntemi",
    glecMethodSubtitle: "Tüm taşıma ayaklarında ISO 14083 uyumlu Well-to-Wheel (WTW) karbon muhasebesi.",
    glecStandardLabel: "Standart",
    glecBoundaryLabel: "Sistem Sınırı",
    glecFormulaLabel: "Temel Formül",
    glecTtwLabel: "TTW (Doğrudan Yakıt)",
    glecWttLabel: "WTT (Enerji Üretimi)",
    glecTotalWtwLabel: "Toplam WTW Faktörü",
    glecLiveCalculation: "Canlı Hesaplama Kırılımı",
    glecFactorsTableTitle: "GLEC v3.0 Varsayılan Emisyon Faktörleri (kg CO2e / t·km)",
    glecTocSource: "Taşıma Operasyon Kategorisi",
    dwellTimeHours: "Liman Bekleme Süresi (Saat)",
    dwellCost: "Bekleme Maliyeti",
    dwellEmissions: "Bekleme CO2e",
    dwellImpactLabel: "Bekleme Etkisi",
    dwellPresetFast: "0s Hızlı Geçiş",
    dwellPresetNormal: "24s Normal",
    dwellPresetModerate: "48s Yoğun",
    dwellPresetCongested: "72s Sıkışıklık",
    dwellNote: "Ardiye + rıhtım yardımcı yakıtı (GLEC v3.0: 2,8 kg CO2e/TEU·s)",
    scheduleReliability: "Zamanlama Güvenilirliği",
    reliabilityOverTime: "Zaman İçinde Tarife Güvenilirliği",
    reliabilityOverTimeDesc: "Portföy ve taşıma modlarına göre planlanan ETA uyum oranı (%)",
    scheduleReliabilityNote: "Planlanan teslimat zamanına uyumu ölçer (yük sigortası kapsam dışıdır).",
    onTimeArrivals: "Zamanında Sefer",
    avgScheduleDelay: "Ort. Gecikme",
    slaTarget: "SLA Hedefi (%88)",
    priorityReliability: "En Yüksek Tarife Güvenilirliği",
    scheduleAdherence: "Tarife Durumu",
    onTime: "Zamanında",
    delayed: "Gecikmeli",
    months6Label: "6 Ay",
    weeks12Label: "12 Hafta",
    priorityCarbonAware: "Karbon Duyarlı (Benzer Maliyetle En Düşük CO2)",
    speedProfileLabel: "Hız Profili",
    standardSpeed: "Standart Hız",
    ecoSpeedLabel: "Eko-Hız (Yavaş Seyir)",
    carbonAwareTitle: "Karbon Duyarlı Rota & Ödünleşim Analizi",
    carbonAwareDesc: "Benzer maliyet aralığında daha düşük CO2 sunan rota veya hızı önerir ve maliyet/süre ödünleşimini gösterir.",
    costTolerance: "Maliyet Esnekliği",
    similarCostBand: "Benzer Maliyet",
    baselineOption: "En Düşük Maliyetli Baz",
    carbonAwareOption: "Karbon Duyarlı Öneri",
    applyCarbonAware: "Karbon Duyarlı Seçeneği Uygula",
    carbonAwareApplied: "Aktif",
    co2SavingsLabel: "CO2e Azaltımı",
    costDeltaLabel: "Maliyet Farkı",
    transitDeltaLabel: "Süre Ödünleşimi",
    reliabilityDeltaLabel: "Tarife Etkisi",
    abatementCostLabel: "Azaltım Maliyeti",
    tradeoffChartTitle: "Maliyet ve CO2e Ödünleşim Eğrisi",
    tradeoffChartDesc: "Modlar arası Standart ve Eko-Hız dağılımı (sol alt en verimli)",
    recTypeRouteAndSpeed: "Rota Değişimi + Eko-Hız",
    recTypeRouteShift: "İntermodal Rota Değişimi",
    recTypeEcoSpeed: "Yavaş Seyir / Eko-Hız",
    slowSteamingTitle: "Yavaş Seyir (Slow Steaming) Yakıt & CO2 Tasarrufu",
    slowSteamingDesc: "Pervane yasası uyarınca seyir hızını düşürerek sağlanan yakıt ve GLEC CO2e tasarrufunu inceleyin.",
    slowSteamingSpeedReduction: "Hız Azaltımı",
    slowSteamingNormal: "%0 Normal (20 kn)",
    slowSteaming10: "-%10 (18 kn)",
    slowSteaming15: "-%15 Eko (17 kn)",
    slowSteaming20: "-%20 Yavaş (16 kn)",
    slowSteaming25: "-%25 Süper Yavaş (15 kn)",
    fuelSavedLabel: "Yakıt Tasarrufu",
    co2SavedLabel: "CO2e Tasarrufu",
    combinedSavingsLabel: "Yakıt + CO2 Tasarrufu",
    vesselSpeedLabel: "Gemi Hızı",
    speedSavingsCurveTitle: "Hız Kademesine Göre Tasarruf",
    propellerLawNote: "Pervane eğrisi: hızı %15 düşürmek ana makine yakıtını ve CO2e salımını ~%23,6 azaltır.",
    seaLiner: "Deniz (Liner)",
    seaTramp: "Deniz (Tramp)",
    seaServiceSubcategories: "Gemi & Deniz Hizmet Alt Kategorileri",
    linerServiceLabel: "Liner (Düzenli Hat)",
    trampServiceLabel: "Tramp (Sefer Charter)",
    linerVesselTypeLabel: "Liner Gemi Tipi",
    trampVesselTypeLabel: "Tramp Gemi Tipi",
    seaFilterAll: "Tümü (Liner + Tramp)",
    seaFilterLiner: "Yalnızca Liner",
    seaFilterTramp: "Yalnızca Tramp",
    linerLogicSummary: "Sabit sefer takvimi · TEU slot tarifesi · Öncelikli rıhtım · %0 balast",
    trampLogicSummary: "Spot sefer kiralama · Tonaj ölçeği tarifesi · 1,35× rıhtım beklemesi · +%12 balast",
    serviceLogicTitle: "Liner ve Tramp Denizcilik Operasyon Mantığı",
    pricingModelLabel: "Navlun Tarife Modeli",
    berthDwellLogicLabel: "Rıhtım & Bekleme Kuralı",
    ballastFactorLabel: "Balast Konumlandırma",
    reliabilityBaselineLabel: "Tarife Uyumu",
    cruisingSpeedLabel: "Tasarım Hızı",
    vesselContainerDeepsea: "Açık Deniz Konteyner Liner (14k TEU)",
    vesselContainerFeeder: "Kısa Mesafe Feeder Konteyner (2,5k TEU)",
    vesselRoroFerry: "Ro-Ro / ConRo Liner",
    vesselMppTramp: "Çok Amaçlı Tramp (15k DWT)",
    vesselHandysizeBulk: "Handysize Dökme Yük Charter (32k DWT)",
    vesselCoastalCharter: "Kısa Mesafe Coaster Tramp (5k DWT)",
    fixedScheduleLabel: "Sabit Sefer Takvimi",
    predictableEtaLabel: "Öngörülebilir ETA Penceresi",
    publishedLineEmissionsTitle: "Liner Sabit Sefer Takvimi ve Hat Bazlı Yayınlanan Emisyonlar",
    publishedLineEmissionsDesc: "Haftalık sabit kalkış pencereleri, öngörülebilir rıhtım ETA aralıkları (±1,5–3 saat) ve hat bazlı doğrulanmış WTW emisyon yoğunlukları.",
    linerLineCol: "Liner Hattı / Armatör",
    sailingScheduleCol: "Sabit Kalkış & Cut-Off",
    etaWindowCol: "Öngörülebilir ETA & SLA",
    publishedIntensityCol: "Hat Bazlı Yayınlanan Emisyon",
    weatherWindowCol: "Hava Penceresi",
    smsAlertsTitle: "Liner Takvim ve Hava Penceresi Bildirimleri",
    smsAlertsScopeNote: "Demo kapsamı: uygulama içi bildirim merkezi + simüle edilmiş SMS gönderim önizlemesi (canlı operatör SMS geçidi bağlı değildir).",
    smsChannelLabel: "SMS Gönderimi (Demo)",
    inAppChannelLabel: "Uygulama İçi Zil Bildirimi",
    scheduleChangeAlertsLabel: "Tarife / Rıhtım Değişikliği (>2s)",
    weatherWindowAlertsLabel: "Deniz Hava Pencereleri",
    demoPhoneLabel: "Demo SMS Alıcısı",
    simulateScheduleAlertBtn: "Tarife Değişikliği Bildirimi Test Et",
    simulateWeatherAlertBtn: "Hava Penceresi Uyarısı Test Et",
    alertDispatchedLogTitle: "Gönderilen Liner Uyarıları ve SMS Kaydı",
    markAllReadBtn: "Tümünü okundu say",
    cutoffLabel: "Yük Cut-Off",
    yoyTrendLabel: "Yıllık Yoğunluk",

    complianceAccountingTitle: "Denizcilik Uyumluluk ve Sefer Bazlı ESG Muhasebesi",
    complianceAccountingSubtitle: "IMO EEXI ve CII gemi derecelendirme takibi, günlük TCE ve sefer başı CO2 değerlendirmesi ile kalem bazlı ESG maliyet muhasebesi.",
    eexiCiiTrackerTitle: "IMO EEXI ve CII Derecelendirme Takibi",
    eexiCiiTrackerDesc: "Gerçekleşen ve zorunlu EEXI verimlilik endeksi, EPL motor güç sınırlayıcıları ve yavaş seyir etkili 2026 CII notları (A–E).",
    eexiAttainedReqLabel: "EEXI (Gerç. / Zor.)",
    eexiCompliantLabel: "EEXI Uyumlu",
    eplLimitLabel: "EPL Sınırı",
    ciiRatingLabel: "CII Notu",
    ciiAttainedReqLabel: "CII AER (Gerç. / Zor.)",
    ciiRatioLabel: "CII Oranı",
    ciiNextYearLabel: "2027 Tahmini",
    fuelEuIntensityLabel: "FuelEU Yoğunluk",
    slowSteamingCiiPreview: "Yavaş Seyir CII Etkisi",
    tceCo2TripTitle: "TCE ve Sefer Başı CO2 Değerlendirmesi",
    tceCo2TripDesc: "Yakıt, liman, bekleme ve karbon giderleri sonrası günlük Zaman Çarteri Eşdeğeri (TCE) getirisi ve sefer CO2 yükü.",
    tcePerDayLabel: "TCE (€/gün)",
    tceBenchmarkLabel: "Piyasa Referansı",
    tceFormulaNote: "TCE = (Brüt Navlun Geliri − Sefer Giderleri) ÷ Sefer Günü",
    grossFreightRevLabel: "Brüt Navlun Geliri",
    voyageExpensesLabel: "Sefer Giderleri",
    co2PerTripLabel: "Sefer Başı CO2",
    co2PerDayLabel: "Günlük CO2",
    tcePerTonneCo2Label: "TCE / ton CO2",
    esgCostAccountingTitle: "Sefer Başı ESG Maliyet Muhasebesi",
    esgCostAccountingDesc: "EU ETS tahsisatları, FuelEU Maritime GHG dengesi, bekleme karbonu, gönüllü dengeleme ve yeşil finansman indirimi kırılımı.",
    euEtsLiabilityLabel: "EU ETS / Karbon Yükü",
    fuelEuBalanceLabel: "FuelEU Maritime Dengesi",
    dwellCarbonLabel: "Bekleme Karbonu",
    voluntaryOffsetLabel: "Gönüllü VCS Dengeleme",
    greenRebateLabel: "Yeşil ESG İndirimi",
    totalEsgCostTripLabel: "Toplam Sefer ESG Maliyeti",
    esgAdjustedCostLabel: "ESG Düzeltilmiş Sefer Maliyeti",
    esgShareLabel: "ESG Maliyet Payı",
    commercialCostLabel: "Ticari Navlun Maliyeti",
    portfolioTripLedgerTitle: "Sefer Bazlı Uyumluluk, TCE ve ESG Muhasebe Defteri",

    sharedVesselKpiTitle: "Gemi Bazlı Ortak KPI Şeffaflık Katmanı",
    sharedVesselKpiDesc: "Panel, Sürdürülebilirlik, Küresel Ağ ve Canlı Takip ekranlarında aynı hesaplama katmanından beslenen gemi KPI görünümü.",
    sharedTransparencyLayerLabel: "Ortak Şeffaflık Motoru: GLEC v3.0 WTW · IMO MEPC.328 · EU ETS",
    vesselNameImoCol: "Gemi / IMO",
    serviceClassCol: "Hizmet & Kapasite",
    tripsCargoCol: "Sefer / Hacim",
    co2PerTripCol: "Ort. Sefer CO2",
    reliabilityOtifCol: "Tarife Uyumu",
    formulaTransparencyBtn: "Şeffaflık Formüllerini Göster",
    formulaTransparencyNote: "Aynı GLEC WTW, IMO EEXI/CII, TCE (€/gün) ve EU ETS + FuelEU formülleri tek noktadan hesaplanır ve tüm görünümlerde paylaşılır.",
    greenFleetRefTitle: "Yeşil Filo Referans Senaryosu: Konvansiyonel vs. Metanol Hazır Gemiler",
    greenFleetRefDesc: "Konvansiyonel VLSFO gemiler ile yeşil e-metanol prim fiyatlaması dahil çift yakıtlı metanol-hazır gemileri kıyaslayan referans karşılaştırma.",
    referenceCaseNotice: "Referans Karşılaştırma Vakası (Salt Okunur): Aktif bir metanol rezervasyon veya ikmal özelliği değildir.",
    greenFuelPremiumLabel: "e-Metanol Yakıt Primi",
    vesselPathwayCol: "Gemi & Yakıt Yolu",
    wtwIntensityCol: "WTW Yoğunluk",
    charterCapexCol: "Baz + Hazırlık Primi",
    greenFuelPremCol: "Yeşil Yakıt Primi",
    netsComplianceCol: "ETS + FuelEU − İndirim",
    netAllInCostCol: "Toplam / TEU",
    premiumVsConvCol: "VLSFO'ya Göre Net Fark",
    benchmarkLabel: "Model Bazı",
    liveFleetLabel: "Canlı Portföy"
  },
  el: {
    dashboard: "Πίνακας Ελέγχου",
    shipments: "Αποστολές",
    tracking: "Ζωντανή Παρακολούθηση",
    sustainability: "Βιωσιμότητα",
    globalNetwork: "Παγκόσμιο Δίκτυο",
    docs: "Τεκμηρίωση Συστήματος",
    settings: "Ρυθμίσεις",
    aiAssistant: "AI Βοηθός",
    operationalOverview: "Επιχειρησιακή Επισκόπηση",
    realTimeMetrics: "Μετρήσεις εφοδιαστικής και βιωσιμότητας σε πραγματικό χρόνο.",
    totalShipments: "Συνολικές Αποστολές",
    carbonFootprint: "Αποτύπωμα Άνθρακα",
    freightSpend: "Συνολική Δαπάνη Φορτίου",
    avgIntensity: "Μέση Ένταση Εκπομπών",
    newShipment: "Νέα Αποστολή",
    createShipment: "Δημιουργία Αποστολής",
    customer: "Πελάτης",
    origin: "Προέλευση",
    destination: "Προορισμός",
    weight: "Βάρος (Τόνοι)",
    volume: "Όγκος (CBM)",
    incoterms: "Incoterms",
    mode: "Τρόπος Μεταφοράς",
    status: "Κατάσταση",
    history: "Ιστορικό Αποστολών",
    aiInsights: "Συστάσεις Βιωσιμότητας AI",
    offsetting: "Αντιστάθμιση Άνθρακα",
    search: "Αναζήτηση αποστολών...",
    cancel: "Ακύρωση",
    book: "Κράτηση Αποστολής",
    esgScore: "Βαθμολογία ESG",
    
    signOut: "Αποσύνδεση",
    switchMode: "Αλλαγή Λειτουργίας",
    daysRemaining: "ημ. απομένουν",
    days: "Ημέρες",
    
    demoJury: "Πρόσβαση Κριτικής Επιτροπής NBG Seeds",
    demoClient: "Προεπισκόπηση Πελάτη",
    demoAccount: "Λογαριασμός Demo",
    tryDemo: "Δοκιμή Demo",
    tryDemoDesc: "Άμεση πρόσβαση με ενδεικτικά δεδομένα, χωρίς εγγραφή",
    readOnly: "Μόνο Ανάγνωση",
    readOnlyNoticeTitle: "Λειτουργία Προεπισκόπησης Πελάτη (Μόνο Ανάγνωση)",
    readOnlyNoticeDesc: "Η δημιουργία και διαγραφή αποστολών είναι απενεργοποιημένη σε αυτήν την προεπισκόπηση. Όλες οι 16 ενδεικτικές αποστολές και οι αναλύσεις AI είναι διαθέσιμες προς αξιολόγηση.",
    demoExpired: "Η Περίοδος Demo Ολοκληρώθηκε",
    demoExpiredDesc: "Αυτή η δοκιμαστική συνεδρία αξιολόγησης έχει λήξει. Για πλήρη εταιρική ενσωμάτωση και πρόσβαση λογαριασμού, επικοινωνήστε με την ομάδα της EcoFreight.",
    renewDemo: "Ανανέωση Demo",
    contact: "Επικοινωνία",
    
    quickDemoAccess: "Άμεση Πρόσβαση Demo & Αξιολόγησης",
    instantAccess: "Πρόσβαση με 1 Κλικ",
    orCorporate: "ή σύνδεση με εταιρικό λογαριασμό",
    juryCardTitle: "Διαγωνισμός NBG Seeds & Είσοδος Κριτών",
    juryCardDesc: "Πλήρης πρόσβαση αξιολόγησης: Πολυτροπική βελτιστοποίηση διαδρομών, πληροφορίες CBAM & AI ενεργά",
    startJury: "Είσοδος ως Κριτής (14 Ημέρες Πλήρης Πρόσβαση)",
    clientCardTitle: "Προεπισκόπηση Υποψήφιου Πελάτη",
    clientCardDesc: "Προστατευμένη λειτουργία: Επισκόπηση 16 αποστολών, διαδραστικοί χάρτες & δείκτες απανθρακοποίησης",
    startClient: "Έναρξη Προεπισκόπησης Πελάτη (3 Ημέρες • Μόνο Ανάγνωση)",
    linkCopied: "Ο σύνδεσμος άμεσης πρόσβασης αντιγράφηκε στο πρόχειρο!",
    emailPlaceholder: "Διεύθυνση Email",
    passwordPlaceholder: "Κωδικός Πρόσβασης",
    signInBtn: "Ασφαλής Σύνδεση",
    
    consignment: "Φορτωτική",
    originDest: "Προέλευση → Προορισμός",
    cargoWeight: "Φορτίο / Βάρος",
    emissions: "Εκπομπές",
    freightCost: "Κόστος Ναύλου",
    inTransit: "Σε Μεταφορά",
    delivered: "Παραδόθηκε",
    booked: "Καταχωρήθηκε",
    sea: "Θαλάσσιο",
    rail: "Σιδηροδρομικό",
    road: "Οδικό",
    air: "Αεροπορικό",
    modalDistribution: "Κατανομή Τρόπων Μεταφοράς",
    weeklyTrend: "Εβδομαδιαία Τάση Εκπομπών & Δαπανών",
    customs: "Τελωνείο",
    cancelled: "Ακυρώθηκε",
    actions: "Ενέργειες",
    route: "Διαδρομή",
    idCustomer: "ID / Πελάτης",
    back: "Πίσω",
    close: "Κλείσιμο",
    dashTitle: "Πίνακας Ελέγχου",
    dashSubtitle: "Παρακολούθηση Logistics & Απόδοσης ESG",
    activeConsignments: "Ενεργές Αποστολές",
    completed: "Ολοκληρώθηκαν",
    intermodalEfficiency: "Διατροπική Αποδοτικότητα",
    greenShare: "Πράσινο Μερίδιο Σιδ/Θάλ",
    emissionsCurve: "Τάση Εκπομπών",
    emissionsCurveDesc: "Συνολικές εκπομπές GHG (kg CO2e) σε όλες τις πολυτροπικές διαδρομές",
    activeCorridors: "Ενεργοί Στρατηγικοί Διάδρομοι",
    modalShiftBenefit: "Όφελος Αλλαγής Μέσου",
    modalShiftDesc: "Ο τρέχων συνδυασμός σιδηροδρόμου/θάλασσας εξοικονομεί ~64% CO2 έναντι οδικών μεταφορών.",
    shipTitle: "Διαχείριση Αποστολών",
    shipSubtitle: "Λειτουργίες αποστολών, κόστος & εκπομπές ανά αποστολή",
    newShipmentAnalysis: "Ανάλυση Νέας Αποστολής",
    dropBol: "Ανεβάστε φορτωτική για αυτόματη συμπλήρωση",
    analyzeOptions: "Ανάλυση Επιλογών",
    fillRequired: "Συμπληρώστε πελάτη, προέλευση, προορισμό και βάρος μεγαλύτερο του 0.",
    bookNow: "Κράτηση Τώρα",
    shipmentDetails: "Λεπτομέρειες Αποστολής",
    legs: "Σκέλη Μεταφοράς",
    totalCost: "Συνολικό Κόστος",
    publicPortal: "Δημόσια Πύλη Παρακολούθησης",
    copyTrackingLink: "Αντιγραφή Συνδέσμου",
    copied: "Αντιγράφηκε!",
    trackTitle: "Κέντρο Ελέγχου Logistics",
    trackSubtitle: "Παρακολούθηση διαδρόμων, ειδοποιήσεις κινδύνου & AI επιθεώρηση φορτίου",
    chokepointAlerts: "Ειδοποιήσεις Σημείων Συμφόρησης",
    consignmentMetrics: "Μετρικές Αποστολής",
    milestoneHistory: "Ιστορικό Σταθμών",
    damageAudit: "AI Έλεγχος Ακεραιότητας Φορτίου",
    uploadPhoto: "Μεταφόρτωση Φωτογραφίας",
    noShipments: "Καμία αποστολή δεν ταιριάζει με την αναζήτηση.",
    sustTitle: "Ευφυΐα Βιωσιμότητας",
    sustSubtitle: "Ανάλυση εκπομπών & σχεδιασμός απανθρακοποίησης",
    complianceEngine: "Μηχανή Συμμόρφωσης",
    exportReport: "Εξαγωγή αποστολών (CSV)",
    offsetMarket: "Αγορά Αντιστάθμισης",
    offsetDesc: "Μόνο προσομοίωση. Δεν αγοράζονται πιστώσεις. Τα πραγματικά offsets θέλουν πιστοποιημένο μητρώο.",
    investNow: "Προσομοίωση αντιστάθμισης",
    neutralized: "Προσομοίωση ολοκληρώθηκε (καμία αγορά)",
    verticalTitle: "Επιλέξτε κατακόρυφο",
    verticalSub: "Επιλέξτε την ενότητα που θέλετε να ανοίξετε.",
    verticalMaritime: "Θαλάσσια",
    verticalMaritimeDesc: "Θαλάσσια & πολυτροπική μεταφορά",
    verticalRoad: "Οδική",
    verticalRoadDesc: "Στόλος & οδική μεταφορά (προεπισκόπηση)",
    comingSoon: "Σύντομα",
    roadFleet: "Επισκόπηση στόλου",
    roadRoutes: "Διαδρομές",
    roadDrivers: "Οδηγοί",
    roadCarbon: "Άνθρακας",
    roadCompliance: "Συμμόρφωση",
    switchVertical: "Αλλαγή κατακόρυφου",
    vehicleType: "Τύπος οχήματος",
    distanceKm: "Απόσταση (km)",
    emissionsResult: "Εκτιμώμενο CO₂e (kg)",
    indicativeFactors: "Ενδεικτικοί συντελεστές, μη επαληθευμένοι. Επιβεβαιώστε την πηγή πριν τη χρήση.",
    routeEstimate: "Εκτιμώμενος χρόνος και καύσιμο (ευθεία απόσταση)",
    routeAssumptions: "Παραδοχές: συντελεστής δρόμου 1,35, μέση ταχύτητα 25 km/h, 10 l/100 km, πετρέλαιο 1,80 €/l",
    placeholderNote: "Η ενότητα είναι προεπισκόπηση. Δεν υπάρχουν ακόμα δεδομένα.",
    vtVan: "Van",
    vtTruck7: "Φορτηγό 7,5 t",
    vtTruck18: "Φορτηγό 18 t",
    vtTruck40: "Φορτηγό 40 t",
    vtEVan: "Ηλεκτρικό van",
    carbonEstimate: "GLEC v3.0 · ISO 14083 (WTW)",
    cbamLabel: "Ενδεικτικό κόστος άνθρακα (demo)",
    cbamSub: "Δεν είναι υπολογισμός CBAM ή ETS",
    complianceSub: "Μόνο ενδεικτικά, όχι επίσημη υποβολή",
    targetProgress: "Πρόοδος στόχου μείωσης (δείγμα)",
    coPilot: "Συγκυβερνήτης Βιωσιμότητας",
    emissionsByZone: "Εκπομπές ανά Ρυθμιστική Ζώνη",
    netTitle: "Ευφυΐα Προμηθευτών",
    netSubtitle: "Βαθμολογία ESG Μεταφορέων & Κατάταξη Δικτύου",
    aiTitle: "Κέντρο Εντολών AI",
    aiSubtitle: "Ευφυΐα πολυτροπικών μεταφορών με Google Gemini",
    aiWelcome: "Καλώς ήρθατε στο Κέντρο Εντολών AI της EcoFreight με Google Gemini. Πώς μπορώ να βοηθήσω με απανθρακοποίηση διαδρομών, παρακολούθηση εκπομπών ή πολυτροπικές μεταφορές;",
    aiPlaceholder: "Ρωτήστε για διαδρομές, συντελεστές εκπομπών ή πολυτροπικές επιλογές...",
    aiThinking: "Το Gemini αναλύει...",
    aiError: "Η απάντηση AI δεν ολοκληρώθηκε. Ελέγξτε τη σύνδεσή σας.",
    voiceInput: "Φωνητική Εισαγωγή",
    listening: "Ακούω...",
    voiceUnsupported: "Η φωνητική εισαγωγή δεν υποστηρίζεται σε αυτόν τον browser. Πληκτρολογήστε το μήνυμά σας.",
    quickPrompts: "Γρήγορες Ερωτήσεις AI",
    qpSuez: "Καθυστερήσεις Σουέζ",
    qpSuezQ: "Ποια είναι η τρέχουσα κατάσταση στη Διώρυγα του Σουέζ και την Ερυθρά Θάλασσα, και πώς μειώνουμε καθυστερήσεις και εκπομπές;",
    qpEmissions: "Σύνοψη Εκπομπών",
    qpEmissionsQ: "Σύνοψε το δυναμικό μείωσης εκπομπών άνθρακα μεταξύ Οδικών, Σιδηροδρομικών και Θαλάσσιων μεταφορών.",
    qpFleet: "Βελτιστοποίηση Στόλου",
    qpFleetQ: "Ποιες στρατηγικές μπορεί να υιοθετήσει ο στόλος μας για ελάχιστη κατανάλωση καυσίμου και μείωση εκπομπών αερίων θερμοκηπίου;",
    notifications: "Τελευταίες Ενημερώσεις",
    preferredCarrier: "Προτιμώμενος Μεταφορέας",
    preferredCarrierSet: "Προτιμώμενος",

    routeOptimizer: "Βελτιστοποίηση Κόστους",
    routeOptimizerTitle: "Βελτιστοποίηση Διαδρομής: Καύσιμα, CO2 & Λιμενικά Τέλη",
    routeOptimizerSubtitle: "Συνδυασμένος υπολογισμός κόστους καυσίμων, CO2 και λιμενικών τελών σε πολυτροπικούς διαδρόμους.",
    fuelCost: "Κόστος Καυσίμων",
    co2Cost: "Κόστος CO2",
    fuelPlusCo2: "Καύσιμα + CO2",
    baseFreight: "Βασικός Ναύλος",
    totalLandedCost: "Συνολικό Κόστος",
    carbonPriceLabel: "Τιμή Άνθρακα (€ / τόνο CO2e)",
    fuelIndexLabel: "Δείκτης Τιμής Καυσίμων",
    optimizePriority: "Στόχος Βελτιστοποίησης",
    priorityTotalCost: "Ελάχιστο Συνολικό Κόστος (Ναύλος + Καύσιμα + CO2 + Λιμάνια)",
    priorityFuelCo2: "Ελάχιστο Κόστος Καυσίμων + CO2",
    priorityFastest: "Ταχύτερη Μεταφορά",
    optimalChoice: "Βέλτιστη Οικονομικά Διαδρομή",
    savingsVsRoad: "Εξοικονόμηση έναντι Οδικού",
    runCostOptimization: "Υπολογισμός Βέλτιστης Διαδρομής",
    corridorPresets: "Έτοιμοι Διάδρομοι",
    bookSelectedRoute: "Κράτηση Επιλεγμένης Διαδρομής",
    transitDays: "Διάρκεια",
    costBreakdownTitle: "Ανάλυση Κόστους: Ναύλος, Καύσιμα, CO2 & Λιμενικά Τέλη",
    portFees: "Λιμενικά Τέλη",
    originPortFee: "Τέλη Λιμένα Προέλευσης (€)",
    destinationPortFee: "Τέλη Λιμένα Προορισμού (€)",
    autoEstimatePorts: "Αυτόματη Εκτίμηση",
    applyTerminalFeesAllModes: "Εφαρμογή τελών τερματικού σε Σιδηρόδρομο / Οδικό / Αεροπορικό",
    portFeesActiveNote: "Ενεργό σε Θαλάσσιο & Διατροπικό · Προαιρετικό στα υπόλοιπα",
    shipmentLedgerTitle: "Ανάλυση Κόστους Αποστολής",
    containersTeu: "Εμπορευματοκιβώτια (TEU)",
    teuKm: "TEU-km",
    teuKmFormula: "απόσταση × εμπορευματοκιβώτια",
    costPerTeuKm: "€/TEU-km",
    co2PerTeuKm: "CO2 / TEU-km",
    totalTeuKm: "Συνολικά TEU-km",
    unitCostTeuKm: "Κόστος ανά TEU-km",
    glecMethodBtn: "Μέθοδος GLEC v3.0",
    glecMethodTitle: "Μεθοδολογία Υπολογισμού CO2e GLEC Framework v3.0",
    glecMethodSubtitle: "Υπολογισμός άνθρακα Well-to-Wheel (WTW) σύμφωνα με το πρότυπο ISO 14083.",
    glecStandardLabel: "Πρότυπο",
    glecBoundaryLabel: "Όριο Συστήματος",
    glecFormulaLabel: "Βασικός Τύπος",
    glecTtwLabel: "TTW (Άμεσες Εκπομπές)",
    glecWttLabel: "WTT (Παραγωγή Ενέργειας)",
    glecTotalWtwLabel: "Συνολικός Συντελεστής WTW",
    glecLiveCalculation: "Ζωντανή Ανάλυση Υπολογισμού",
    glecFactorsTableTitle: "Προεπιλεγμένοι Συντελεστές GLEC v3.0 (kg CO2e / t·km)",
    glecTocSource: "Κατηγορία Λειτουργίας Μεταφοράς",
    dwellTimeHours: "Χρόνος Αναμονής Λιμένα (Ώρες)",
    dwellCost: "Κόστος Αναμονής",
    dwellEmissions: "CO2e Αναμονής",
    dwellImpactLabel: "Επίπτωση Αναμονής",
    dwellPresetFast: "0ω Ταχεία",
    dwellPresetNormal: "24ω Κανονική",
    dwellPresetModerate: "48ω Μέτρια",
    dwellPresetCongested: "72ω Συμφόρηση",
    dwellNote: "Αποθήκευση + βοηθητική ενέργεια πλοίου (GLEC v3.0: 2,8 kg CO2e/TEU·h)",
    scheduleReliability: "Αξιοπιστία Χρονοδιαγράμματος",
    reliabilityOverTime: "Αξιοπιστία Χρονοδιαγράμματος στον Χρόνο",
    reliabilityOverTimeDesc: "Ποσοστό έγκαιρης τήρησης ETA (%) ανά μεταφορικό μέσο",
    scheduleReliabilityNote: "Μετρά την τήρηση προγραμματισμένων αφίξεων (δεν αφορά ασφάλιση φορτίου).",
    onTimeArrivals: "Έγκαιρα Δρομολόγια",
    avgScheduleDelay: "Μέση Καθυστέρηση",
    slaTarget: "Στόχος SLA (88%)",
    priorityReliability: "Μέγιστη Αξιοπιστία Χρονοδιαγράμματος",
    scheduleAdherence: "Τήρηση ETA",
    onTime: "Εμπρόθεσμο",
    delayed: "Καθυστέρηση",
    months6Label: "6 Μήνες",
    weeks12Label: "12 Εβδ.",
    priorityCarbonAware: "Φιλική προς τον Άνθρακα (Ελάχιστο CO2 με Παρόμοιο Κόστος)",
    speedProfileLabel: "Καθεστώς Ταχύτητας",
    standardSpeed: "Κανονική Ταχύτητα",
    ecoSpeedLabel: "Οικολογική Ταχύτητα (Slow Steaming)",
    carbonAwareTitle: "Δρομολόγηση Χαμηλού Άνθρακα & Αντιστάθμιση",
    carbonAwareDesc: "Προτείνει διαδρομή ή ταχύτητα με χαμηλότερο CO2 για παρόμοιο κόστος, προβάλλοντας την αντιστάθμιση.",
    costTolerance: "Όριο Κόστους",
    similarCostBand: "Παρόμοιο Κόστος",
    baselineOption: "Βασική Οικονομικότερη Επιλογή",
    carbonAwareOption: "Πρόταση Χαμηλού Άνθρακα",
    applyCarbonAware: "Εφαρμογή Πρότασης Χαμηλού Άνθρακα",
    carbonAwareApplied: "Ενεργό",
    co2SavingsLabel: "Μείωση CO2e",
    costDeltaLabel: "Διαφορά Κόστους",
    transitDeltaLabel: "Αντιστάθμιση Χρόνου",
    reliabilityDeltaLabel: "Επίπτωση ETA",
    abatementCostLabel: "Κόστος Μείωσης CO2",
    tradeoffChartTitle: "Καμπύλη Κόστους έναντι CO2e",
    tradeoffChartDesc: "Κανονική vs. Οικολογική ταχύτητα ανά μέσο (κάτω αριστερά βέλτιστο)",
    recTypeRouteAndSpeed: "Αλλαγή Διαδρομής + Οικολογική Ταχύτητα",
    recTypeRouteShift: "Αλλαγή Διατροπικής Διαδρομής",
    recTypeEcoSpeed: "Slow Steaming / Οικολογική Ταχύτητα",
    slowSteamingTitle: "Slow Steaming & Εξοικονόμηση Καυσίμων / CO2",
    slowSteamingDesc: "Μειώστε την ταχύτητα πλεύσης για σημαντική εξοικονόμηση καυσίμου και εκπομπών CO2e (Νόμος Έλικα).",
    slowSteamingSpeedReduction: "Μείωση Ταχύτητας",
    slowSteamingNormal: "0% Κανονική (20 kts)",
    slowSteaming10: "-10% (18 kts)",
    slowSteaming15: "-15% Οικολ. (17 kts)",
    slowSteaming20: "-20% Αργή (16 kts)",
    slowSteaming25: "-25% Υπερ-Αργή (15 kts)",
    fuelSavedLabel: "Εξοικ. Καυσίμου",
    co2SavedLabel: "Εξοικ. CO2e",
    combinedSavingsLabel: "Σύνολο Καύσιμα + CO2",
    vesselSpeedLabel: "Ταχύτητα Πλοίου",
    speedSavingsCurveTitle: "Εξοικονόμηση ανά Κλίμακα Ταχύτητας",
    propellerLawNote: "Νόμος Έλικα: 15% μείωση ταχύτητας μειώνει καύσιμα & CO2e κατά ~23,6%.",
    seaLiner: "Θαλάσσιο (Liner)",
    seaTramp: "Θαλάσσιο (Tramp)",
    seaServiceSubcategories: "Τύποι Πλοίων & Ναυτιλιακών Υπηρεσιών",
    linerServiceLabel: "Τακτική Γραμμή (Liner)",
    trampServiceLabel: "Ναύλωση Ταξιδιού (Tramp)",
    linerVesselTypeLabel: "Τύπος Πλοίου Liner",
    trampVesselTypeLabel: "Τύπος Πλοίου Tramp",
    seaFilterAll: "Όλα (Liner + Tramp)",
    seaFilterLiner: "Μόνο Liner",
    seaFilterTramp: "Μόνο Tramp",
    linerLogicSummary: "Σταθερό δρομολόγιο · Τιμολόγιο slot TEU · Προτεραιότητα ελλιμενισμού · 0% έρμα",
    trampLogicSummary: "Spot ναύλωση · Κλιμακωτό ναύλο τόνου · 1,35× αναμονή θέσης · +12% έρμα",
    serviceLogicTitle: "Λογική Λειτουργίας Liner έναντι Tramp",
    pricingModelLabel: "Μοντέλο Ναύλου",
    berthDwellLogicLabel: "Κανόνας Αναμονής Λιμένα",
    ballastFactorLabel: "Μετακίνηση Έρματος",
    reliabilityBaselineLabel: "Τήρηση Χρονοδιαγράμματος",
    cruisingSpeedLabel: "Ταχύτητα Πλεύσης",
    vesselContainerDeepsea: "Πλοίο Εμπορευματοκιβωτίων Deep-Sea (14k TEU)",
    vesselContainerFeeder: "Τροφοδοτικό Container Feeder (2,5k TEU)",
    vesselRoroFerry: "Πλοίο Ro-Ro / ConRo Liner",
    vesselMppTramp: "Πλοίο Πολλαπλών Χρήσεων Tramp (15k DWT)",
    vesselHandysizeBulk: "Ναύλωση Χύδην Φορτίου Handysize (32k DWT)",
    vesselCoastalCharter: "Ακτοπλοϊκό Coaster Tramp (5k DWT)",
    fixedScheduleLabel: "Σταθερό Πρόγραμμα Απόπλου",
    predictableEtaLabel: "Προβλέψιμο Παράθυρο ETA",
    publishedLineEmissionsTitle: "Σταθερά Δρομολόγια Liner & Δημοσιευμένες Εκπομπές ανά Γραμμή",
    publishedLineEmissionsDesc: "Σταθερές εβδομαδιαίες αναχωρήσεις, προβλέψιμα παράθυρα ETA (±1,5–3 ώρες) και πιστοποιημένες εκπομπές WTW ανά γραμμή Liner.",
    linerLineCol: "Γραμμή Liner / Μεταφορέας",
    sailingScheduleCol: "Σταθερός Απόπλους & Cut-Off",
    etaWindowCol: "Προβλέψιμο ETA & SLA",
    publishedIntensityCol: "Δημοσιευμένες Εκπομπές Γραμμής",
    weatherWindowCol: "Καιρικό Παράθυρο",
    smsAlertsTitle: "Ειδοποιήσεις Δρομολογίων & Καιρού Liner",
    smsAlertsScopeNote: "Εύρος demo: ειδοποιήσεις εφαρμογής + προσομοίωση αποστολής SMS (χωρίς εξωτερική πύλη τηλεπικοινωνιών).",
    smsChannelLabel: "Αποστολή SMS (Demo)",
    inAppChannelLabel: "Ειδοποιήσεις Εφαρμογής",
    scheduleChangeAlertsLabel: "Αλλαγή Προγράμματος (>2ώ)",
    weatherWindowAlertsLabel: "Θαλάσσια Καιρικά Παράθυρα",
    demoPhoneLabel: "Παραλήπτης SMS Demo",
    simulateScheduleAlertBtn: "Προσομοίωση Αλλαγής Προγράμματος",
    simulateWeatherAlertBtn: "Προσομοίωση Καιρικού Παραθύρου",
    alertDispatchedLogTitle: "Ιστορικό Ειδοποιήσεων & SMS Liner",
    markAllReadBtn: "Σήμανση όλων ως αναγνωσμένα",
    cutoffLabel: "Cut-Off Φορτίου",
    yoyTrendLabel: "Ετήσια Μεταβολή",

    complianceAccountingTitle: "Ναυτιλιακή Συμμόρφωση & Λογιστική ESG ανά Ταξίδι",
    complianceAccountingSubtitle: "Παρακολούθηση δεικτών EEXI & CII, αξιολόγηση TCE και CO2 ανά ταξίδι και αναλυτική λογιστική κόστους ESG.",
    eexiCiiTrackerTitle: "Παρακολούθηση Δεικτών IMO EEXI & CII",
    eexiCiiTrackerDesc: "Επιτευχθείς έναντι απαιτούμενου δείκτη EEXI, περιοριστές ισχύος EPL και βαθμολογία CII 2026 (A–E) με επίδραση slow steaming.",
    eexiAttainedReqLabel: "EEXI (Επιτ. / Απαιτ.)",
    eexiCompliantLabel: "Συμμόρφωση EEXI",
    eplLimitLabel: "Όριο EPL",
    ciiRatingLabel: "Βαθμός CII",
    ciiAttainedReqLabel: "CII AER (Επιτ. / Απαιτ.)",
    ciiRatioLabel: "Λόγος CII",
    ciiNextYearLabel: "Πρόβλ. 2027",
    fuelEuIntensityLabel: "Ένταση FuelEU",
    slowSteamingCiiPreview: "Επίδραση Slow Steaming στο CII",
    tceCo2TripTitle: "Αξιολόγηση TCE & CO2 ανά Ταξίδι",
    tceCo2TripDesc: "Ημερήσιο Ισοδύναμο Χρονοναύλωσης (TCE) μετά από καύσιμα, λιμενικά τέλη και κόστος άνθρακα έναντι εκπομπών CO2 ταξιδιού.",
    tcePerDayLabel: "TCE (€/ημέρα)",
    tceBenchmarkLabel: "Δείκτης Αγοράς",
    tceFormulaNote: "TCE = (Μικτά Έσοδα Ναύλου − Έξοδα Ταξιδιού) ÷ Ημέρες Ταξιδιού",
    grossFreightRevLabel: "Μικτά Έσοδα Ναύλου",
    voyageExpensesLabel: "Έξοδα Ταξιδιού",
    co2PerTripLabel: "CO2 / Ταξίδι",
    co2PerDayLabel: "CO2 / Ημέρα",
    tcePerTonneCo2Label: "TCE / t CO2",
    esgCostAccountingTitle: "Λογιστική Κόστους ESG ανά Ταξίδι",
    esgCostAccountingDesc: "Ανάλυση δικαιωμάτων EU ETS, ισοζυγίου FuelEU Maritime, άνθρακα αναμονής, εθελοντικής αντιστάθμισης και πράσινης έκπτωσης.",
    euEtsLiabilityLabel: "Επιβάρυνση EU ETS",
    fuelEuBalanceLabel: "Ισοζύγιο FuelEU Maritime",
    dwellCarbonLabel: "Κόστος Άνθρακα Αναμονής",
    voluntaryOffsetLabel: "Εθελοντική Αντιστάθμιση VCS",
    greenRebateLabel: "Πράσινη Έκπτωση ESG",
    totalEsgCostTripLabel: "Συνολικό Κόστος ESG / Ταξίδι",
    esgAdjustedCostLabel: "Συνολικό Κόστος με ESG",
    esgShareLabel: "Μερίδιο ESG",
    commercialCostLabel: "Εμπορικό Κόστος Ναύλου",
    portfolioTripLedgerTitle: "Καθολικό Συμμόρφωσης, TCE & Κόστους ESG ανά Ταξίδι",

    sharedVesselKpiTitle: "Κοινό Επίπεδο Διαφάνειας KPI ανά Πλοίο",
    sharedVesselKpiDesc: "Ενιαία πηγή δεδομένων ανά πλοίο σε Πίνακα Ελέγχου, Βιωσιμότητα, Δίκτυο και Παρακολούθηση.",
    sharedTransparencyLayerLabel: "Κοινός Μηχανισμός Διαφάνειας: GLEC v3.0 WTW · IMO MEPC.328 · EU ETS",
    vesselNameImoCol: "Πλοίο / IMO",
    serviceClassCol: "Υπηρεσία & Χωρητικότητα",
    tripsCargoCol: "Ταξίδια / Όγκος",
    co2PerTripCol: "Μ.Ο. CO2 / Ταξίδι",
    reliabilityOtifCol: "Αξιοπιστία ETA",
    formulaTransparencyBtn: "Προβολή Τύπων Διαφάνειας",
    formulaTransparencyNote: "Οι ίδιοι τύποι GLEC WTW, IMO EEXI/CII, TCE (€/ημέρα) και EU ETS + FuelEU υπολογίζονται ενιαία για όλες τις οθόνες.",
    greenFleetRefTitle: "Περίπτωση Αναφοράς Πράσινου Στόλου: Συμβατικά έναντι Methanol-Ready Πλοίων",
    greenFleetRefDesc: "Ενδεικτική σύγκριση συμβατικών πλοίων VLSFO με πλοία διπλού καυσίμου methanol-ready, συμπεριλαμβανομένου του σεναρίου premium τιμολόγησης.",
    referenceCaseNotice: "Περίπτωση Αναφοράς (Μόνο Ανάγνωση): Δεν αποτελεί ενεργή λειτουργία κράτησης ή ανεφοδιασμού μεθανόλης.",
    greenFuelPremiumLabel: "Premium Καυσίμου e-Methanol",
    vesselPathwayCol: "Πλοίο & Διαδρομή Καυσίμου",
    wtwIntensityCol: "WTW GHG",
    charterCapexCol: "Ναύλος + Ετοιμότητα",
    greenFuelPremCol: "Premium Πράσινου Καυσίμου",
    netsComplianceCol: "ETS + FuelEU − Έκπτωση",
    netAllInCostCol: "Σύνολο / TEU",
    premiumVsConvCol: "Καθαρή Διαφορά έναντι VLSFO",
    benchmarkLabel: "Βάση Μοντέλου",
    liveFleetLabel: "Ζωντανό Χαρτοφυλάκιο"
  }
};

export const useTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};

export const statusLabel = (status: string, t: Translations): string => {
  switch (status) {
    case 'In Transit': return t.inTransit;
    case 'Delivered': return t.delivered;
    case 'Customs': return t.customs;
    case 'Cancelled': return t.cancelled;
    default: return t.booked;
  }
};
