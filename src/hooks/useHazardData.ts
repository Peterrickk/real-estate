import { useCallback, useEffect, useState } from 'react';
import { fetchElevations } from '../lib/hazards/elevation';
import { fetchRecentEarthquakes } from '../lib/hazards/usgs';
import type { EarthquakeEvent } from '../lib/hazards/types';
import type { Property } from '../modules/property-registry/types';

/**
 * Live hazard data for the dashboard:
 *  - USGS 30-day earthquake feed (real, keyless).
 *  - SRTM elevation per property (keyless, falls back to seeded values).
 *
 * Mirror of the `useWalletBalance` polling pattern, but fetched on demand
 * with a manual refresh instead of a fixed interval.
 */
export function useHazardData(properties: Property[]) {
  const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [elevations, setElevations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchRecentEarthquakes(controller.signal)
      .then((events) => {
        setEarthquakes(events);
        setError(null);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Earthquake feed unavailable');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [nonce]);

  useEffect(() => {
    const controller = new AbortController();
    if (properties.length === 0) return () => controller.abort();

    fetchElevations(
      properties.map((property) => ({ id: property.id, lat: property.lat, lng: property.lng })),
      controller.signal,
    ).then((result) => setElevations((current) => ({ ...current, ...result })));

    return () => controller.abort();
  }, [properties, nonce]);

  const refresh = useCallback(() => {
    setLoading(true);
    setNonce((current) => current + 1);
  }, []);

  return { earthquakes, elevations, loading, error, lastUpdated, refresh };
}
