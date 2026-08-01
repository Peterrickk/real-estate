import type { Property } from '../../modules/property-registry/types';
import { earthquakeStatsNear } from './usgs';
import type {
  FloodProfile,
  PropertyHazardAssessment,
  RiskLevel,
  SeismicProfile,
  TerrainProfile,
  EarthquakeStats,
  EarthquakeEvent,
} from './types';
import { worstRisk } from './types';

/**
 * Deterministic hazard assessment engine.
 *
 * - Seismic: derived from the LIVE USGS 30-day feed (`earthquakeStatsNear`),
 *   bumped by a seeded baseline where the property sits in a known seismic zone.
 * - Flood: derived primarily from elevation (SRTM via OpenTopoData, falling
 *   back to the seeded elevation), overridden by a seeded flood zone.
 * - Terrain: from elevation bands plus a seeded terrain class.
 *
 * The PhilSA Sentinel-1 path (see `philsaSentinel.ts`) is the satellite
 * flood-mapping source that would replace the elevation-only flood model in
 * production; the model here keeps the demo functional without credentials.
 */

/** Elevation bands (metres). */
const FLOOD_ELEVATION_BANDS: Array<{ max: number; risk: RiskLevel }> = [
  { max: 5, risk: 'severe' },
  { max: 20, risk: 'high' },
  { max: 60, risk: 'moderate' },
];

const TERRAIN_ELEVATION_BANDS: Array<{ min: number; relief: RiskLevel }> = [
  { min: 1200, relief: 'high' },
  { min: 300, relief: 'moderate' },
  { min: 60, relief: 'low' },
];

const TERRAIN_RELIEF_LABELS: Record<RiskLevel, string> = {
  low: 'Rolling upland',
  moderate: 'Elevated terrain',
  high: 'Mountainous / high plateau',
  severe: 'Extreme terrain',
};

export function assessFloodRisk(property: Property, elevationM: number | null): FloodProfile {
  const seededZone = property.hazard?.floodZone;
  const elevation = elevationM ?? property.hazard?.elevationM ?? null;

  if (elevation === null) {
    return {
      risk: 'moderate',
      zone: seededZone ?? 'Unassessed',
      elevationM: 0,
      drivingFactor: 'No elevation reading yet',
    };
  }

  let risk: RiskLevel = 'low';
  for (const band of FLOOD_ELEVATION_BANDS) {
    if (elevation < band.max) {
      risk = band.risk;
      break;
    }
  }

  let zone = seededZone;
  let factor = `Elevation ${Math.round(elevation)} m`;

  if (risk === 'severe') {
    zone = zone ?? 'Coastal lowland';
    factor = `${factor} — below 5 m, flood-prone`;
  } else if (risk === 'high') {
    zone = zone ?? 'AE flood zone';
    factor = `${factor} — within 20 m, elevated flood exposure`;
  } else if (risk === 'moderate') {
    zone = zone ?? 'Shaded X zone';
    factor = `${factor} — moderate drainage exposure`;
  } else {
    zone = zone ?? 'X (minimal)';
    factor = `${factor} — above the floodplain`;
  }

  // A seeded high-risk zone (e.g. FEMA AE / coastal) overrides an elevation
  // reading that lands in the "low" band.
  if (seededZone && /coastal|AE\b|high/i.test(seededZone) && RISK_RANK[risk] < RISK_RANK.moderate) {
    risk = elevation < 20 ? 'severe' : 'high';
    zone = seededZone;
    factor = `${factor}; seeded zone "${seededZone}"`;
  }

  return { risk, zone, elevationM: elevation, drivingFactor: factor };
}

const RISK_RANK: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, severe: 3 };

export function assessTerrain(property: Property, elevationM: number | null): TerrainProfile {
  const seededClass = property.hazard?.terrainClass;
  const elevation = elevationM ?? property.hazard?.elevationM ?? null;

  let relief: RiskLevel = 'moderate';
  let label = 'Elevated terrain';

  if (elevation === null) {
    label = seededClass === 'steep' ? 'Steep terrain' : 'Unassessed';
  } else {
    relief = 'low';
    label = 'Lowland';
    for (const band of TERRAIN_ELEVATION_BANDS) {
      if (elevation >= band.min) {
        relief = band.relief;
        label = TERRAIN_RELIEF_LABELS[band.relief];
        break;
      }
    }
  }

  if (seededClass === 'steep') {
    relief = RISK_RANK[relief] >= RISK_RANK.moderate ? 'high' : 'moderate';
    label = 'Steep terrain';
  } else if (seededClass === 'lowland') {
    label = 'Lowland / floodplain';
  }

  return { relief, label, elevationM: elevation ?? 0 };
}

export function assessSeismic(
  stats: EarthquakeStats,
  baseline: RiskLevel | undefined,
): SeismicProfile {
  let risk: RiskLevel;
  if (stats.total >= 8) risk = 'severe';
  else if (stats.total >= 4) risk = 'high';
  else if (stats.total >= 1) risk = 'moderate';
  else risk = baseline && RISK_RANK[baseline] >= RISK_RANK.moderate ? 'moderate' : 'low';

  return {
    risk,
    recentEvents: stats.total,
    maxMagnitude: stats.maxMagnitude,
    nearestKm: stats.nearest?.distanceKm ?? null,
  };
}

export function assessPropertyHazard(
  property: Property,
  elevations: Record<string, number>,
  earthquakes: EarthquakeEvent[],
): PropertyHazardAssessment {
  const elevationM = elevations[property.id] ?? property.hazard?.elevationM ?? null;
  const earthquakeStats = earthquakeStatsNear(earthquakes, property);
  const flood = assessFloodRisk(property, elevationM);
  const terrain = assessTerrain(property, elevationM);
  const seismic = assessSeismic(earthquakeStats, property.hazard?.seismicBaseline);
  const overall = worstRisk(flood.risk, terrain.relief, seismic.risk);

  return {
    propertyId: property.id,
    elevationM: flood.elevationM,
    flood,
    terrain,
    seismic,
    overall,
    earthquakeStats,
    development: property.hazard?.developmentSignals ?? [],
  };
}
