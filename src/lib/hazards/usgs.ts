import { distanceKm, type LatLng } from '../mapUtils';
import type { EarthquakeEvent, EarthquakeStats } from './types';

/** USGS real-time feed of the past 30 days (no API key required, CORS enabled). */
export const USGS_FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

/** Radius (km) within which quakes count as "near" a property. */
export const SEISMIC_RADIUS_KM = 200;

interface UsgsFeature {
  id?: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number | null;
    updated?: number;
    url: string | null;
    depth: number | null;
    type?: string;
  };
  geometry: { coordinates: [number, number, number] } | null;
}

/** Fetch live earthquakes (last 30 days) from USGS. */
export async function fetchRecentEarthquakes(signal?: AbortSignal): Promise<EarthquakeEvent[]> {
  const response = await fetch(USGS_FEED_URL, { signal });
  if (!response.ok) {
    throw new Error(`USGS feed returned ${response.status}`);
  }
  const geojson = (await response.json()) as { features?: UsgsFeature[] };
  const events: EarthquakeEvent[] = [];

  for (const feature of geojson.features ?? []) {
    const mag = feature.properties.mag ?? 0;
    const lat = feature.geometry?.coordinates[1];
    const lng = feature.geometry?.coordinates[0];
    if (mag <= 0 || lat === undefined || lng === undefined) continue;

    events.push({
      id: feature.id ?? `${lng}-${lat}-${feature.properties.time ?? 0}`,
      time: new Date(feature.properties.time ?? 0).toISOString(),
      magnitude: mag,
      depthKm: feature.properties.depth ?? 0,
      lat,
      lng,
      place: feature.properties.place ?? 'Unknown location',
      url: feature.properties.url ?? 'https://earthquake.usgs.gov/',
    });
  }

  return events.sort((a, b) => b.magnitude - a.magnitude);
}

/** A quake plus its straight-line distance from a reference point. */
export interface NearbyEarthquake {
  event: EarthquakeEvent;
  distanceKm: number;
}

/** Earthquakes within `radiusKm` of a point. */
export function earthquakesNear(
  events: EarthquakeEvent[],
  point: LatLng,
  radiusKm = SEISMIC_RADIUS_KM,
): NearbyEarthquake[] {
  return events
    .map((event) => ({ event, distanceKm: distanceKm(point, event) }))
    .filter(({ distanceKm: distance }) => distance <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Aggregate seismic activity near a property into a compact stats object. */
export function earthquakeStatsNear(
  events: EarthquakeEvent[],
  point: LatLng,
  radiusKm = SEISMIC_RADIUS_KM,
): EarthquakeStats {
  const nearby = earthquakesNear(events, point, radiusKm);

  if (nearby.length === 0) {
    return { total: 0, maxMagnitude: 0, nearest: null };
  }

  const nearest = nearby[0];
  return {
    total: nearby.length,
    maxMagnitude: Math.max(...nearby.map(({ event }) => event.magnitude)),
    nearest: {
      distanceKm: nearest.distanceKm,
      magnitude: nearest.event.magnitude,
      time: nearest.event.time,
      place: nearest.event.place,
    },
  };
}
