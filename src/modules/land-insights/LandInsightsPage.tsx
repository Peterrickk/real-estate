import { useState } from 'react';
import {
  mockProperties,
  mockPriceHistory,
  mockValuationSummaries,
} from '../../data/mockProperties';
import { PriceHistoryChart } from './PriceHistoryChart';
import { ValuationSummaryCard } from './ValuationSummaryCard';

export function LandInsightsPage() {
  const tokenizedProperties = mockProperties.filter((p) => p.tokenized);
  const [selectedPropertyId, setSelectedPropertyId] = useState(tokenizedProperties[0]?.id ?? '');

  const priceHistory = mockPriceHistory[selectedPropertyId] ?? [];
  const valuation = mockValuationSummaries[selectedPropertyId];
  const selectedProperty = mockProperties.find((p) => p.id === selectedPropertyId);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Land Valuation &amp; Investor Insights</h1>
        <p>Historical pricing data to help investors assess fair market value.</p>
      </header>

      <div className="filter-bar">
        <label htmlFor="insights-property-select">Property</label>
        <select
          id="insights-property-select"
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
        >
          {tokenizedProperties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      {selectedProperty && (
        <p className="muted">
          {selectedProperty.size} · {selectedProperty.address}
        </p>
      )}

      <div className="insights-layout">
        {valuation && <ValuationSummaryCard summary={valuation} />}
        <article className="card chart-card">
          <h3>Price History</h3>
          <PriceHistoryChart data={priceHistory} />
        </article>
      </div>
    </section>
  );
}
