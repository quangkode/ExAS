// ═══════════════════════════════════════
// CocoCarbon MRV — Carbon Calculation Engine
// ═══════════════════════════════════════

import { EMISSION_FACTORS } from './constants';
import type { FarmingLog, LogDetailFuel, LogDetailLime, LogDetailFertilizer } from '@/types';

/**
 * CO2 absorbed from SOC change (tCO2e)
 * = (soc_end - soc_start) × area × 3.67
 */
export function calculateSOCAbsorption(
  socStart: number,
  socEnd: number,
  areaHa: number
): number {
  return (socEnd - socStart) * areaHa * EMISSION_FACTORS.CO2_PER_C;
}

/**
 * Fossil fuel emissions (tCO2e)
 * = Σ (liters_gasoline × 2.31 + liters_diesel × 2.68) / 1000
 */
export function calculateFuelEmissions(
  fuelLogs: Array<{ quantity: number; fuel_type: 'gasoline' | 'diesel' }>
): number {
  return fuelLogs.reduce((total, log) => {
    const factor = EMISSION_FACTORS.FUEL[log.fuel_type];
    return total + (log.quantity * factor) / 1000;
  }, 0);
}

/**
 * Lime emissions (tCO2e)
 * = Σ (kg_cao3 × 0.44 + kg_dolomite × 0.477) / 1000
 */
export function calculateLimeEmissions(
  limeLogs: Array<{ quantity: number; lime_type: 'cao3' | 'dolomite' }>
): number {
  return limeLogs.reduce((total, log) => {
    const factor = EMISSION_FACTORS.LIME[log.lime_type];
    return total + (log.quantity * factor) / 1000;
  }, 0);
}

/**
 * N2O emissions from fertilizer (tCO2e)
 * = Σ (kg × N% / 100) × 0.01 × (44/28) × 298 / 1000
 */
export function calculateN2OEmissions(
  fertLogs: Array<{ quantity: number; nitrogen_percent: number }>
): number {
  return fertLogs.reduce((total, log) => {
    const nApplied = log.quantity * (log.nitrogen_percent / 100);
    return total + (nApplied * EMISSION_FACTORS.N2O.emission_factor * EMISSION_FACTORS.N2O.n2o_to_co2e) / 1000;
  }, 0);
}

/**
 * Net carbon = CO2_absorbed - (fuel + lime + N2O)
 * Credits = net carbon (1 credit = 1 tCO2e)
 */
export function calculateNetCarbon(
  socAbsorption: number,
  fuelEmissions: number,
  limeEmissions: number,
  n2oEmissions: number
): number {
  return socAbsorption - (fuelEmissions + limeEmissions + n2oEmissions);
}

/**
 * Generate full carbon report calculation from logs
 */
export function generateCarbonCalculation(
  approvedLogs: FarmingLog[],
  fuelDetails: LogDetailFuel[],
  limeDetails: LogDetailLime[],
  fertDetails: LogDetailFertilizer[],
  socStart: number,
  socEnd: number,
  areaHa: number
) {
  const fuelLogs = approvedLogs
    .filter(l => l.activity_type === 'fossil_fuel')
    .map(l => {
      const detail = fuelDetails.find(d => d.log_id === l.id);
      return { quantity: l.quantity, fuel_type: detail?.fuel_type || 'diesel' as const };
    });

  const limeLogs = approvedLogs
    .filter(l => l.activity_type === 'lime_application')
    .map(l => {
      const detail = limeDetails.find(d => d.log_id === l.id);
      return { quantity: l.quantity, lime_type: detail?.lime_type || 'cao3' as const };
    });

  const fertLogs = approvedLogs
    .filter(l => l.activity_type === 'fertilizer')
    .map(l => {
      const detail = fertDetails.find(d => d.log_id === l.id);
      return { quantity: l.quantity, nitrogen_percent: detail?.nitrogen_percent || 0 };
    });

  const socAbsorption = calculateSOCAbsorption(socStart, socEnd, areaHa);
  const fuelEmissions = calculateFuelEmissions(fuelLogs);
  const limeEmissions = calculateLimeEmissions(limeLogs);
  const n2oEmissions = calculateN2OEmissions(fertLogs);
  const netCarbon = calculateNetCarbon(socAbsorption, fuelEmissions, limeEmissions, n2oEmissions);

  return {
    soc_change_tonC: socEnd - socStart,
    soc_absorption: socAbsorption,
    fossil_co2_ton: fuelEmissions,
    lime_co2_ton: limeEmissions,
    n2o_ton: n2oEmissions,
    net_carbon_ton: netCarbon,
    credits: Math.max(0, netCarbon),
  };
}
