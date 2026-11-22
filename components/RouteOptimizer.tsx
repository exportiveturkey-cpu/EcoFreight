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
  Gauge
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
import { RouteCostOption, Shipment, ShipmentStatus, SpeedProfile, TransportMode } from '../types';
import {
  CARBON_PRICE_PRESETS,
  DEFAULT_EU_ETS_CARBON_PRICE,
  DEFAULT_PORT_DWELL_HOURS,
  DWELL_TIME_PRESETS,
  SCHEDULE_SLA_TARGET_PCT,
  applySpeedProfileToRoute,
  buildDeterministicRouteOptions,
  calculateCO2Cost,
  calculateTeuKm,
  computeApplicablePortFee,
  computeCarbonAwareTradeOff,
  computeDwellImpact,
  computeModeScheduleReliability,
  estimatePortFees,
  estimateTeuFromCargo,
  getGlecFactorSpec
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
    case 'SEA':
      return t.sea;
    case 'SEA_RAIL':
      return `${t.sea} + ${t.rail}`;
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
    case 'SEA':
      return <Ship size={18} className="text-blue-600" />;
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
  const [speedProfile, setSpeedProfile] = useState<SpeedProfile>('standard');
  const [costTolerancePct, setCostTolerancePct] = useState<number>(10);
  const [objective, setObjective] = useState<OptimizationObjective>('total_cost');

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
      0
    )
  );
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('SEA_RAIL');
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);
  const [showGlecMethod, setShowGlecMethod] = useState(false);

  const runAnalysis = async (
    targetOrigin = origin,
    targetDest = destination,
    targetWeight = weightTonnes,
    targetOriginFee = originPortFee,
    targetDestFee = destinationPortFee,
    targetAllModes = applyPortFeeToAllModes,
    targetContainers = containersTeu
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
      0
    );
    setRawOptions(options);
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis('Piraeus, GR', 'Hamburg, DE', 12, initialPorts.originPortFee, initialPorts.destinationPortFee, false, estimateTeuFromCargo(12));
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

  // Dynamically recompute Standard-speed options whenever inputs/sliders change
  const standardComputedOptions = useMemo(() => {
    const fuelMult = fuelIndexPct / 100;
    return rawOptions.map((opt) => {
      const adjustedFuel = Math.round(opt.fuelCost * fuelMult);
      const linehaulEmissionsKg =
        opt.linehaulEmissionsKg ?? Math.max(0, opt.estimatedEmissionsKg - (opt.dwellEmissionsKg ?? 0));
      const spec = getGlecFactorSpec(opt.mode);
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
      const estimatedCost = opt.baseFreightCost + fuelPlusCo2Cost + portFeeTotal + dwell.dwellCost;
      const estimatedEmissionsKg = linehaulEmissionsKg + dwell.dwellEmissionsKg;
      const ttwEmissionsKg = linehaulTtwKg + dwell.dwellTtwKg;
      const wttEmissionsKg = linehaulWttKg + dwell.dwellWttKg;
      const baseDays = opt.dwellDaysAdded
        ? Math.max(1, Number((opt.estimatedDays - opt.dwellDaysAdded).toFixed(1)))
        : opt.estimatedDays;
      const estimatedDays = Number((baseDays + dwell.dwellDaysAdded).toFixed(1));
      const teuKm = calculateTeuKm(opt.estimatedDistanceKm, effectiveContainers);
      const costPerTeuKm = teuKm > 0 ? Number((estimatedCost / teuKm).toFixed(2)) : 0;
      const emissionsPerTeuKm = teuKm > 0 ? Number((estimatedEmissionsKg / teuKm).toFixed(3)) : 0;
      const rel = computeModeScheduleReliability(opt.mode, dwellTimeHours, applyPortFeeToAllModes);

      return {
        ...opt,
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
        glecFactorWtw: opt.glecFactorWtw ?? spec.wtw,
        ttwEmissionsKg,
        wttEmissionsKg,
        linehaulEmissionsKg,
        dwellEmissionsKg: dwell.dwellEmissionsKg,
        glecSource: opt.glecSource ?? spec.tocSource,
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
  }, [rawOptions, carbonPricePerTonne, fuelIndexPct, originPortFee, destinationPortFee, applyPortFeeToAllModes, containersTeu, dwellTimeHours]);

  const ecoComputedOptions = useMemo(
    () =>
      standardComputedOptions.map((opt) =>
        applySpeedProfileToRoute(opt, 'eco', carbonPricePerTonne)
      ),
    [standardComputedOptions, carbonPricePerTonne]
  );

  const carbonAwareTradeOff = useMemo(
    () => computeCarbonAwareTradeOff(standardComputedOptions, carbonPricePerTonne, costTolerancePct),
    [standardComputedOptions, carbonPricePerTonne, costTolerancePct]
  );

  const computedOptions = useMemo(() => {
    const activeSet = speedProfile === 'eco' ? ecoComputedOptions : standardComputedOptions;
    const baselineMaxCost = carbonAwareTradeOff
      ? carbonAwareTradeOff.baselineRoute.estimatedCost * (1 + costTolerancePct / 100)
      : Infinity;

    return [...activeSet].sort((a, b) => {
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
  }, [speedProfile, ecoComputedOptions, standardComputedOptions, objective, carbonAwareTradeOff, costTolerancePct]);

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
  }, [optimalRoute?.mode, objective]);

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
      standard: standardComputedOptions.map((opt) => ({
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
  }, [standardComputedOptions, ecoComputedOptions, t]);

  const handleApplyCarbonAware = () => {
    if (!carbonAwareTradeOff) return;
    const rec = carbonAwareTradeOff.recommendedRoute;
    setSpeedProfile(rec.speedProfile ?? 'eco');
    setObjective('carbon_aware');
    setSelectedMode(rec.mode);
  };

  const isCarbonAwareActive =
    !!carbonAwareTradeOff &&
    selectedRoute?.mode === carbonAwareTradeOff.recommendedRoute.mode &&
    speedProfile === (carbonAwareTradeOff.recommendedRoute.speedProfile ?? 'standard');

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
      selectedRoute.mode === 'SEA_RAIL'
        ? TransportMode.SEA
        : (selectedRoute.mode as TransportMode);

    const legs =
      selectedRoute.mode === 'SEA_RAIL'
        ? [
            {
              id: 'L1',
              mode: TransportMode.SEA,
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
      dwellTimeHours: selectedRoute.dwellHours ?? dwellTimeHours,
      scheduleDelayHours: selectedRoute.dwellHours ? Math.round((selectedRoute.dwellHours ?? 0) * 0.25) : 0,
      scheduleReliabilityPct: selectedRoute.scheduleReliabilityPct,
      speedProfile,
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
      trackingHistory: [
        {
          status: 'Booked',
          location: origin,
          timestamp: new Date().toISOString(),
          description: `Optimized via ${getModeLabel(selectedRoute.mode, t)} (${t.fuelCost}: ${formatEUR(selectedRoute.fuelCost, 0)} · ${t.co2Cost}: ${formatEUR(selectedRoute.co2Cost, 0)} · ${t.portFees}: ${formatEUR(selectedRoute.portFeeTotal, 0)} · ${t.dwellCost}: ${formatEUR(selectedRoute.dwellCost ?? 0, 0)})`
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
            {/* Speed Regime Toggle (Standard vs Eco-Speed / Slow Steaming) */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Gauge size={14} className="text-emerald-600" />
                {t.speedProfileLabel}
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSpeedProfile('standard')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap truncate ${
                    speedProfile === 'standard'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.standardSpeed}
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedProfile('eco')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap truncate ${
                    speedProfile === 'eco'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.ecoSpeedLabel}
                </button>
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
                              {formatNumber(opt.estimatedDistanceKm)} km · {formatEmissions(opt.estimatedEmissionsKg)} · {(opt.glecFactorWtw ?? getGlecFactorSpec(opt.mode).wtw).toFixed(3)} kg/t·km
                            </p>
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
                        <span className={`font-bold ${relPct >= SCHEDULE_SLA_TARGET_PCT ? 'text-teal-700' : 'text-amber-700'}`}>
                          {relPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatNumber(opt.teuKm)}</div>
                        <div className="text-[10px] text-slate-500">{formatEUR(opt.costPerTeuKm, 2)}/TEU-km</div>
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatEUR(opt.baseFreightCost, 0)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-amber-700 whitespace-nowrap">
                        {formatEUR(opt.fuelCost, 0)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                        {formatEUR(opt.co2Cost, 0)}
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
                    {getModeLabel(selectedRoute.mode, t)} ({speedProfile === 'eco' ? t.ecoSpeedLabel : t.standardSpeed})
                  </span>
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
    </div>
  );
};

export default RouteOptimizer;
