import type { PropertyHazardAssessment, RiskLevel } from '../hazards/types';

/**
 * Risk-adjusted land valuation.
 *
 * Models the app's valuation rules:
 *   - Earthquake history near the land -> value decreases.
 *   - Flood proneness (elevation / flood zone) -> value decreases.
 *   - Bad terrain (steep / mountainous) -> value decreases.
 *   - Nearby development / construction news -> value increases.
 *
 * All rates are documented below and applied as percentage deltas on the base
 * value (the latest appraisal estimate or last sale price).
 */

export const VALUATION_ADJUSTMENT_PERCENT = {
  seismic: { low: 0, moderate: -0.025, high: -0.05, severe: -0.08 },
  flood: { low: 0, moderate: -0.03, high: -0.07, severe: -0.12 },
  terrain: { low: 0, moderate: -0.015, high: -0.04, severe: 0 },
  /** Per positive development signal, capped at DEVELOPMENT_CAP. */
  developmentPositive: 0.025,
  developmentNegative: -0.02,
  DEVELOPMENT_CAP: 0.08,
} as const;

export interface ValuationBreakdownRow {
  key: 'earthquake' | 'flood' | 'terrain' | 'development';
  label: string;
  delta: number;
  percent: number;
  detail: string;
}

export interface RiskAdjustedValuation {
  baseValue: number;
  totalDelta: number;
  totalPercent: number;
  adjustedValue: number;
  rows: ValuationBreakdownRow[];
}

export interface RiskAdjustmentInput {
  baseValue: number;
  assessment: PropertyHazardAssessment;
}

function roundToNearest(value: number, step = 500): number {
  return Math.round(value / step) * step;
}

export function computeRiskAdjustedValuation({
  baseValue,
  assessment,
}: RiskAdjustmentInput): RiskAdjustedValuation {
  const rows: ValuationBreakdownRow[] = [];

  const seismicPercent =
    VALUATION_ADJUSTMENT_PERCENT.seismic[assessment.seismic.risk] ?? 0;
  rows.push({
    key: 'earthquake',
    label: 'Earthquake history',
    delta: baseValue * seismicPercent,
    percent: seismicPercent,
    detail: assessment.seismic.recentEvents > 0
      ? `${assessment.seismic.recentEvents} quake${assessment.seismic.recentEvents === 1 ? '' : 's'} within 200 km in the last 30 days`
      : 'No recent quakes within 200 km',
  });

  const floodPercent = VALUATION_ADJUSTMENT_PERCENT.flood[assessment.flood.risk] ?? 0;
  rows.push({
    key: 'flood',
    label: 'Flood proneness',
    delta: baseValue * floodPercent,
    percent: floodPercent,
    detail: `${assessment.flood.zone} — ${assessment.flood.drivingFactor}`,
  });

  const terrainPercent = VALUATION_ADJUSTMENT_PERCENT.terrain[assessment.terrain.relief] ?? 0;
  rows.push({
    key: 'terrain',
    label: 'Terrain quality',
    delta: baseValue * terrainPercent,
    percent: terrainPercent,
    detail: `${assessment.terrain.label} (${Math.round(assessment.elevationM)} m elevation)`,
  });

  let developmentPercent = 0;
  for (const signal of assessment.development) {
    if (signal.signal === 'positive') {
      developmentPercent = Math.min(
        VALUATION_ADJUSTMENT_PERCENT.DEVELOPMENT_CAP,
        developmentPercent + VALUATION_ADJUSTMENT_PERCENT.developmentPositive,
      );
    } else {
      developmentPercent += VALUATION_ADJUSTMENT_PERCENT.developmentNegative;
    }
  }
  rows.push({
    key: 'development',
    label: 'Nearby development',
    delta: baseValue * developmentPercent,
    percent: developmentPercent,
    detail:
      assessment.development.length > 0
        ? assessment.development.map((signal) => signal.label).join('; ')
        : 'No active development signals nearby',
  });

  const totalPercent = seismicPercent + floodPercent + terrainPercent + developmentPercent;
  const totalDelta = baseValue * totalPercent;
  const adjustedValue = roundToNearest(baseValue + totalDelta);

  return {
    baseValue,
    totalDelta,
    totalPercent,
    adjustedValue,
    rows,
  };
}

/** Risk level → human label, used by badges. */
export const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low risk',
  moderate: 'Moderate',
  high: 'High',
  severe: 'Severe',
};
