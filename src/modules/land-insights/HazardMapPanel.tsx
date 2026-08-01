import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_TILE_URL,
  TERRAIN_ATTRIBUTION,
  TERRAIN_TILE_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_ZOOM_FOCUSED,
  computeMapCenter,
  type LatLng,
  type MapProperty,
} from '../../lib/mapUtils';
import type { EarthquakeEvent, PropertyHazardAssessment, RiskLevel } from '../../lib/hazards/types';
import { RISK_ORDER } from '../../lib/hazards/types';
import { RISK_COLORS } from '../../lib/hazards/colors';
import { RISK_LABEL } from '../../lib/valuation/riskAdjustedValuation';

type BaseLayer = 'streets' | 'satellite' | 'terrain';

const BASE_TILES: Record<BaseLayer, { url: string; attribution: string }> = {
  streets: { url: OSM_TILE_URL, attribution: OSM_ATTRIBUTION },
  satellite: { url: SATELLITE_TILE_URL, attribution: SATELLITE_ATTRIBUTION },
  terrain: { url: TERRAIN_TILE_URL, attribution: TERRAIN_ATTRIBUTION },
};

const BASE_LAYER_OPTIONS: Array<{ value: BaseLayer; label: string }> = [
  { value: 'streets', label: 'Streets' },
  { value: 'satellite', label: 'Satellite' },
  { value: 'terrain', label: 'Terrain' },
];

const FLOOD_TINT = '#3b7fbf';
const EARTHQUAKE_COLORS = [
  { min: 6, color: '#8b3a3a' },
  { min: 4.5, color: '#c05440' },
  { min: 3, color: '#d98a3b' },
  { min: 0, color: '#b8935f' },
];

function earthquakeColor(magnitude: number): string {
  const match = EARTHQUAKE_COLORS.find((band) => magnitude >= band.min);
  return match?.color ?? '#b8935f';
}

function earthquakeRadius(magnitude: number): number {
  return Math.min(28, 5 + magnitude * 1.6);
}

function MapRecenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center.lat, center.lng, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

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

interface HazardMapPanelProps {
  properties: MapProperty[];
  assessments: Record<string, PropertyHazardAssessment>;
  earthquakes: EarthquakeEvent[];
  center?: LatLng;
  highlightedId?: string | null;
  title?: string;
  /** True while live feeds are loading. */
  loading?: boolean;
  /** Live-feed error, if any. */
  error?: string | null;
}

