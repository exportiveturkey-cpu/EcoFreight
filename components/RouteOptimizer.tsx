import React, { useState, useEffect, useMemo } from 'react';
import {
  Ship,
  Train,
  Truck,
  Plane,
  Layers,
  Fuel,
  Leaf,
  Anchor,
  ArrowRight,
  Loader2,
  CheckCircle2,
  TrendingDown,
  Lock,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  BookOpenCheck,
  Clock,
  Gauge,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { CiiGrade, RouteCostOption, Shipment, ShipmentStatus, SpeedProfile, TransportMode, VesselType } from '../types';
import {
  CARBON_PRICE_PRESETS,
  DEFAULT_ECO_SLOW_STEAMING_PCT,
  DEFAULT_EU_ETS_CARBON_PRICE,
  DEFAULT_PORT_DWELL_HOURS,
  DWELL_TIME_PRESETS,
  FUEL_EU_2026_LIMIT_G_PER_MJ,
  LINER_SERVICE_LINES,
  LINER_VESSEL_TYPES,
  SCHEDULE_SLA_TARGET_PCT,
  SLOW_STEAMING_TIERS,
  TRAMP_VESSEL_TYPES,
  VESSEL_TYPE_SPECS,
  applySlowSteamingToRoute,
  applySpeedProfileToRoute,
  buildDeterministicRouteOptions,
  calculateCO2Cost,
  calculateTeuKm,
  computeApplicablePortFee,
  computeCarbonAwareTradeOff,
  computeDwellImpact,
  computeModeScheduleReliability,
  computeRouteTripAccounting,
  estimatePortFees,
  estimateTeuFromCargo,
  getBaselineVesselSpeedKts,
  getEffectiveVesselCompliance,
  getGlecFactorSpec,
  getVesselTypeSpec,
  isMaritimeRouteMode,
  matchLinerLineForCorridor
} from '../services/carbon';
import { getRouteComparison } from '../services/gemini';
import { formatEUR, formatNumber, formatEmissions } from '../services/formatters';
import { Language, translations } from '../services/i18n';
import GlecMethodPanel from './GlecMethodPanel';

interface RouteOptimizerProps {
  lang: Language;
  isReadOnly?: boolean;
  onBookRoute: (shipment: Shipment) => void;
}

type OptimizationObjective = 'total_cost' | 'fuel_co2' | 'carbon_aware' | 'fastest' | 'reliability';

const CORRIDOR_PRESETS = [
  { label: 'Piraeus, GR → Hamburg, DE', origin: 'Piraeus, GR', destination: 'Hamburg, DE', weight: 12 },
  { label: 'Thessaloniki, GR → Milan, IT', origin: 'Thessaloniki, GR', destination: 'Milan, IT', weight: 8.5 },
  { label: 'Istanbul, TR → Munich, DE', origin: 'Istanbul, TR', destination: 'Munich, DE', weight: 14 },
  { label: 'Rotterdam, NL → Singapore, SG', origin: 'Rotterdam, NL', destination: 'Singapore, SG', weight: 18 }
];

const getModeLabel = (mode: string, t: typeof translations['en']) => {
  switch (mode) {
    case 'SEA_LINER':
      return t.seaLiner;
    case 'SEA_TRAMP':
      return t.seaTramp;
    case 'SEA':
      return t.sea;
    case 'SEA_RAIL':
      return `${t.seaLiner} + ${t.rail}`;
    case 'RAIL':
      return t.rail;
    case 'ROAD':
      return t.road;
    case 'AIR':
      return t.air;
    default:
      return mode;
  }
};

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'SEA_LINER':
    case 'SEA':
      return <Ship size={18} className="text-blue-600" />;
    case 'SEA_TRAMP':
      return <Anchor size={18} className="text-indigo-600" />;
    case 'SEA_RAIL':
      return <Layers size={18} className="text-emerald-600" />;
    case 'RAIL':
      return <Train size={18} className="text-teal-600" />;
    case 'ROAD':
      return <Truck size={18} className="text-amber-600" />;
    case 'AIR':
      return <Plane size={18} className="text-slate-600" />;
    default:
      return <Ship size={18} className="text-slate-600" />;
  }
};

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  lang,
  isReadOnly = false,
  onBookRoute
}) => {
  const t = translations[lang] || translations.en;

  const [origin, setOrigin] = useState('Piraeus, GR');
  const [destination, setDestination] = useState('Hamburg, DE');
  const [weightTonnes, setWeightTonnes] = useState<number>(12);
  const [containersTeu, setContainersTeu] = useState<number>(() => estimateTeuFromCargo(12));
  const [containersEdited, setContainersEdited] = useState(false);
  const [customerName, setCustomerName] = useState('Hellenic Marine Dynamics');

  const initialPorts = estimatePortFees('Piraeus, GR', 'Hamburg, DE', 12);
  const [originPortFee, setOriginPortFee] = useState<number>(initialPorts.originPortFee);
  const [destinationPortFee, setDestinationPortFee] = useState<number>(initialPorts.destinationPortFee);
  const [portFeesEdited, setPortFeesEdited] = useState(false);
  const [applyPortFeeToAllModes, setApplyPortFeeToAllModes] = useState(false);
  const [dwellTimeHours, setDwellTimeHours] = useState<number>(DEFAULT_PORT_DWELL_HOURS);

  const [carbonPricePerTonne, setCarbonPricePerTonne] = useState<number>(DEFAULT_EU_ETS_CARBON_PRICE);
  const [fuelIndexPct, setFuelIndexPct] = useState<number>(100);
  const [slowSteamingPct, setSlowSteamingPct] = useState<number>(0);
  const speedProfile: SpeedProfile = slowSteamingPct > 0 ? 'eco' : 'standard';
  const [costTolerancePct, setCostTolerancePct] = useState<number>(10);
  const [objective, setObjective] = useState<OptimizationObjective>('total_cost');
  const [linerVesselType, setLinerVesselType] = useState<VesselType>('CONTAINER_DEEPSEA');
  const [trampVesselType, setTrampVesselType] = useState<VesselType>('MULTI_PURPOSE_TRAMP');
  const [seaServiceFilter, setSeaServiceFilter] = useState<'ALL' | 'LINER' | 'TRAMP'>('ALL');

  const [rawOptions, setRawOptions] = useState<RouteCostOption[]>(() =>
    buildDeterministicRouteOptions(
      'Piraeus, GR',
      'Hamburg, DE',
      12,
      DEFAULT_EU_ETS_CARBON_PRICE,
      1,
      initialPorts.originPortFee,
      initialPorts.destinationPortFee,
      false,
      estimateTeuFromCargo(12),
      0,
      'CONTAINER_DEEPSEA',
      'MULTI_PURPOSE_TRAMP'
    )
  );
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('SEA_LINER');
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);
  const [showGlecMethod, setShowGlecMethod] = useState(false);

  const runAnalysis = async (
    targetOrigin = origin,
    targetDest = destination,
    targetWeight = weightTonnes,
    targetOriginFee = originPortFee,
    targetDestFee = destinationPortFee,
    targetAllModes = applyPortFeeToAllModes,
    targetContainers = containersTeu,
    targetLinerVessel = linerVesselType,
    targetTrampVessel = trampVesselType
  ) => {
    setLoading(true);
    setBookingConfirmed(null);
    // Fetch clean linehaul baseline (dwellTimeHours = 0) and layer dwell impact reactively in computedOptions
    const options = await getRouteComparison(
      targetOrigin,
      targetDest,
      targetWeight,
      DEFAULT_EU_ETS_CARBON_PRICE,
      1,
      targetOriginFee,
      targetDestFee,
      targetAllModes,
      targetContainers,
      0,
      targetLinerVessel,
      targetTrampVessel
    );
    setRawOptions(options);
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis(
      'Piraeus, GR',
      'Hamburg, DE',
      12,
      initialPorts.originPortFee,
      initialPorts.destinationPortFee,
      false,
      estimateTeuFromCargo(12),
      'CONTAINER_DEEPSEA',
      'MULTI_PURPOSE_TRAMP'
    );
  }, []);

  const handleAutoEstimatePorts = (
    o = origin,
    d = destination,
    w = weightTonnes
  ) => {
    const est = estimatePortFees(o, d, w);
    setOriginPortFee(est.originPortFee);
    setDestinationPortFee(est.destinationPortFee);
    setPortFeesEdited(false);
    return est;
  };

  // Dynamically recompute Standard-speed options whenever inputs/sliders/vessel specs change
  const standardComputedOptions = useMemo(() => {
    const fuelMult = fuelIndexPct / 100;
    return rawOptions.map((opt) => {
      const baseVessel = getVesselTypeSpec(opt.vesselType, opt.mode);
      const activeVesselType: VesselType | undefined =
        opt.mode === 'SEA_TRAMP'
          ? trampVesselType
          : opt.mode === 'SEA_LINER'
            ? linerVesselType
            : opt.mode === 'SEA_RAIL'
              ? linerVesselType === 'RORO_FERRY'
                ? 'RORO_FERRY'
                : 'CONTAINER_FEEDER'
              : opt.vesselType;
      const targetVessel = activeVesselType ? getVesselTypeSpec(activeVesselType, opt.mode) : baseVessel;
      const isSeaSubcategory = opt.mode === 'SEA_LINER' || opt.mode === 'SEA_TRAMP';
      const freightScale = isSeaSubcategory ? targetVessel.freightMult / baseVessel.freightMult : 1;
      const vesselFuelScale = isSeaSubcategory ? targetVessel.fuelMult / baseVessel.fuelMult : 1;
      const wtwScale = isSeaSubcategory && baseVessel.wtw > 0 ? targetVessel.wtw / baseVessel.wtw : 1;
      const speedTimeScale = isSeaSubcategory ? baseVessel.defaultSpeedKts / targetVessel.defaultSpeedKts : 1;

      const baseFreightCost = Math.round(opt.baseFreightCost * freightScale);
      const adjustedFuel = Math.round(opt.fuelCost * vesselFuelScale * fuelMult);
      const baseLinehaulEmissionsKg =
        opt.linehaulEmissionsKg ?? Math.max(0, opt.estimatedEmissionsKg - (opt.dwellEmissionsKg ?? 0));
      const linehaulEmissionsKg = Math.round(baseLinehaulEmissionsKg * wtwScale);
      const spec = getGlecFactorSpec(opt.mode, activeVesselType);
      const ratioTtw = spec.wtw > 0 ? spec.ttw / spec.wtw : 0.75;
      const linehaulTtwKg = Math.round(linehaulEmissionsKg * ratioTtw);
      const linehaulWttKg = Math.max(0, Math.round(linehaulEmissionsKg - linehaulTtwKg));

      const effectiveContainers = Math.max(0.5, Number(containersTeu) || 1);
      const dwell = computeDwellImpact(
        opt.mode,
        dwellTimeHours,
        effectiveContainers,
        carbonPricePerTonne,
        fuelMult,
        applyPortFeeToAllModes
      );

      const co2Cost = calculateCO2Cost(linehaulEmissionsKg, carbonPricePerTonne);
      const fuelPlusCo2Cost = adjustedFuel + co2Cost;
      const portFeeTotal = computeApplicablePortFee(
        opt.mode,
        originPortFee,
        destinationPortFee,
        applyPortFeeToAllModes
      );
      const estimatedCost = baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwell.dwellCost;
      const estimatedEmissionsKg = linehaulEmissionsKg + dwell.dwellEmissionsKg;
      const ttwEmissionsKg = linehaulTtwKg + dwell.dwellTtwKg;
      const wttEmissionsKg = linehaulWttKg + dwell.dwellWttKg;
      const rawLinehaulDays = opt.dwellDaysAdded
        ? Math.max(1, Number((opt.estimatedDays - opt.dwellDaysAdded).toFixed(1)))
        : opt.estimatedDays;
      const scaledLinehaulDays = Number((rawLinehaulDays * speedTimeScale).toFixed(1));
      const estimatedDays = Number((scaledLinehaulDays + dwell.dwellDaysAdded).toFixed(1));
      const teuKm = calculateTeuKm(opt.estimatedDistanceKm, effectiveContainers);
      const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
      const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
      const rel = computeModeScheduleReliability(opt.mode, dwellTimeHours, applyPortFeeToAllModes, activeVesselType);
      const ballastFactor = 1 + (opt.ballastPct ?? (opt.mode === 'SEA_TRAMP' ? 12 : 0)) / 100;
      const isLinerService = opt.mode === 'SEA_LINER' || opt.mode === 'SEA_RAIL';
      const activeLinerLine = isLinerService
        ? matchLinerLineForCorridor(origin, destination, activeVesselType)
        : undefined;
      const etaTolerance =
        opt.mode === 'SEA_LINER'
          ? (activeLinerLine?.etaToleranceHours ?? 2.5)
          : opt.mode === 'SEA_RAIL'
            ? 4
            : opt.mode === 'SEA_TRAMP'
              ? 28
              : undefined;
      const predictableEtaWindow =
        opt.mode === 'SEA_LINER' && activeLinerLine
          ? `Fixed ${estimatedDays}d (±${activeLinerLine.etaToleranceHours}h)`
          : opt.mode === 'SEA_RAIL'
            ? `Fixed ${estimatedDays}d (±4h)`
            : opt.mode === 'SEA_TRAMP'
              ? `Unscheduled ${estimatedDays}d (±24–36h)`
              : opt.predictableEtaWindow;

      return {
        ...opt,
        seaServiceType:
          opt.seaServiceType ??
          (opt.mode === 'SEA_TRAMP'
            ? 'TRAMP'
            : opt.mode === 'SEA_LINER' || opt.mode === 'SEA_RAIL'
              ? 'LINER'
              : undefined),
        vesselType: activeVesselType,
        linerLineCode: activeLinerLine?.lineCode ?? opt.linerLineCode,
        linerLineName: activeLinerLine?.lineName ?? opt.linerLineName,
        fixedDepartureUtc: isLinerService ? (activeLinerLine?.departureWindowUtc ?? opt.fixedDepartureUtc) : undefined,
        predictableEtaWindow,
        etaConfidenceHours: etaTolerance,
        publishedEmissionGPerTeuKm: isLinerService
          ? Number((spec.wtw * 980).toFixed(1))
          : undefined,
        publishedEmissionMethod: isLinerService ? (activeLinerLine?.publicationStandard ?? opt.publishedEmissionMethod) : undefined,
        vesselSpeedKnots: isMaritimeRouteMode(opt.mode)
          ? getBaselineVesselSpeedKts(opt.mode, activeVesselType)
          : opt.vesselSpeedKnots,
        label:
          opt.mode === 'SEA_LINER' && activeLinerLine
            ? `${activeLinerLine.lineCode} · ${t.linerServiceLabel} (${targetVessel.capacityLabel})`
            : opt.mode === 'SEA_TRAMP'
              ? `${t.trampServiceLabel} · ${targetVessel.capacityLabel}`
              : opt.label,
        speedProfile: 'standard' as SpeedProfile,
        estimatedDays,
        dwellHours: dwell.dwellHours,
        dwellDaysAdded: dwell.dwellDaysAdded,
        scheduleReliabilityPct: rel.scheduleReliabilityPct,
        baselineReliabilityPct: rel.baselineReliabilityPct,
        containers: effectiveContainers,
        teuKm,
        costPerTeuKm,
        emissionsPerTeuKm,
        glecFactorWtw: Number((spec.wtw * (isSeaSubcategory ? ballastFactor : 1)).toFixed(4)),
        ttwEmissionsKg,
        wttEmissionsKg,
        linehaulEmissionsKg,
        dwellEmissionsKg: dwell.dwellEmissionsKg,
        glecSource: spec.tocSource,
        baseFreightCost,
        fuelCost: adjustedFuel,
        co2Cost,
        fuelPlusCo2Cost,
        originPortFee,
        destinationPortFee,
        portFeeTotal,
        dwellCost: dwell.dwellCost,
        estimatedCost,
        estimatedEmissionsKg
      };
    });
  }, [
    rawOptions,
    origin,
    destination,
    carbonPricePerTonne,
    fuelIndexPct,
    originPortFee,
    destinationPortFee,
    applyPortFeeToAllModes,
    containersTeu,
    dwellTimeHours,
    linerVesselType,
    trampVesselType,
    t
  ]);

  const filteredStandardOptions = useMemo(() => {
    if (seaServiceFilter === 'ALL') return standardComputedOptions;
    if (seaServiceFilter === 'LINER') {
      return standardComputedOptions.filter((o) => o.mode !== 'SEA_TRAMP');
    }
    return standardComputedOptions.filter((o) => o.mode !== 'SEA_LINER' && o.mode !== 'SEA_RAIL');
  }, [standardComputedOptions, seaServiceFilter]);

  const ecoComputedOptions = useMemo(
    () =>
      filteredStandardOptions.map((opt) =>
        applySpeedProfileToRoute(opt, 'eco', carbonPricePerTonne)
      ),
    [filteredStandardOptions, carbonPricePerTonne]
  );

  const activeSpeedComputedOptions = useMemo(
    () =>
      filteredStandardOptions.map((opt) =>
        applySlowSteamingToRoute(opt, slowSteamingPct, carbonPricePerTonne)
      ),
    [filteredStandardOptions, slowSteamingPct, carbonPricePerTonne]
  );

  const activeSpeedAllOptions = useMemo(
    () =>
      standardComputedOptions.map((opt) =>
        applySlowSteamingToRoute(opt, slowSteamingPct, carbonPricePerTonne)
      ),
    [standardComputedOptions, slowSteamingPct, carbonPricePerTonne]
  );

  const linerComparisonRoute = useMemo(
    () => activeSpeedAllOptions.find((o) => o.mode === 'SEA_LINER') || null,
    [activeSpeedAllOptions]
  );
  const trampComparisonRoute = useMemo(
    () => activeSpeedAllOptions.find((o) => o.mode === 'SEA_TRAMP') || null,
    [activeSpeedAllOptions]
  );

  const carbonAwareTradeOff = useMemo(
    () => computeCarbonAwareTradeOff(filteredStandardOptions, carbonPricePerTonne, costTolerancePct),
    [filteredStandardOptions, carbonPricePerTonne, costTolerancePct]
  );

  const computedOptions = useMemo(() => {
    const baselineMaxCost = carbonAwareTradeOff
      ? carbonAwareTradeOff.baselineRoute.estimatedCost * (1 + costTolerancePct / 100)
      : Infinity;

    const enriched = activeSpeedComputedOptions.map((opt) => ({
      ...opt,
      eexiCii: isMaritimeRouteMode(opt.mode)
        ? getEffectiveVesselCompliance(opt.vesselType, opt.slowSteamingPct ?? 0, opt.mode)
        : undefined,
      tripAccounting: computeRouteTripAccounting(opt, carbonPricePerTonne, weightTonnes)
    }));

    return enriched.sort((a, b) => {
      if (objective === 'fuel_co2') return a.fuelPlusCo2Cost - b.fuelPlusCo2Cost;
      if (objective === 'fastest') return a.estimatedDays - b.estimatedDays;
      if (objective === 'reliability') return (b.scheduleReliabilityPct ?? 0) - (a.scheduleReliabilityPct ?? 0);
      if (objective === 'carbon_aware') {
        const aInBudget = a.estimatedCost <= baselineMaxCost ? 0 : 1;
        const bInBudget = b.estimatedCost <= baselineMaxCost ? 0 : 1;
        if (aInBudget !== bInBudget) return aInBudget - bInBudget;
        return a.estimatedEmissionsKg - b.estimatedEmissionsKg;
      }
      return a.estimatedCost - b.estimatedCost;
    });
  }, [activeSpeedComputedOptions, objective, carbonAwareTradeOff, costTolerancePct, carbonPricePerTonne, weightTonnes]);

  const optimalRoute = computedOptions[0];
  const selectedRoute =
    computedOptions.find((o) => o.mode === selectedMode) || optimalRoute;
  const roadBaseline =
    computedOptions.find((o) => o.mode === 'ROAD') ||
    computedOptions[computedOptions.length - 1];

  useEffect(() => {
    if (optimalRoute) {
      setSelectedMode(optimalRoute.mode);
    }
  }, [optimalRoute?.mode, objective, seaServiceFilter]);

  const roadSavingsEur =
    roadBaseline && optimalRoute
      ? roadBaseline.estimatedCost - optimalRoute.estimatedCost
      : 0;
  const roadFuelCo2SavingsEur =
    roadBaseline && optimalRoute
      ? roadBaseline.fuelPlusCo2Cost - optimalRoute.fuelPlusCo2Cost
      : 0;
  const roadSavingsPct =
    roadBaseline && roadBaseline.estimatedCost > 0
      ? Math.round((roadSavingsEur / roadBaseline.estimatedCost) * 100)
      : 0;
  const avoidedEmissionsKg =
    roadBaseline && optimalRoute
      ? Math.max(0, roadBaseline.estimatedEmissionsKg - optimalRoute.estimatedEmissionsKg)
      : 0;

  const scatterData = useMemo(() => {
    return {
      standard: filteredStandardOptions.map((opt) => ({
        name: `${getModeLabel(opt.mode, t)} (${t.standardSpeed})`,
        mode: getModeLabel(opt.mode, t),
        cost: opt.estimatedCost,
        co2: opt.estimatedEmissionsKg,
        days: opt.estimatedDays,
        speed: t.standardSpeed
      })),
      eco: ecoComputedOptions.map((opt) => ({
        name: `${getModeLabel(opt.mode, t)} (${t.ecoSpeedLabel})`,
        mode: getModeLabel(opt.mode, t),
        cost: opt.estimatedCost,
        co2: opt.estimatedEmissionsKg,
        days: opt.estimatedDays,
        speed: t.ecoSpeedLabel
      }))
    };
  }, [filteredStandardOptions, ecoComputedOptions, t]);

  const handleApplyCarbonAware = () => {
    if (!carbonAwareTradeOff) return;
    const rec = carbonAwareTradeOff.recommendedRoute;
    setSlowSteamingPct(rec.speedProfile === 'eco' ? DEFAULT_ECO_SLOW_STEAMING_PCT : 0);
    setObjective('carbon_aware');
    setSelectedMode(rec.mode);
  };

  const isCarbonAwareActive =
    !!carbonAwareTradeOff &&
    selectedRoute?.mode === carbonAwareTradeOff.recommendedRoute.mode &&
    speedProfile === (carbonAwareTradeOff.recommendedRoute.speedProfile ?? 'standard');

  // Maritime Slow Steaming analysis for active maritime corridor (SEA_LINER, SEA_TRAMP, SEA_RAIL)
  const slowSteamingAnalysis = useMemo(() => {
    const targetMode = isMaritimeRouteMode(selectedMode)
      ? selectedMode
      : seaServiceFilter === 'TRAMP'
        ? 'SEA_TRAMP'
        : 'SEA_LINER';
    const baseOption =
      standardComputedOptions.find((o) => o.mode === targetMode) ||
      standardComputedOptions.find((o) => isMaritimeRouteMode(o.mode)) ||
      standardComputedOptions[0];
    if (!baseOption) return null;

    const activeBaseKts = getBaselineVesselSpeedKts(baseOption.mode, baseOption.vesselType);
    const activeSlow = applySlowSteamingToRoute(baseOption, slowSteamingPct, carbonPricePerTonne);
    const previewPct = slowSteamingPct > 0 ? slowSteamingPct : DEFAULT_ECO_SLOW_STEAMING_PCT;
    const previewOption = applySlowSteamingToRoute(baseOption, previewPct, carbonPricePerTonne);
    const tiers = SLOW_STEAMING_TIERS.map((tier) => {
      const calc = applySlowSteamingToRoute(baseOption, tier.pct, carbonPricePerTonne);
      const tierKnots = Number((activeBaseKts * (1 - tier.pct / 100)).toFixed(1));
      return {
        pct: tier.pct,
        knots: tierKnots,
        label: tier.pct === 0 ? `0% (${tierKnots} kts)` : `-${tier.pct}% (${tierKnots} kts)`,
        fuelSavedEur: calc.fuelSavedEur ?? 0,
        co2SavedEur: calc.co2SavedEur ?? 0,
        fuelSavedUnits: calc.fuelSavedUnits ?? 0,
        co2SavedKg: calc.co2SavedKg ?? 0,
        fuelPlusCo2SavedEur: calc.fuelPlusCo2SavedEur ?? 0,
        addedDays: Number((calc.estimatedDays - baseOption.estimatedDays).toFixed(1)),
        estimatedCost: calc.estimatedCost
      };
    });

    return {
      baseOption,
      activeBaseKts,
      activeSlow,
      previewOption,
      previewPct,
      tiers
    };
  }, [standardComputedOptions, selectedMode, seaServiceFilter, slowSteamingPct, carbonPricePerTonne]);

  const chartData = useMemo(
    () =>
      computedOptions.map((opt) => ({
        name: getModeLabel(opt.mode, t),
        mode: opt.mode,
        [t.baseFreight]: opt.baseFreightCost,
        [t.fuelCost]: opt.fuelCost,
        [t.co2Cost]: opt.co2Cost,
        [t.portFees]: opt.portFeeTotal,
        [t.dwellCost]: opt.dwellCost ?? 0
      })),
    [computedOptions, t]
  );

  const handleApplyPreset = (preset: typeof CORRIDOR_PRESETS[0]) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setWeightTonnes(preset.weight);
    const estTeu = estimateTeuFromCargo(preset.weight);
    setContainersTeu(estTeu);
    setContainersEdited(false);
    const est = handleAutoEstimatePorts(preset.origin, preset.destination, preset.weight);
    runAnalysis(
      preset.origin,
      preset.destination,
      preset.weight,
      est.originPortFee,
      est.destinationPortFee,
      applyPortFeeToAllModes,
      estTeu
    );
  };

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (!portFeesEdited) {
      const est = estimatePortFees(val, destination, weightTonnes);
      setOriginPortFee(est.originPortFee);
      setDestinationPortFee(est.destinationPortFee);
    }
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (!portFeesEdited) {
      const est = estimatePortFees(origin, val, weightTonnes);
      setOriginPortFee(est.originPortFee);
      setDestinationPortFee(est.destinationPortFee);
    }
  };

  const handleWeightChange = (val: number) => {
    const safeW = Math.max(0.5, val || 1);
    setWeightTonnes(safeW);
    if (!containersEdited) {
      setContainersTeu(estimateTeuFromCargo(safeW));
    }
    if (!portFeesEdited) {
      const est = estimatePortFees(origin, destination, safeW);
      setOriginPortFee(est.originPortFee);
      setDestinationPortFee(est.destinationPortFee);
    }
  };

  const handleBookSelected = () => {
    if (!selectedRoute || isReadOnly) return;
    const mappedMode: TransportMode =
      selectedRoute.mode === 'SEA_RAIL' ||
      selectedRoute.mode === 'SEA_LINER' ||
      selectedRoute.mode === 'SEA_TRAMP'
        ? TransportMode.SEA
        : (selectedRoute.mode as TransportMode);

    const legs =
      selectedRoute.mode === 'SEA_RAIL'
        ? [
            {
              id: 'L1',
              mode: TransportMode.SEA,
              seaServiceType: selectedRoute.seaServiceType ?? 'LINER',
              vesselType: selectedRoute.vesselType,
              origin,
              destination: 'Intermodal Rail Port Hub',
              distanceKm: Math.round(selectedRoute.estimatedDistanceKm * 0.55),
              cost: Math.round(selectedRoute.estimatedCost * 0.52),
              emissionsKg: Math.round(selectedRoute.estimatedEmissionsKg * 0.42)
            },
            {
              id: 'L2',
              mode: TransportMode.RAIL,
              origin: 'Intermodal Rail Port Hub',
              destination,
              distanceKm: Math.round(selectedRoute.estimatedDistanceKm * 0.45),
              cost: Math.round(selectedRoute.estimatedCost * 0.48),
              emissionsKg: Math.round(selectedRoute.estimatedEmissionsKg * 0.58)
            }
          ]
        : [
            {
              id: 'L1',
              mode: mappedMode,
              seaServiceType: selectedRoute.seaServiceType,
              vesselType: selectedRoute.vesselType,
              origin,
              destination,
              distanceKm: selectedRoute.estimatedDistanceKm,
              cost: selectedRoute.estimatedCost,
              emissionsKg: selectedRoute.estimatedEmissionsKg
            }
          ];

    const newShipment: Shipment = {
      id: `SH-${Math.floor(1000 + Math.random() * 8999)}`,
      customerName: customerName.trim() || 'EcoFreight Corporate Client',
      origin,
      destination,
      cargoType: 'Optimized Multimodal Freight',
      incoterms: 'CIF',
      weightTonnes,
      volumeCbm: parseFloat((weightTonnes * 2.4).toFixed(1)),
      containers: containersTeu,
      seaServiceType: selectedRoute.seaServiceType,
      vesselType: selectedRoute.vesselType,
      linerLineCode: selectedRoute.linerLineCode,
      linerLineName: selectedRoute.linerLineName,
      fixedDepartureUtc: selectedRoute.fixedDepartureUtc,
      predictableEtaWindow: selectedRoute.predictableEtaWindow,
      etaConfidenceHours: selectedRoute.etaConfidenceHours,
      publishedEmissionGPerTeuKm: selectedRoute.publishedEmissionGPerTeuKm,
      dwellTimeHours: selectedRoute.dwellHours ?? dwellTimeHours,
      scheduleDelayHours: selectedRoute.dwellHours ? Math.round((selectedRoute.dwellHours ?? 0) * 0.25) : 0,
      scheduleReliabilityPct: selectedRoute.scheduleReliabilityPct,
      speedProfile,
      slowSteamingPct,
      status: ShipmentStatus.BOOKED,
      legs,
      costBreakdown: {
        freight: selectedRoute.baseFreightCost,
        fuelSurcharge: selectedRoute.fuelCost,
        carbonCost: selectedRoute.co2Cost,
        portFees: selectedRoute.portFeeTotal,
        dwellCost: selectedRoute.dwellCost ?? 0,
        insurance: 0,
        customs: 0
      },
      totalCost: selectedRoute.estimatedCost,
      totalEmissionsKg: selectedRoute.estimatedEmissionsKg,
      eexiCii: selectedRoute.eexiCii,
      tripAccounting: selectedRoute.tripAccounting,
      trackingHistory: [
        {
          status: 'Booked',
          location: origin,
          timestamp: new Date().toISOString(),
          description: `Optimized via ${getModeLabel(selectedRoute.mode, t)}${selectedRoute.vesselType ? ` (${t[getVesselTypeSpec(selectedRoute.vesselType).labelKey]})` : ''} · ${t.fuelCost}: ${formatEUR(selectedRoute.fuelCost, 0)} · ${t.co2Cost}: ${formatEUR(selectedRoute.co2Cost, 0)} · ${t.portFees}: ${formatEUR(selectedRoute.portFeeTotal, 0)}`
        }
      ],
      createdAt: new Date().toISOString()
    };

    onBookRoute(newShipment);
    setBookingConfirmed(newShipment.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.routeOptimizerTitle}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {t.routeOptimizerSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium whitespace-nowrap">
          <span>GLEC v3.0</span>
          <span aria-hidden="true">·</span>
          <span>EU ETS</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-800 font-semibold">
            CO2: {formatEUR(carbonPricePerTonne, 0)}/t
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-indigo-700 font-semibold">
            {t.portFees}: {formatEUR(originPortFee + destinationPortFee, 0)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-rose-700 font-semibold">
            {dwellTimeHours}h
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-800 font-semibold">
            {containersTeu} TEU
          </span>
          <button
            type="button"
            onClick={() => setShowGlecMethod((v) => !v)}
            className={`ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              showGlecMethod
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <BookOpenCheck size={14} />
            <span>{t.glecMethodBtn}</span>
          </button>
        </div>
      </div>

      {showGlecMethod && selectedRoute && (
        <GlecMethodPanel
          lang={lang}
          highlightMode={selectedRoute.mode}
          onClose={() => setShowGlecMethod(false)}
          liveExample={{
            label: getModeLabel(selectedRoute.mode, t),
            mode: selectedRoute.mode,
            vesselType: selectedRoute.vesselType,
            distanceKm: selectedRoute.estimatedDistanceKm,
            weightTonnes,
            ttwKg: selectedRoute.ttwEmissionsKg ?? 0,
            wttKg: selectedRoute.wttEmissionsKg ?? 0,
            totalKg: selectedRoute.estimatedEmissionsKg,
            dwellHours: selectedRoute.dwellHours ?? 0,
            dwellKg: selectedRoute.dwellEmissionsKg ?? 0,
            linehaulKg: selectedRoute.linehaulEmissionsKg ?? selectedRoute.estimatedEmissionsKg
          }}
        />
      )}

      {/* Corridor, Port Fees & Cost Sensitivity Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {/* Preset Corridors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            {t.corridorPresets}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {CORRIDOR_PRESETS.map((preset) => {
              const active = origin === preset.origin && destination === preset.destination;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Route & Cargo Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.origin}
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.destination}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.weight}
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={weightTonnes}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.containersTeu}
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={containersTeu}
              onChange={(e) => {
                setContainersEdited(true);
                setContainersTeu(Math.max(0.5, parseFloat(e.target.value) || 1));
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {t.customer}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{t.runCostOptimization}</span>
            </button>
          </div>
        </div>

        {/* Port Fees & Dwell Time Row */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Anchor size={14} className="text-indigo-600" />
                <span>{t.originPortFee}</span>
              </label>
              <input
                type="number"
                min={0}
                step={10}
                value={originPortFee}
                onChange={(e) => {
                  setPortFeesEdited(true);
                  setOriginPortFee(Math.max(0, Number(e.target.value) || 0));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div className="lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Anchor size={14} className="text-indigo-600" />
                <span>{t.destinationPortFee}</span>
              </label>
              <input
                type="number"
                min={0}
                step={10}
                value={destinationPortFee}
                onChange={(e) => {
                  setPortFeesEdited(true);
                  setDestinationPortFee(Math.max(0, Number(e.target.value) || 0));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => handleAutoEstimatePorts()}
                className="w-full py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RotateCcw size={13} />
                <span>{t.autoEstimatePorts}</span>
              </button>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center gap-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyPortFeeToAllModes}
                  onChange={(e) => setApplyPortFeeToAllModes(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  {t.applyTerminalFeesAllModes}
                </span>
              </label>
              <span className="text-[11px] text-slate-500 pl-6">
                {t.portFeesActiveNote}
              </span>
            </div>
          </div>

          {/* Port Dwell Time Control Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-4 border-t border-slate-100">
            <div className="lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-rose-600" />
                <span>{t.dwellTimeHours}</span>
              </label>
              <input
                type="number"
                min={0}
                step={6}
                value={dwellTimeHours}
                onChange={(e) => setDwellTimeHours(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
            <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5 pt-4 lg:pt-0">
              {DWELL_TIME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDwellTimeHours(preset.hours)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                    dwellTimeHours === preset.hours
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t[preset.key]}
                </button>
              ))}
            </div>
            <div className="lg:col-span-4 text-xs font-mono tabular-nums text-slate-600 flex flex-col lg:items-end">
              {selectedRoute && (
                <span className="font-semibold text-rose-700">
                  {t.dwellImpactLabel} ({getModeLabel(selectedRoute.mode, t)}): +{formatEUR(selectedRoute.dwellCost ?? 0, 0)} · +{formatNumber(selectedRoute.dwellEmissionsKg ?? 0)} kg CO2e · +{selectedRoute.dwellDaysAdded ?? 0}d
                </span>
              )}
              <span className="text-[11px] font-sans text-slate-500 mt-0.5">{t.dwellNote}</span>
            </div>
          </div>

          {/* Vessel & Sea Service Subcategories Row (Liner vs. Tramp) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-4 border-t border-slate-100">
            <div className="lg:col-span-4 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Ship size={14} className="text-blue-600" />
                <span>{t.linerVesselTypeLabel}</span>
              </label>
              <select
                value={linerVesselType}
                onChange={(e) => setLinerVesselType(e.target.value as VesselType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                {LINER_VESSEL_TYPES.map((vt) => {
                  const spec = VESSEL_TYPE_SPECS[vt];
                  return (
                    <option key={vt} value={vt}>
                      {t[spec.labelKey]} · {spec.defaultSpeedKts} kts · {spec.wtw.toFixed(3)} kg/t·km
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="lg:col-span-4 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Anchor size={14} className="text-indigo-600" />
                <span>{t.trampVesselTypeLabel}</span>
              </label>
              <select
                value={trampVesselType}
                onChange={(e) => setTrampVesselType(e.target.value as VesselType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {TRAMP_VESSEL_TYPES.map((vt) => {
                  const spec = VESSEL_TYPE_SPECS[vt];
                  return (
                    <option key={vt} value={vt}>
                      {t[spec.labelKey]} · {spec.defaultSpeedKts} kts · {spec.wtw.toFixed(3)} kg/t·km
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="lg:col-span-4 space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                {t.seaServiceSubcategories}
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                {([
                  ['ALL', t.seaFilterAll],
                  ['LINER', t.seaFilterLiner],
                  ['TRAMP', t.seaFilterTramp]
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSeaServiceFilter(key)}
                    className={`px-2 py-2 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap truncate ${
                      seaServiceFilter === key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Fuel + Carbon Sensitivity Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 border-t border-slate-100">
          {/* Carbon Price Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-600" />
                {t.carbonPriceLabel}
              </label>
              <span className="text-sm font-bold font-mono tabular-nums text-emerald-700">
                {formatEUR(carbonPricePerTonne, 0)} / t
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={250}
              step={5}
              value={carbonPricePerTonne}
              onChange={(e) => setCarbonPricePerTonne(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {CARBON_PRICE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCarbonPricePerTonne(p.price)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    carbonPricePerTonne === p.price
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label} ({formatEUR(p.price, 0)})
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Price Index Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Fuel size={14} className="text-amber-600" />
                {t.fuelIndexLabel}
              </label>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                {fuelIndexPct}%
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={160}
              step={5}
              value={fuelIndexPct}
              onChange={(e) => setFuelIndexPct(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>70% (Low Bunker)</span>
              <span>100% (Baseline)</span>
              <span>160% (Fuel Spike)</span>
            </div>
            {/* Slow Steaming Speed Reduction Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Gauge size={14} className="text-emerald-600" />
                  {t.slowSteamingSpeedReduction}
                </label>
                <span className="text-[11px] font-mono tabular-nums font-bold text-emerald-700">
                  {Number(((slowSteamingAnalysis?.activeBaseKts ?? 20.0) * (1 - slowSteamingPct / 100)).toFixed(1))} kts
                  {slowSteamingPct > 0 ? ` (-${slowSteamingPct}%)` : ''}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-lg">
                {SLOW_STEAMING_TIERS.map((tier) => (
                  <button
                    key={tier.pct}
                    type="button"
                    onClick={() => setSlowSteamingPct(tier.pct)}
                    className={`px-1.5 py-1.5 rounded-md text-[11px] font-mono tabular-nums font-bold transition-colors whitespace-nowrap ${
                      slowSteamingPct === tier.pct
                        ? tier.pct === 0
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier.pct === 0 ? '0%' : `-${tier.pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optimization Priority Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-slate-600" />
              {t.optimizePriority}
            </label>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setObjective('total_cost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap truncate ${
                  objective === 'total_cost'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.priorityTotalCost}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (carbonAwareTradeOff) {
                    handleApplyCarbonAware();
                  } else {
                    setObjective('carbon_aware');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap truncate ${
                  objective === 'carbon_aware'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {t.priorityCarbonAware}
              </button>
              <button
                type="button"
                onClick={() => setObjective('fuel_co2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap truncate ${
                  objective === 'fuel_co2'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.priorityFuelCo2}
              </button>
              <button
                type="button"
                onClick={() => setObjective('fastest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap truncate ${
                  objective === 'fastest'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.priorityFastest}
              </button>
              <button
                type="button"
                onClick={() => setObjective('reliability')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors whitespace-nowrap truncate ${
                  objective === 'reliability'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.priorityReliability}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Route Summary Strip (4 KPI Blocks) */}
      {optimalRoute && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t.optimalChoice}</span>
              <span className="font-mono tabular-nums">{optimalRoute.estimatedDays} {t.days}</span>
            </div>
            <div className="mt-3">
              <p className="text-xl font-extrabold tracking-tight">{getModeLabel(optimalRoute.mode, t)}</p>
              <p className="text-xs text-slate-300 mt-1">{optimalRoute.label}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono tabular-nums">
                {t.portFees}: {formatEUR(optimalRoute.portFeeTotal, 0)} · {t.dwellCost}: {formatEUR(optimalRoute.dwellCost ?? 0, 0)}
              </span>
              <span className="text-lg font-extrabold font-mono tabular-nums text-emerald-400">
                {formatEUR(optimalRoute.estimatedCost, 0)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t.fuelPlusCo2}</span>
              <Fuel size={16} className="text-amber-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                {formatEUR(optimalRoute.fuelPlusCo2Cost, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                {t.fuelCost}: {formatEUR(optimalRoute.fuelCost, 0)} · {t.co2Cost}: {formatEUR(optimalRoute.co2Cost, 0)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono tabular-nums">
              {formatNumber(optimalRoute.fuelConsumption)} {optimalRoute.fuelUnit}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t.savingsVsRoad}</span>
              <TrendingDown size={16} className="text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700">
                {roadSavingsEur >= 0 ? `-${formatEUR(roadSavingsEur, 0)}` : `+${formatEUR(Math.abs(roadSavingsEur), 0)}`}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                {t.fuelPlusCo2}: {roadFuelCo2SavingsEur >= 0 ? `-${formatEUR(roadFuelCo2SavingsEur, 0)}` : `+${formatEUR(Math.abs(roadFuelCo2SavingsEur), 0)}`} ({roadSavingsPct}%)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono tabular-nums">
              Road Baseline: {formatEUR(roadBaseline?.estimatedCost || 0, 0)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t.teuKm} ({t.teuKmFormula})</span>
              <Leaf size={16} className="text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                {formatNumber(optimalRoute.teuKm)} <span className="text-sm font-bold text-slate-500">TEU-km</span>
              </p>
              <p className="text-xs text-emerald-700 mt-1 font-mono tabular-nums font-semibold">
                {formatEmissions(optimalRoute.estimatedEmissionsKg)} (-{formatEmissions(avoidedEmissionsKg)} vs. Road)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
              <span>{formatEUR(optimalRoute.costPerTeuKm, 2)}/TEU-km</span>
              <span>{optimalRoute.emissionsPerTeuKm.toFixed(2)} kg/TEU-km</span>
            </div>
          </div>
        </div>
      )}

      {/* Liner vs. Tramp Maritime Operating Logic Comparison Panel */}
      {linerComparisonRoute && trampComparisonRoute && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t.serviceLogicTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.seaLiner} ({t[getVesselTypeSpec(linerVesselType).labelKey]}) vs. {t.seaTramp} ({t[getVesselTypeSpec(trampVesselType).labelKey]})
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600">
              {t.seaLiner} vs {t.seaTramp}:{' '}
              <strong className={trampComparisonRoute.estimatedCost < linerComparisonRoute.estimatedCost ? 'text-indigo-700' : 'text-blue-700'}>
                {trampComparisonRoute.estimatedCost < linerComparisonRoute.estimatedCost
                  ? `${t.seaTramp} -${formatEUR(linerComparisonRoute.estimatedCost - trampComparisonRoute.estimatedCost, 0)}`
                  : `${t.seaLiner} -${formatEUR(trampComparisonRoute.estimatedCost - linerComparisonRoute.estimatedCost, 0)}`}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div
              onClick={() => {
                if (seaServiceFilter === 'TRAMP') setSeaServiceFilter('ALL');
                setSelectedMode('SEA_LINER');
              }}
              className={`cursor-pointer rounded-xl p-4 border transition-colors ${
                selectedRoute?.mode === 'SEA_LINER'
                  ? 'border-blue-500 bg-blue-50/40'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Ship size={16} className="text-blue-600" />
                  <span className="text-sm font-extrabold text-slate-900">
                    {t.linerServiceLabel} {linerComparisonRoute.linerLineCode ? `· ${linerComparisonRoute.linerLineCode}` : ''}
                  </span>
                </div>
                <span className="text-sm font-extrabold font-mono tabular-nums text-blue-700">
                  {formatEUR(linerComparisonRoute.estimatedCost, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.linerLogicSummary}
                {linerComparisonRoute.fixedDepartureUtc ? ` · ${linerComparisonRoute.fixedDepartureUtc} · ${linerComparisonRoute.predictableEtaWindow}` : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200/70 text-[11px] font-mono tabular-nums">
                <div>
                  <span className="text-slate-400 font-sans block">{t.pricingModelLabel}</span>
                  <span className="font-bold text-slate-800">{formatEUR(linerComparisonRoute.baseFreightCost, 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.predictableEtaLabel}</span>
                  <span className="font-bold text-blue-700">±{linerComparisonRoute.etaConfidenceHours ?? 2}h ({linerComparisonRoute.fixedDepartureUtc ?? 'Weekly'})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.publishedIntensityCol}</span>
                  <span className="font-bold text-emerald-700">{linerComparisonRoute.publishedEmissionGPerTeuKm ?? 11.8} g/TEU-km</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.reliabilityBaselineLabel}</span>
                  <span className="font-bold text-teal-700">{(linerComparisonRoute.scheduleReliabilityPct ?? 90).toFixed(1)}% · {linerComparisonRoute.vesselSpeedKnots ?? 20} kts</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                if (seaServiceFilter === 'LINER') setSeaServiceFilter('ALL');
                setSelectedMode('SEA_TRAMP');
              }}
              className={`cursor-pointer rounded-xl p-4 border transition-colors ${
                selectedRoute?.mode === 'SEA_TRAMP'
                  ? 'border-indigo-500 bg-indigo-50/40'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Anchor size={16} className="text-indigo-600" />
                  <span className="text-sm font-extrabold text-slate-900">{t.trampServiceLabel}</span>
                </div>
                <span className="text-sm font-extrabold font-mono tabular-nums text-indigo-700">
                  {formatEUR(trampComparisonRoute.estimatedCost, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{t.trampLogicSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200/70 text-[11px] font-mono tabular-nums">
                <div>
                  <span className="text-slate-400 font-sans block">{t.pricingModelLabel}</span>
                  <span className="font-bold text-slate-800">{formatEUR(trampComparisonRoute.baseFreightCost, 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.berthDwellLogicLabel}</span>
                  <span className="font-bold text-rose-700">1.35× ({trampComparisonRoute.dwellHours ?? 0}h)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.ballastFactorLabel}</span>
                  <span className="font-bold text-amber-700">+12% ({formatEmissions(trampComparisonRoute.estimatedEmissionsKg)})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">{t.reliabilityBaselineLabel}</span>
                  <span className="font-bold text-amber-700">{(trampComparisonRoute.scheduleReliabilityPct ?? 76).toFixed(1)}% · ±24–36h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Published Liner Line Schedules & Emissions Directory */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{t.publishedLineEmissionsTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.publishedLineEmissionsDesc}</p>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                    <th className="py-2.5 px-3">{t.linerLineCol}</th>
                    <th className="py-2.5 px-3">{t.sailingScheduleCol}</th>
                    <th className="py-2.5 px-3">{t.etaWindowCol}</th>
                    <th className="py-2.5 px-3">{t.weatherWindowCol}</th>
                    <th className="py-2.5 px-3 text-right">{t.publishedIntensityCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LINER_SERVICE_LINES.map((line) => {
                    const isMatched = linerComparisonRoute.linerLineCode === line.lineCode;
                    return (
                      <tr
                        key={line.lineCode}
                        onClick={() => {
                          setLinerVesselType(line.vesselType);
                          if (seaServiceFilter === 'TRAMP') setSeaServiceFilter('ALL');
                          setSelectedMode('SEA_LINER');
                        }}
                        className={`cursor-pointer transition-colors ${
                          isMatched ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">
                            <span className="font-mono text-blue-700">{line.lineCode}</span> · {line.lineName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {line.carrier} · {line.corridorLabel}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <p className="font-semibold text-slate-800">{line.departureWindowUtc}</p>
                          <p className="text-[11px] font-sans text-slate-500">
                            {line.frequency} · {t.cutoffLabel}: {line.cutoffWindowUtc}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <p className="font-bold text-teal-700">{line.predictableEtaWindow}</p>
                          <p className="text-[11px] text-slate-500">{line.scheduleReliabilityPct.toFixed(1)}% OTIF</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className={`text-[11px] font-bold ${
                            line.weatherWindowStatus === 'clear'
                              ? 'text-emerald-700'
                              : line.weatherWindowStatus === 'watch'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                          }`}>
                            {line.weatherWindowSummary}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <p className="font-extrabold text-emerald-700">
                            {line.publishedEmissionGPerTeuKm.toFixed(1)} g/TEU-km · {line.publishedEmissionKgPerTkm.toFixed(3)} kg/t·km
                          </p>
                          <p className="text-[11px] font-sans text-slate-500">
                            {line.publishedVoyageKgPerTeu} kg/TEU · {line.publicationStandard} ({line.yoyIntensityDeltaPct}% YoY)
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Carbon-Aware Routing Recommendation & Trade-Off Analysis */}
      {carbonAwareTradeOff && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Leaf size={17} className="text-emerald-600" />
                  <span>{t.carbonAwareTitle}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">{t.carbonAwareDesc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500 px-2">{t.costTolerance}:</span>
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCostTolerancePct(pct)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono tabular-nums font-bold transition-colors whitespace-nowrap ${
                        costTolerancePct === pct
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ±{pct}%
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleApplyCarbonAware}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isCarbonAwareActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{isCarbonAwareActive ? t.carbonAwareApplied : t.applyCarbonAware}</span>
                </button>
              </div>
            </div>

            {/* Baseline vs Carbon-Aware Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500">{t.baselineOption}</p>
                <p className="text-base font-extrabold text-slate-900">
                  {getModeLabel(carbonAwareTradeOff.baselineRoute.mode, t)} · {t.standardSpeed}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums text-slate-600 pt-1">
                  <span><strong className="text-slate-900">{formatEUR(carbonAwareTradeOff.baselineRoute.estimatedCost, 0)}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>{formatEmissions(carbonAwareTradeOff.baselineRoute.estimatedEmissionsKg)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{carbonAwareTradeOff.baselineRoute.estimatedDays} {t.days}</span>
                  <span aria-hidden="true">·</span>
                  <span>{(carbonAwareTradeOff.baselineRoute.scheduleReliabilityPct ?? 90).toFixed(1)}% ETA</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:pl-6 sm:border-l sm:border-slate-100">
                <p className="text-[11px] font-semibold text-emerald-700">
                  {t.carbonAwareOption} ·{' '}
                  {carbonAwareTradeOff.recommendationType === 'route_and_speed'
                    ? t.recTypeRouteAndSpeed
                    : carbonAwareTradeOff.recommendationType === 'route_shift'
                      ? t.recTypeRouteShift
                      : t.recTypeEcoSpeed}
                </p>
                <p className="text-base font-extrabold text-emerald-800">
                  {getModeLabel(carbonAwareTradeOff.recommendedRoute.mode, t)} ·{' '}
                  {carbonAwareTradeOff.recommendedRoute.speedProfile === 'eco'
                    ? t.ecoSpeedLabel
                    : t.standardSpeed}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums text-slate-700 pt-1">
                  <span><strong className="text-slate-900">{formatEUR(carbonAwareTradeOff.recommendedRoute.estimatedCost, 0)}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-emerald-700">{formatEmissions(carbonAwareTradeOff.recommendedRoute.estimatedEmissionsKg)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{carbonAwareTradeOff.recommendedRoute.estimatedDays} {t.days}</span>
                  <span aria-hidden="true">·</span>
                  <span>{(carbonAwareTradeOff.recommendedRoute.scheduleReliabilityPct ?? 90).toFixed(1)}% ETA</span>
                </div>
              </div>
            </div>

            {/* Quantified Trade-Off Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.co2SavingsLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-emerald-700 mt-0.5">
                  -{formatEmissions(carbonAwareTradeOff.co2SavedKg)}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-emerald-700">
                  -{carbonAwareTradeOff.co2SavedPct.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.costDeltaLabel}</p>
                <p className={`text-lg font-extrabold font-mono tabular-nums mt-0.5 ${
                  carbonAwareTradeOff.costDeltaEur <= 0 ? 'text-emerald-700' : 'text-slate-900'
                }`}>
                  {carbonAwareTradeOff.costDeltaEur >= 0
                    ? `+${formatEUR(carbonAwareTradeOff.costDeltaEur, 0)}`
                    : `-${formatEUR(Math.abs(carbonAwareTradeOff.costDeltaEur), 0)}`}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500">
                  {carbonAwareTradeOff.costDeltaPct >= 0 ? '+' : ''}
                  {carbonAwareTradeOff.costDeltaPct.toFixed(1)}% ({t.similarCostBand})
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.transitDeltaLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-amber-700 mt-0.5">
                  {carbonAwareTradeOff.transitDaysDelta >= 0 ? '+' : ''}
                  {carbonAwareTradeOff.transitDaysDelta.toFixed(1)} {t.days}
                </p>
                <p className="text-[11px] text-slate-500">
                  {carbonAwareTradeOff.baselineRoute.estimatedDays}d → {carbonAwareTradeOff.recommendedRoute.estimatedDays}d
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.reliabilityDeltaLabel}</p>
                <p className={`text-lg font-extrabold font-mono tabular-nums mt-0.5 ${
                  carbonAwareTradeOff.reliabilityDeltaPct >= 0 ? 'text-teal-700' : 'text-amber-700'
                }`}>
                  {carbonAwareTradeOff.reliabilityDeltaPct >= 0 ? '+' : ''}
                  {carbonAwareTradeOff.reliabilityDeltaPct.toFixed(1)}%
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500">
                  {carbonAwareTradeOff.abatementEurPerTonne !== null
                    ? `${t.abatementCostLabel}: ${formatEUR(carbonAwareTradeOff.abatementEurPerTonne, 0)}/t`
                    : `${t.abatementCostLabel}: Net Saving`}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Cost vs CO2e Pareto Frontier ScatterChart */}
          <div className="lg:col-span-5 flex flex-col justify-between lg:pl-6 lg:border-l lg:border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.tradeoffChartTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.tradeoffChartDesc}</p>
            </div>
            <div className="h-56 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name={t.totalLandedCost}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <YAxis
                    type="number"
                    dataKey="co2"
                    name={t.emissions}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}kg`}
                  />
                  <ZAxis range={[64, 64]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-slate-900">{pt.name}</p>
                          <p className="font-mono tabular-nums text-slate-700 mt-1">
                            {formatEUR(pt.cost, 0)} · {formatEmissions(pt.co2)} · {pt.days}d
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine
                    x={Math.round(carbonAwareTradeOff.baselineRoute.estimatedCost * (1 + costTolerancePct / 100))}
                    stroke="#0d9488"
                    strokeDasharray="4 4"
                    label={{
                      value: `+${costTolerancePct}%`,
                      position: 'top',
                      fill: '#0f766e',
                      fontSize: 10
                    }}
                  />
                  <Scatter name={t.standardSpeed} data={scatterData.standard} fill="#64748b" />
                  <Scatter name={t.ecoSpeedLabel} data={scatterData.eco} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Slow Steaming Option & Fuel / CO2 Savings Simulator */}
      {slowSteamingAnalysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Ship size={17} className="text-blue-600" />
                  <span>{t.slowSteamingTitle}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t.slowSteamingDesc} ({getModeLabel(slowSteamingAnalysis.baseOption.mode, t)})
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                {slowSteamingAnalysis.tiers.map((tier) => (
                  <button
                    key={tier.pct}
                    type="button"
                    onClick={() => setSlowSteamingPct(tier.pct)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-mono tabular-nums font-semibold transition-colors whitespace-nowrap ${
                      slowSteamingPct === tier.pct
                        ? tier.pct === 0
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active / Preview Fuel & CO2 Savings Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.fuelSavedLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-amber-700 mt-0.5">
                  -{formatEUR(slowSteamingAnalysis.previewOption.fuelSavedEur ?? 0, 0)}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500">
                  -{formatNumber(slowSteamingAnalysis.previewOption.fuelSavedUnits ?? 0)} {slowSteamingAnalysis.baseOption.fuelUnit}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.co2SavedLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-emerald-700 mt-0.5">
                  -{formatEmissions(slowSteamingAnalysis.previewOption.co2SavedKg ?? 0)}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-emerald-700">
                  -{formatEUR(slowSteamingAnalysis.previewOption.co2SavedEur ?? 0, 0)} ({slowSteamingAnalysis.baseOption.estimatedEmissionsKg > 0 ? Math.round(((slowSteamingAnalysis.previewOption.co2SavedKg ?? 0) / slowSteamingAnalysis.baseOption.estimatedEmissionsKg) * 100) : 0}%)
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.combinedSavingsLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                  -{formatEUR(slowSteamingAnalysis.previewOption.fuelPlusCo2SavedEur ?? 0, 0)}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500">
                  {slowSteamingPct === 0 ? `${t.slowSteaming15}` : `-${slowSteamingPct}% Active`}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{t.vesselSpeedLabel}</p>
                <p className="text-lg font-extrabold font-mono tabular-nums text-blue-700 mt-0.5">
                  {slowSteamingAnalysis.previewOption.vesselSpeedKnots ?? 17.0} kts
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-500">
                  +{(slowSteamingAnalysis.previewOption.estimatedDays - slowSteamingAnalysis.baseOption.estimatedDays).toFixed(1)} {t.days}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              {t.propellerLawNote}
            </p>
          </div>

          {/* Right: Fuel vs CO2 Cost Savings Across Speed Tiers */}
          <div className="lg:col-span-5 flex flex-col justify-between lg:pl-6 lg:border-l lg:border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.speedSavingsCurveTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {getModeLabel(slowSteamingAnalysis.baseOption.mode, t)} · {formatEUR(carbonPricePerTonne, 0)}/t CO2
              </p>
            </div>
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slowSteamingAnalysis.tiers.filter((x) => x.pct > 0)} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [formatEUR(Number(value), 0), name]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="fuelSavedEur" name={t.fuelSavedLabel} stackId="save" fill="#f59e0b" />
                  <Bar dataKey="co2SavedEur" name={t.co2SavedLabel} stackId="save" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main Comparison Grid: 4-Stack Cost Chart + Interactive Selection Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stacked Cost Breakdown Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.costBreakdownTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {origin} → {destination} · {weightTonnes}t
            </p>
          </div>
          <div className="h-80 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [formatEUR(Number(value), 0), name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey={t.baseFreight} stackId="cost" fill="#334155" />
                <Bar dataKey={t.fuelCost} stackId="cost" fill="#f59e0b" />
                <Bar dataKey={t.co2Cost} stackId="cost" fill="#10b981" />
                <Bar dataKey={t.portFees} stackId="cost" fill="#6366f1" />
                <Bar dataKey={t.dwellCost} stackId="cost" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Comparison Table & Booking Action */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t.mode}</th>
                  <th className="py-3.5 px-2 text-right">{t.transitDays}</th>
                  <th className="py-3.5 px-2 text-right">{t.scheduleReliability}</th>
                  <th className="py-3.5 px-2 text-right">{t.teuKm}</th>
                  <th className="py-3.5 px-2 text-right">{t.baseFreight}</th>
                  <th className="py-3.5 px-2 text-right">{t.fuelCost}</th>
                  <th className="py-3.5 px-2 text-right">{t.co2Cost}</th>
                  <th className="py-3.5 px-2 text-right">{t.portFees}</th>
                  <th className="py-3.5 px-2 text-right">{t.dwellImpactLabel}</th>
                  <th className="py-3.5 px-4 text-right">{t.totalLandedCost}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {computedOptions.map((opt, idx) => {
                  const isSelected = selectedRoute?.mode === opt.mode;
                  const isBest = idx === 0;
                  const relPct = opt.scheduleReliabilityPct ?? 90;
                  return (
                    <tr
                      key={opt.mode}
                      onClick={() => setSelectedMode(opt.mode)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                            {getModeIcon(opt.mode)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                              <span>{getModeLabel(opt.mode, t)}</span>
                              {isBest && (
                                <span className="text-[10px] font-bold text-emerald-700">
                                  · {t.optimalChoice}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {opt.linerLineCode ? `${opt.linerLineCode} · ` : ''}
                              {opt.vesselType ? `${t[getVesselTypeSpec(opt.vesselType, opt.mode).labelKey]} · ` : ''}
                              {formatNumber(opt.estimatedDistanceKm)} km · {formatEmissions(opt.estimatedEmissionsKg)} · {(opt.glecFactorWtw ?? getGlecFactorSpec(opt.mode, opt.vesselType).wtw).toFixed(3)} kg/t·km
                              {opt.publishedEmissionGPerTeuKm ? ` (${opt.publishedEmissionGPerTeuKm} g/TEU-km)` : ''}
                              {opt.ballastPct ? ` · +${opt.ballastPct}% ballast` : ''}
                            </p>
                            {opt.predictableEtaWindow && (
                              <p className={`text-[10px] font-mono tabular-nums mt-0.5 ${opt.mode === 'SEA_TRAMP' ? 'text-amber-700' : 'text-blue-700 font-semibold'}`}>
                                {opt.fixedDepartureUtc ? `${opt.fixedDepartureUtc} · ` : ''}{opt.predictableEtaWindow}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-slate-700 whitespace-nowrap">
                        <div>{opt.estimatedDays}d</div>
                        {(opt.dwellDaysAdded ?? 0) > 0 && (
                          <div className="text-[10px] text-rose-600">+{opt.dwellHours}h</div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className={`font-bold block ${relPct >= SCHEDULE_SLA_TARGET_PCT ? 'text-teal-700' : 'text-amber-700'}`}>
                          {relPct.toFixed(1)}%
                        </span>
                        {opt.etaConfidenceHours && (
                          <span className="text-[10px] text-slate-500">±{opt.etaConfidenceHours}h</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatNumber(opt.teuKm)}</div>
                        <div className="text-[10px] text-slate-500">{formatEUR(opt.costPerTeuKm, 2)}/TEU-km</div>
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatEUR(opt.baseFreightCost, 0)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-amber-700 whitespace-nowrap">
                        <div>{formatEUR(opt.fuelCost, 0)}</div>
                        {(opt.fuelSavedEur ?? 0) > 0 && (
                          <div className="text-[10px] text-emerald-700">-{formatEUR(opt.fuelSavedEur ?? 0, 0)}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                        <div>{formatEUR(opt.co2Cost, 0)}</div>
                        {(opt.co2SavedKg ?? 0) > 0 && (
                          <div className="text-[10px] text-emerald-600">-{formatNumber(opt.co2SavedKg ?? 0)} kg</div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-indigo-700 whitespace-nowrap">
                        {formatEUR(opt.portFeeTotal, 0)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                        {(opt.dwellCost ?? 0) > 0 ? (
                          <>
                            <div className="font-semibold text-rose-700">+{formatEUR(opt.dwellCost ?? 0, 0)}</div>
                            <div className="text-[10px] text-rose-500">+{formatNumber(opt.dwellEmissionsKg ?? 0)} kg</div>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-extrabold text-slate-900 whitespace-nowrap">
                        {formatEUR(opt.estimatedCost, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Route Detail Footer + Book CTA */}
          {selectedRoute && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-900">
                  <span>
                    {getModeLabel(selectedRoute.mode, t)} ({slowSteamingPct > 0 ? `${t.ecoSpeedLabel} -${slowSteamingPct}%` : t.standardSpeed})
                  </span>
                  {(selectedRoute.fuelPlusCo2SavedEur ?? 0) > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-emerald-700">
                        {t.combinedSavingsLabel}: -{formatEUR(selectedRoute.fuelPlusCo2SavedEur ?? 0, 0)} (-{formatNumber(selectedRoute.co2SavedKg ?? 0)} kg)
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-teal-700">
                    {t.scheduleReliability}: {(selectedRoute.scheduleReliabilityPct ?? 90).toFixed(1)}%
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatNumber(selectedRoute.teuKm)} TEU-km ({formatEUR(selectedRoute.costPerTeuKm, 2)}/TEU-km)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    {t.fuelPlusCo2}: {formatEUR(selectedRoute.fuelPlusCo2Cost, 0)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-indigo-700">
                    {t.portFees}: {formatEUR(selectedRoute.portFeeTotal, 0)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-rose-700">
                    {t.dwellCost}: {formatEUR(selectedRoute.dwellCost ?? 0, 0)} (+{formatNumber(selectedRoute.dwellEmissionsKg ?? 0)} kg)
                  </span>
                </div>
                <p className="text-xs text-slate-600">{selectedRoute.reasoning}</p>
                <p className="text-[11px] font-mono tabular-nums text-emerald-800">
                  GLEC v3.0 WTW: {formatNumber(selectedRoute.estimatedDistanceKm)} km × {formatNumber(weightTonnes, 1)} t × {(selectedRoute.glecFactorWtw ?? getGlecFactorSpec(selectedRoute.mode).wtw).toFixed(3)} kg/t·km{(selectedRoute.dwellEmissionsKg ?? 0) > 0 ? ` + ${formatNumber(selectedRoute.dwellEmissionsKg ?? 0)} kg dwell` : ''} = {formatNumber(selectedRoute.estimatedEmissionsKg)} kg (TTW {formatNumber(selectedRoute.ttwEmissionsKg ?? 0)} + WTT {formatNumber(selectedRoute.wttEmissionsKg ?? 0)})
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {bookingConfirmed && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 size={15} /> {bookingConfirmed}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleBookSelected}
                  disabled={isReadOnly}
                  title={isReadOnly ? t.readOnly : t.bookSelectedRoute}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isReadOnly
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isReadOnly ? <Lock size={14} /> : <ArrowRight size={14} />}
                  <span>{t.bookSelectedRoute}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance & Trip Accounting: IMO EEXI/CII, TCE vs. CO2 & ESG Cost per Trip */}
      {selectedRoute && selectedRoute.tripAccounting && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator size={17} className="text-indigo-600" />
                <span>{t.complianceAccountingTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.complianceAccountingSubtitle}</p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600">
              {getModeLabel(selectedRoute.mode, t)} · {selectedRoute.estimatedDays}d ·{' '}
              <span className="font-bold text-slate-900">
                {formatEUR(carbonPricePerTonne, 0)}/t EU ETS
              </span>
            </div>
          </div>

          {/* 3-Column Executive Strip: Item 13 EEXI/CII · Item 14 TCE & CO2/Trip · Item 15 ESG Cost Accounting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Item 13: EEXI & CII */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-600" />
                  <span>{t.eexiCiiTrackerTitle}</span>
                </p>
                {selectedRoute.eexiCii ? (
                  <span className={`px-2 py-0.5 rounded border text-xs font-black font-mono ${getCiiBadgeStyle(selectedRoute.eexiCii.ciiGrade)}`}>
                    CII {selectedRoute.eexiCii.ciiGrade}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500">Inland / Air</span>
                )}
              </div>
              {selectedRoute.eexiCii ? (
                <div className="space-y-2 text-xs font-mono tabular-nums">
                  <p className="font-sans font-semibold text-slate-700">
                    {selectedRoute.eexiCii.vesselName} ({selectedRoute.eexiCii.imoNumber})
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">{t.eexiAttainedReqLabel}</span>
                      <span className="font-bold text-slate-900">
                        {selectedRoute.eexiCii.attainedEexi.toFixed(1)} / {selectedRoute.eexiCii.requiredEexi.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        -{selectedRoute.eexiCii.eexiMarginPct.toFixed(1)}% margin
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">{t.ciiAttainedReqLabel}</span>
                      <span className="font-bold text-slate-900">
                        {selectedRoute.eexiCii.attainedCii.toFixed(2)} / {selectedRoute.eexiCii.requiredCii.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-600 block">
                        Ratio {selectedRoute.eexiCii.ciiRatio.toFixed(2)} · 2027: {selectedRoute.eexiCii.ciiProjectedNextYear}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">{t.eplLimitLabel}</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRoute.eexiCii.eplPowerLimitPct > 0 ? `EPL -${selectedRoute.eexiCii.eplPowerLimitPct}%` : 'Unrestricted MCR'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">{t.fuelEuIntensityLabel}</span>
                      <span className={`font-semibold ${selectedRoute.eexiCii.fuelEuIntensityGPerMj > FUEL_EU_2026_LIMIT_G_PER_MJ ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {selectedRoute.eexiCii.fuelEuIntensityGPerMj.toFixed(1)} gCO2e/MJ
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  IMO EEXI &amp; CII apply to maritime vessel legs ({t.seaLiner}, {t.seaTramp}, {t.seaLiner} + {t.rail}).
                </p>
              )}
            </div>

            {/* Item 14: TCE & CO2 per Trip Evaluation */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Gauge size={15} className="text-teal-600" />
                  <span>{t.tceCo2TripTitle}</span>
                </p>
                <span className="text-xs font-mono tabular-nums font-black text-teal-700">
                  {formatEUR(selectedRoute.tripAccounting.tceEurPerDay, 0)}/d
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">{t.grossFreightRevLabel}</span>
                  <span className="font-bold text-slate-900">{formatEUR(selectedRoute.tripAccounting.grossFreightRevenueEur, 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">{t.voyageExpensesLabel}</span>
                  <span className="font-bold text-slate-700">-{formatEUR(selectedRoute.tripAccounting.voyageExpensesEur, 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">{t.tcePerDayLabel}</span>
                  <span className="font-extrabold text-teal-700">{formatEUR(selectedRoute.tripAccounting.tceEurPerDay, 0)}</span>
                  <span className={`text-[10px] block ${selectedRoute.tripAccounting.tceSpreadEurPerDay >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedRoute.tripAccounting.tceSpreadEurPerDay >= 0 ? '+' : ''}
                    {formatEUR(selectedRoute.tripAccounting.tceSpreadEurPerDay, 0)} vs mkt
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">{t.co2PerTripLabel}</span>
                  <span className="font-extrabold text-emerald-700">{formatEmissions(selectedRoute.tripAccounting.co2PerTripKg)}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {formatNumber(selectedRoute.tripAccounting.co2PerDayKg)} kg/d · {selectedRoute.tripAccounting.co2PerNmKg} kg/nm
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/70">
                {t.tceFormulaNote} · {t.tcePerTonneCo2Label}: {formatEUR(selectedRoute.tripAccounting.tcePerTonneCo2, 0)}/t CO2
              </p>
            </div>

            {/* Item 15: ESG Cost Accounting per Trip */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Leaf size={15} className="text-emerald-600" />
                  <span>{t.esgCostAccountingTitle}</span>
                </p>
                <span className="text-xs font-mono tabular-nums font-black text-indigo-700">
                  {formatEUR(selectedRoute.tripAccounting.totalEsgCostEur, 0)} ({selectedRoute.tripAccounting.esgSharePct}%)
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">{t.commercialCostLabel}</span>
                  <span className="font-semibold text-slate-900">{formatEUR(selectedRoute.tripAccounting.commercialCostEur, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">{t.euEtsLiabilityLabel}</span>
                  <span className="font-semibold text-emerald-700">+{formatEUR(selectedRoute.tripAccounting.euEtsCostEur, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">{t.fuelEuBalanceLabel}</span>
                  <span className={`font-semibold ${selectedRoute.tripAccounting.fuelEuComplianceEur <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedRoute.tripAccounting.fuelEuComplianceEur > 0 ? '+' : ''}
                    {formatEUR(selectedRoute.tripAccounting.fuelEuComplianceEur, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">{t.voluntaryOffsetLabel}</span>
                  <span className="font-semibold text-slate-700">+{formatEUR(selectedRoute.tripAccounting.voluntaryOffsetCostEur, 0)}</span>
                </div>
                {selectedRoute.tripAccounting.greenFinancingRebateEur > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">{t.greenRebateLabel}</span>
                    <span className="font-semibold text-emerald-700">-{formatEUR(selectedRoute.tripAccounting.greenFinancingRebateEur, 0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-slate-200 font-extrabold text-slate-900">
                  <span className="font-sans">{t.esgAdjustedCostLabel}</span>
                  <span>{formatEUR(selectedRoute.tripAccounting.esgAdjustedCostEur, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Accounting Table across all modes */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                  <th className="py-2.5 px-3">{t.mode}</th>
                  <th className="py-2.5 px-2 text-center">{t.ciiRatingLabel}</th>
                  <th className="py-2.5 px-2 text-right">{t.tcePerDayLabel}</th>
                  <th className="py-2.5 px-2 text-right">{t.co2PerTripLabel}</th>
                  <th className="py-2.5 px-2 text-right">{t.euEtsLiabilityLabel}</th>
                  <th className="py-2.5 px-2 text-right">{t.fuelEuBalanceLabel}</th>
                  <th className="py-2.5 px-2 text-right">{t.totalEsgCostTripLabel}</th>
                  <th className="py-2.5 px-3 text-right">{t.esgAdjustedCostLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {computedOptions.map((opt) => {
                  const acc = opt.tripAccounting!;
                  const isSel = selectedRoute.mode === opt.mode;
                  return (
                    <tr
                      key={opt.mode}
                      onClick={() => setSelectedMode(opt.mode)}
                      className={`cursor-pointer transition-colors ${isSel ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 whitespace-nowrap">
                        {getModeLabel(opt.mode, t)}
                        {opt.eexiCii ? (
                          <span className="block text-[10px] font-normal text-slate-500">
                            {opt.eexiCii.vesselName} · EEXI -{opt.eexiCii.eexiMarginPct.toFixed(1)}%
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {opt.eexiCii ? (
                          <span className={`inline-block w-6 py-0.5 rounded border font-black text-[11px] ${getCiiBadgeStyle(opt.eexiCii.ciiGrade)}`}>
                            {opt.eexiCii.ciiGrade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-teal-700">
                        {formatEUR(acc.tceEurPerDay, 0)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-emerald-700">
                        {formatEmissions(acc.co2PerTripKg)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {formatEUR(acc.euEtsCostEur, 0)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={acc.fuelEuComplianceEur <= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {acc.fuelEuComplianceEur > 0 ? '+' : ''}
                          {formatEUR(acc.fuelEuComplianceEur, 0)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-indigo-700">
                        {formatEUR(acc.totalEsgCostEur, 0)} ({acc.esgSharePct}%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {formatEUR(acc.esgAdjustedCostEur, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const getCiiBadgeStyle = (grade: CiiGrade) => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'B':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'C':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'D':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'E':
      return 'bg-rose-50 text-rose-800 border-rose-200';
  }
};

export default RouteOptimizer;
