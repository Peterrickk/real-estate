/**
 * Keyless terrain-elevation lookup.
 *
 * Primary: OpenTopoData SRTM30m — https://api.opentopodata.org/v1/srtm30m
 *   (global 30-arcsecond SRTM-derived elevations, CORS enabled, no key).
 * Fallback: Open-Elevation — https://api.open-elevation.com/api/v1/lookup
 *   (keyless, single POST for many points).
 * If both fail we return an empty map and callers fall back to seeded values.
 */

export interface ElevationPoint {
  id: string;
  lat: number;
  lng: number;
}

export const OPEN_TOPO_DATA_URL = 'https://api.opentopodata.org/v1/srtm30m';
export const OPEN_ELEVATION_URL = 'https://api.open-elevation.com/api/v1/lookup';

const REQUEST_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, init: RequestInit, signal?: AbortSignal): Promise<Response> {
  const timeoutController = new AbortController();
  const timer = window.setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const onOuterAbort = () => timeoutController.abort();

  signal?.addEventListener('abort', onOuterAbort);

  return fetch(url, { ...init, signal: timeoutController.signal })
    .finally(() => {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', onOuterAbort);
    });
}

async function openTopoData(points: ElevationPoint[], signal?: AbortSignal): Promise<Record<string, number>> {
  const locations = points.map(({ lat, lng }) => `${lat},${lng}`).join('|');
  const url = `${OPEN_TOPO_DATA_URL}?locations=${encodeURIComponent(locations)}`;
  const response = await fetchWithTimeout(url, {}, signal);
  if (!response.ok) throw new Error(`OpenTopoData returned ${response.status}`);
  const json = (await response.json()) as { results?: Array<{ elevation: number | null }> };
  if (!json.results || json.results.length !== points.length) throw new Error('Malformed OpenTopoData response');

  const elevations: Record<string, number> = {};
  json.results.forEach((result, index) => {
    const elevation = result.elevation;
    if (elevation !== null && elevation !== undefined) {
      elevations[points[index].id] = elevation;
    }
  });
  return elevations;
}

async function openElevation(points: ElevationPoint[], signal?: AbortSignal): Promise<Record<string, number>> {
  const body = {
    locations: points.map(({ lat, lng }) => ({ latitude: lat, longitude: lng })),
  };
  const response = await fetchWithTimeout(
    OPEN_ELEVATION_URL,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    signal,
  );
  if (!response.ok) throw new Error(`Open-Elevation returned ${response.status}`);
  const json = (await response.json()) as { results?: Array<{ elevation: number | null }> };
  if (!json.results) throw new Error('Malformed Open-Elevation response');

  const elevations: Record<string, number> = {};
  json.results.forEach((result, index) => {
    if (result.elevation !== null && result.elevation !== undefined) {
      elevations[points[index].id] = result.elevation;
    }
  });
  return elevations;
}

/** Fetch elevations (metres) for a set of points, keyed by point id. */
export async function fetchElevations(
  points: ElevationPoint[],
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  if (points.length === 0) return {};

  try {
    return await openTopoData(points, signal);
  } catch {
    if (signal?.aborted) return {};
    try {
      return await openElevation(points, signal);
    } catch {
      return {};
    }
  }
}
