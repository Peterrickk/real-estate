import { useMemo, useState } from 'react';
import { ResultMap } from '../../components/ResultMap';
import { useAppData } from '../../context/AppDataContext';
import { PriceHistoryChart } from './PriceHistoryChart';
import { ValuationSummaryCard } from './ValuationSummaryCard';

const sourceFilters = [
  { value: 'appraisal', label: 'Appraisal points' },
  { value: 'escrow', label: 'Escrow-fed points' },
]

function toggleFilterValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function LandInsightsPage() {
  const { data } = useAppData();
  const tokenizedProperties = data.properties.filter((property) => property.tokenized);
  const [selectedPropertyId, setSelectedPropertyId] = useState(tokenizedProperties[0]?.id ?? '');
  const [selectedSources, setSelectedSources] = useState<string[]>(['appraisal', 'escrow']);

  const priceHistory = useMemo(() => {
    const allPoints = data.priceHistory[selectedPropertyId] ?? [];
    return allPoints.filter((point) => {
      const source = point.source ?? 'appraisal';
      return selectedSources.includes(source);
    });
  }, [data.priceHistory, selectedPropertyId, selectedSources]);

  const valuation = data.valuationSummaries[selectedPropertyId];
  const selectedProperty = data.properties.find((property) => property.id === selectedPropertyId);

  const mapItems = tokenizedProperties.map((property) => ({
    id: property.id,
    title: property.address,
    subtitle: property.size,
    highlighted: property.id === selectedPropertyId,
  }));

  return (
    <section className="dashboard-page">
      <header className="page-intro">
        <p className="section-heading__eyebrow">Operations view</p>
        <h2>Land Insights</h2>
        <p>Valuation context, price history, and a live property map in one working surface.</p>
      </header>

      <div className="dashboard-grid">
        <aside className="filters-panel card">
          <h3>Filters</h3>
          <label className="filter-field">
            <span>Property</span>
            <select
              id="insights-property-select"
              value={selectedPropertyId}
              onChange={(event) => setSelectedPropertyId(event.target.value)}
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
            <p className="muted">Historical pricing and valuation for the active asset.</p>
          </div>

          <div className="insights-stack">
            {valuation && <ValuationSummaryCard summary={valuation} />}
            <article className="card chart-card">
              <h3>Price History</h3>
              <PriceHistoryChart data={priceHistory} />
            </article>
          </div>
        </div>

        <div className="map-panel">
          <ResultMap
            title="Tokenized portfolio"
            description="Use the map to orient the selected asset against the rest of the portfolio."
            items={mapItems}
          />
        </div>
      </div>
    </section>
  );
}