export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapProperty {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

/** Selected place from location selection (for filtering). */
export interface LocationSelection {
  address: string;
  lat: number;
  lng: number;
}

export const DEFAULT_MAP_CENTER: LatLng = { lat: 33.5, lng: -98.0 };

export const DEFAULT_MAP_ZOOM = 4;

export const DEFAULT_MAP_ZOOM_FOCUSED = 11;

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function computeMapCenter(properties: LatLng[]): LatLng {
  if (properties.length === 0) return DEFAULT_MAP_CENTER;

  const totals = properties.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: totals.lat / properties.length,
    lng: totals.lng / properties.length,
  };
}

export function toMapProperty(
  item: { id: string; lat: number; lng: number; address: string },
  label?: string,
): MapProperty {
  return {
    id: item.id,
    lat: item.lat,
    lng: item.lng,
    label: label ?? item.address,
  };
}

/** Haversine distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

/** Filter items by distance from a selected location. */
export function filterByLocation<T extends LatLng>(
  items: T[],
  selection: LocationSelection | null,
  radiusKm = 120,
): T[] {
  if (!selection) return items;
  return items.filter((item) => distanceKm(selection, item) <= radiusKm);
}

/** Extract city/state from a full address string. */
export function getLocationFromAddress(address: string): string {
  return address.split(', ').slice(1).join(', ');
}

export function uniqueLocations(addresses: string[]): string[] {
  return Array.from(new Set(addresses.map(getLocationFromAddress))).sort();
}
