import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_ZOOM_FOCUSED,
  computeMapCenter,
  type LatLng,
  type MapProperty,
} from '../lib/mapUtils';

// Fix Leaflet default marker icons - ensure proper centering
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // bottom-center of the pin graphic
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

// Helper component to trigger invalidateSize after map loads
function MapSizeResolver() {
  const map = useMap();
  const ref = useRef(false);

  useEffect(() => {
    if (!ref.current) {
      map.whenReady(() => {
        map.invalidateSize();
        ref.current = true;
      });
    }
  }, [map]);

  return null;
}

interface PropertyMapProps {
  properties: MapProperty[];
  center?: LatLng;
  title?: string;
  highlightedId?: string | null;
  emptyMessage?: string;
}

export function PropertyMap({
  properties,
  center,
  title = 'Property map',
  highlightedId = null,
  emptyMessage = 'No visible results for the current filters.',
}: PropertyMapProps) {
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (properties.length === 0) return DEFAULT_MAP_CENTER;
    return computeMapCenter(properties);
  }, [center, properties]);

  const zoom = properties.length <= 1 ? DEFAULT_MAP_ZOOM_FOCUSED : DEFAULT_MAP_ZOOM;

  return (
    <section className="property-map-shell card">
      <div className="property-map-shell__header">
        <p className="result-map__eyebrow">Live map</p>
        <h3>{title}</h3>
      </div>

      <div className="property-map" aria-label={title}>
        {properties.length === 0 ? (
          <p className="empty-state property-map__empty">{emptyMessage}</p>
        ) : (
          // Container with explicit height and overflow hidden
          <div
            style={{
              height: '400px',
              width: '100%',
              overflow: 'hidden',
              borderRadius: '1.5rem', // Match card border-radius
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={zoom}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              className="property-map__leaflet"
            >
              <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
              <MapRecenter center={mapCenter} zoom={zoom} />
              <MapSizeResolver />
              {properties.map((property) => (
                <Marker
                  key={property.id}
                  position={[property.lat, property.lng]}
                  opacity={highlightedId && highlightedId !== property.id ? 0.55 : 1}
                >
                  <Popup>{property.label}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </section>
  );
}
