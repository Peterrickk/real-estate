/** Hazard severity ordering: low < moderate < high < severe. */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

/** A single earthquake from the USGS live feed (past 30 days). */
export interface EarthquakeEvent {
  id: string;
  /** ISO timestamp of the event. */
  time: string;
  /** Reported magnitude (null/0 events are filtered out). */
  magnitude: number;
  depthKm: number;
  lat: number;
  lng: number;
  /** Human-readable place description from USGS. */
  place: string;
  /** Link to the USGS event detail page. */
  url: string;
}

/** Aggregated seismic activity within a radius of a property. */
export interface EarthquakeStats {
  /** Number of quakes within the search radius in the last 30 days. */
  total: number;
  /** Strongest magnitude within the radius (0 if none). */
  maxMagnitude: number;
  nearest: {
    distanceKm: number;
    magnitude: number;
    time: string;
    place: string;
  } | null;
}

/** A signal about nearby development or land-use change. */
export interface DevelopmentSignal {
  label: string;
  distanceKm?: number;
  /** Positive signals (new builds, infrastructure) raise value. */
  signal: 'positive' | 'negative';
  note?: string;
}

export interface FloodProfile {
  risk: RiskLevel;
  /** Flood-zone label, e.g. FEMA-style "AE" or "X (minimal)". */
  zone: string;
  elevationM: number;
  /** Short human-readable reason for the rating. */
  drivingFactor: string;
}

export interface TerrainProfile {
  /** Higher relief = worse terrain for building. */
  relief: RiskLevel;
  label: string;
  elevationM: number;
}

export interface SeismicProfile {
  risk: RiskLevel;
  recentEvents: number;
  maxMagnitude: number;
  nearestKm: number | null;
}

/** Complete per-property hazard picture used by the map, panels, and valuation. */
export interface PropertyHazardAssessment {
  propertyId: string;
  /** Live/derived elevation in metres (may fall back to seeded value). */
  elevationM: number;
  flood: FloodProfile;
  terrain: TerrainProfile;
  seismic: SeismicProfile;
  /** Worst of flood / terrain / seismic. */
  overall: RiskLevel;
  earthquakeStats: EarthquakeStats;
  development: DevelopmentSignal[];
}

/** Deterministic, domain-consistent risk ordering for "worst of" logic. */
export const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  severe: 3,
};

export function worstRisk(...levels: RiskLevel[]): RiskLevel {
  return levels.reduce<RiskLevel>(
    (worst, level) => (RISK_ORDER[level] > RISK_ORDER[worst] ? level : worst),
    'low',
  );
}
