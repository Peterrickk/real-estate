import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyMap } from '../../components/PropertyMap';
import { useAppData } from '../../context/AppDataContext';
import { useHazardData } from '../../hooks/useHazardData';
import { assessPropertyHazard } from '../../lib/hazards/assess';
import { earthquakesNear } from '../../lib/hazards/usgs';
import type { PropertyHazardAssessment } from '../../lib/hazards/types';
import { filterByLocation, toMapProperty, type LocationSelection } from '../../lib/mapUtils';
import { HazardMapPanel } from './HazardMapPanel';
import { LandHistoryPanel } from './LandHistoryPanel';
import { PriceHistoryChart } from './PriceHistoryChart';
import { RiskAdjustedValuationCard } from './RiskAdjustedValuationCard';
import { ValuationSummaryCard } from './ValuationSummaryCard';

const sourceFilters = [
  { value: 'appraisal', label: 'Appraisal points' },
  { value: 'escrow', label: 'Escrow-fed points' },
];

function toggleFilterValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function LandInsightsPage() {
  const { data } = useAppData();
  const tokenizedProperties = useMemo(
    () => data.properties.filter((property) => property.tokenized),
    [data.properties],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyParam = searchParams.get('property');
  const paramPropertyId =
    propertyParam && tokenizedProperties.some((property) => property.id === propertyParam)
      ? propertyParam
      : null;
  const [localPropertyId, setLocalPropertyId] = useState(tokenizedProperties[0]?.id ?? '');
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['appraisal', 'escrow']);
  const [activeSignals, setActiveSignals] = useState<Record<string, boolean>>({});

  // A `?property=` param (arriving from a marketplace card) takes precedence.
  const selectedPropertyId = paramPropertyId ?? localPropertyId;

  const handlePropertyChange = (id: string) => {
    setLocalPropertyId(id);
    setSearchParams(id ? { property: id } : {}, { replace: true });
  };

  const { earthquakes, elevations, loading, error, lastUpdated, refresh } =
    useHazardData(tokenizedProperties);

  // Get location options from tokenized properties
  const locationOptions = useMemo(() => {
    const locations = tokenizedProperties.map(prop => ({
      address: prop.address,
      lat: prop.lat,
      lng: prop.lng
    }));
    // Add "All Locations" option at the beginning
    return [
      { address: 'All Locations', lat: 0, lng: 0 }, // This will be handled specially
      ...locations
    ];
  }, [tokenizedProperties]);

  const locationFilteredProperties = useMemo(
    () => filterByLocation(tokenizedProperties, locationSelection),
    [tokenizedProperties, locationSelection],
  );

  const priceHistory = useMemo(() => {
    const allPoints = data.priceHistory[selectedPropertyId] ?? [];
    return allPoints.filter((point) => {
      const source = point.source ?? 'appraisal';
      return selectedSources.includes(source);
    });
  }, [data.priceHistory, selectedPropertyId, selectedSources]);

  const valuation = data.valuationSummaries[selectedPropertyId];
  const selectedProperty = data.properties.find((property) => property.id === selectedPropertyId);

  const comparableProperties = useMemo(
    () => locationFilteredProperties.map((property) => toMapProperty(property, property.size)),
    [locationFilteredProperties],
  );

  // Live hazard assessments for every tokenized property.
  const assessments = useMemo(() => {
    const map: Record<string, PropertyHazardAssessment> = {};
    for (const property of tokenizedProperties) {
      map[property.id] = assessPropertyHazard(property, elevations, earthquakes);
    }
    return map;
  }, [tokenizedProperties, elevations, earthquakes]);

  const selectedAssessment = selectedPropertyId ? (assessments[selectedPropertyId] ?? null) : null;

  const nearbyEarthquakes = useMemo(() => {
    if (!selectedProperty) return [];
    return earthquakesNear(earthquakes, selectedProperty).map(({ event, distanceKm }) => ({
      ...event,
      distanceKm,
    }));
  }, [earthquakes, selectedProperty]);

  // Only development signals the user left active feed the valuation engine.
  const valuationAssessment = useMemo(() => {
    if (!selectedAssessment) return null;
    const development = selectedAssessment.development.filter(
      (signal) => activeSignals[`${selectedAssessment.propertyId}:${signal.label}`] ?? true,
    );
    return development.length === selectedAssessment.development.length
      ? selectedAssessment
      : { ...selectedAssessment, development };
  }, [selectedAssessment, activeSignals]);

  const baseValue = valuation?.currentEstimatedValue ?? selectedProperty?.listedPrice ?? 0;

  const toggleSignal = (propertyId: string, label: string) => {
    const key = `${propertyId}:${label}`;
    setActiveSignals((current) => ({ ...current, [key]: !(current[key] ?? true) }));
  };

  return (
    <section className="dashboard-page">
      <header className="page-intro">
        <h2>Land Insights</h2>
      </header>

      <div className="dashboard-grid">
        <aside className="filters-panel card">
          <h3>Filters</h3>
          <label className="filter-field">
            <span>Location</span>
            <select
              id="insights-location"
              value={locationSelection?.address || 'All Locations'}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'All Locations') {
                  setLocationSelection(null);
                } else {
                  const selectedLocation = locationOptions.find(
                    loc => loc.address === selectedValue
                  );
                  setLocationSelection(selectedLocation || null);
                }
              }}
            >
              <option value="All Locations">All Locations</option>
              {locationOptions
                .filter(opt => opt.address !== 'All Locations')
                .map(option => (
                  <option key={option.address} value={option.address}>
                    {option.address}
                  </option>
                ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Property</span>
            <select
              id="insights-property-select"
              value={selectedPropertyId}
              onChange={(event) => handlePropertyChange(event.target.value)}
            >
              {tokenizedProperties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <div className="filter-group">
            <span>Series</span>
            <div className="checkbox-list">
              {sourceFilters.map((option) => (
                <label key={option.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(option.value)}
                    onChange={() =>
                      setSelectedSources((current) => toggleFilterValue(current, option.value))
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {selectedProperty && (
            <div className="filter-summary">
              <p className="muted">
                <span className="property-address property-address--inline">
                  {selectedProperty.address}
                </span>
              </p>
              <p className="ledger-data ledger-data--brass">{selectedProperty.size}</p>
            </div>
          )}
        </aside>

        <div className="results-panel results-panel--insights">
          <div className="results-panel__header">
            <h3>{selectedProperty?.address ?? 'Selected property'}</h3>
          </div>

          <div className="insights-stack">
            {valuation && <ValuationSummaryCard summary={valuation} />}
            <RiskAdjustedValuationCard
              baseValue={baseValue}
              assessment={valuationAssessment}
            />
            <article className="card chart-card">
              <h3>Price History</h3>
              <PriceHistoryChart data={priceHistory} />
            </article>
            <LandHistoryPanel
              property={selectedProperty ?? null}
              assessment={selectedAssessment}
              nearbyEarthquakes={nearbyEarthquakes}
              activeSignals={activeSignals}
              onToggleSignal={toggleSignal}
              lastUpdated={lastUpdated}
              loading={loading}
              onRefresh={refresh}
            />
          </div>
        </div>

        <div className="map-panel">
          <HazardMapPanel
            title="Hazard & land history"
            properties={comparableProperties}
            assessments={assessments}
            earthquakes={earthquakes}
            center={locationSelection ?? undefined}
            highlightedId={selectedPropertyId}
            loading={loading}
            error={error}
          />
          <PropertyMap
            title="Comparable properties"
            properties={comparableProperties}
            center={locationSelection ?? undefined}
            highlightedId={selectedPropertyId}
          />
        </div>
      </div>
    </section>
  );
}
