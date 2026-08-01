import type { RiskLevel } from './types';

/** Overall-risk → marker fill colours (kept to the app palette). */
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#2f5644',
  moderate: '#b8935f',
  high: '#c05440',
  severe: '#8b3a3a',
};
