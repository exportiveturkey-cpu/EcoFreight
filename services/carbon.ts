
import { TransportMode } from '../types';

/**
 * Average CO2e emission factors (kg CO2e per tonne-km)
 * Based on GLEC (Global Logistics Emissions Council) framework defaults
 */
const EMISSION_FACTORS = {
  [TransportMode.AIR]: 1.13,   // Long-haul air freight
  [TransportMode.ROAD]: 0.105, // Heavy-duty truck
  [TransportMode.RAIL]: 0.025, // Average electric/diesel rail
  [TransportMode.SEA]: 0.012   // Large container ship
};

export const calculateLegEmissions = (
  mode: TransportMode,
  distanceKm: number,
  weightTonnes: number
): number => {
  const factor = EMISSION_FACTORS[mode];
  // Formula: Emission = Weight (t) * Distance (km) * Factor (kg/t-km)
  return parseFloat((weightTonnes * distanceKm * factor).toFixed(2));
};

export const getOffsetPrice = (emissionsKg: number): number => {
  // Assuming €25 per tonne of CO2 offset
  return parseFloat(((emissionsKg / 1000) * 25).toFixed(2));
};