export function HazardMapPanel({
  properties,
  assessments,
  earthquakes,
  center,
  highlightedId = null,
  title = 'Hazard & land history',
  loading = false,
  error = null,
}: HazardMapPanelProps) {
  const [baseLayer, setBaseLayer] = useState<BaseLayer>('streets');
  const [showSeismic, setShowSeismic] = useState(true);
  const [showFlood, setShowFlood] = useState(true);

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (properties.length === 0) return DEFAULT_MAP_CENTER;
    return computeMapCenter(properties);
  }, [center, properties]);

  const zoom = properties.length <= 1 ? DEFAULT_MAP_ZOOM_FOCUSED : DEFAULT_MAP_ZOOM;

  const floodProneProperties = useMemo(
    () =>
      properties.filter(
        (property) => RISK_ORDER[assessments[property.id]?.flood.risk ?? 'low'] > RISK_ORDER.low,
      ),
    [properties, assessments],
  );

  const floodRadiusFor = (risk: RiskLevel | undefined): number => {
    switch (risk) {
      case 'severe':
        return 42;
      case 'high':
        return 34;
      case 'moderate':
        return 26;
      default:
        return 0;
    }
  };

  return (
    <section className="property-map-shell card hazard-map-shell">
      <div className="property-map-shell__header">
        <div className="hazard-map-shell__heading">
          <p className="result-map__eyebrow">Live hazard map</p>
          <h3>{title}</h3>
        </div>
        <div className="map-layers" role="group" aria-label="Map base layer">
          {BASE_LAYER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`map-layer-toggle${baseLayer === option.value ? ' is-active' : ''}`}
              onClick={() => setBaseLayer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-layers map-layers--overlays" role="group" aria-label="Map overlays">
        <button
          type="button"
          className={`map-layer-toggle${showSeismic ? ' is-active' : ''}`}
          onClick={() => setShowSeismic((current) => !current)}
        >
          Live earthquakes
        </button>
        <button
          type="button"
          className={`map-layer-toggle${showFlood ? ' is-active' : ''}`}
          onClick={() => setShowFlood((current) => !current)}
        >
          Flood-prone zones
        </button>
        {loading && (
          <span className="map-layers__loading" role="status">
            Loading live data…
          </span>
        )}
      </div>

      <div className="property-map" aria-label={title}>
        {properties.length === 0 ? (
          <p className="empty-state property-map__empty">
            Select a tokenized property to see hazard data.
          </p>
        ) : (
          <div
            style={{
              height: '400px',
              width: '100%',
              overflow: 'hidden',
              borderRadius: '1.5rem',
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={zoom}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              className="property-map__leaflet"
            >
              <TileLayer
                attribution={BASE_TILES[baseLayer].attribution}
                url={BASE_TILES[baseLayer].url}
              />
              <MapRecenter center={mapCenter} zoom={zoom} />
              <MapSizeResolver />

              {showFlood &&
                floodProneProperties.map((property) => {
                  const assessment = assessments[property.id];
                  const radius = floodRadiusFor(assessment?.flood.risk);
                  return (
                    <CircleMarker
                      key={`flood-${property.id}`}
                      center={[property.lat, property.lng]}
                      radius={radius}
                      pathOptions={{
                        color: FLOOD_TINT,
                        weight: 1,
                        fillColor: FLOOD_TINT,
                        fillOpacity: 0.12,
                        interactive: false,
                      }}
                    />
                  );
                })}

              {showSeismic &&
                earthquakes.map((event) => (
                  <CircleMarker
                    key={event.id}
                    center={[event.lat, event.lng]}
                    radius={earthquakeRadius(event.magnitude)}
                    pathOptions={{
                      color: earthquakeColor(event.magnitude),
                      weight: 1,
                      fillColor: earthquakeColor(event.magnitude),
                      fillOpacity: 0.3,
                    }}
                  >
                    <Popup>
                      <strong>M{event.magnitude.toFixed(1)}</strong> — {event.place}
                      <br />
                      {new Date(event.time).toLocaleString()} · {event.depthKm.toFixed(0)} km deep
                      <br />
                      <a href={event.url} target="_blank" rel="noreferrer">
                        USGS event
                      </a>
                    </Popup>
                  </CircleMarker>
                ))}

              {properties.map((property) => {
                const assessment = assessments[property.id];
                const isHighlighted = highlightedId === property.id;
                return (
                  <CircleMarker
                    key={property.id}
                    center={[property.lat, property.lng]}
                    radius={isHighlighted ? 12 : 8}
                    pathOptions={{
                      color: '#fffdf9',
                      weight: isHighlighted ? 3 : 2,
                      fillColor: RISK_COLORS[assessment?.overall ?? 'low'],
                      fillOpacity: 0.75,
                    }}
                  >
                    <Popup>
                      <strong>{property.label}</strong>
                      <br />
                      Overall risk: <b>{RISK_LABEL[assessment?.overall ?? 'low']}</b>
                      <br />
                      Flood {RISK_LABEL[assessment?.flood.risk ?? 'low']} · Terrain{' '}
                      {RISK_LABEL[assessment?.terrain.relief ?? 'low']} · Seismic{' '}
                      {RISK_LABEL[assessment?.seismic.risk ?? 'low']}
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}

        <div className="hazard-legend" aria-label="Map legend">
          <p className="hazard-legend__title">Property risk</p>
          {(Object.keys(RISK_COLORS) as RiskLevel[]).map((level) => (
            <div key={level} className="hazard-legend__row">
              <span
                className="hazard-legend__swatch"
                style={{ background: RISK_COLORS[level] }}
              />
              {RISK_LABEL[level]}
            </div>
          ))}
          {showSeismic && (
            <>
              <p className="hazard-legend__title">Earthquakes (30 days)</p>
              {EARTHQUAKE_COLORS.map((band) => (
                <div key={band.min} className="hazard-legend__row">
                  <span
                    className="hazard-legend__swatch hazard-legend__swatch--halo"
                    style={{ background: band.color }}
                  />
                  M{band.min}+
                </div>
              ))}
            </>
          )}
          {showFlood && (
            <div className="hazard-legend__row">
              <span
                className="hazard-legend__swatch hazard-legend__swatch--halo"
                style={{ background: FLOOD_TINT }}
              />
              Flood-prone
            </div>
          )}
        </div>
      </div>

      <p className="map-note">
        Live USGS seismic feed · SRTM elevation via OpenTopoData · PhilSA Sentinel-1 flood path.
        {error && (
          <span className="map-note__error" role="status">
            {' '}
            Live feed unavailable: {error}
          </span>
        )}
      </p>
    </section>
  );
}
