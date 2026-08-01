import { useMemo, useState } from 'react';
import { ResultMap } from '../../components/ResultMap';
import { useAppData } from '../../context/AppDataContext';
import { TransferRecordRow } from './TransferRecord';

const sourceFilters = [
  { value: 'registry', label: 'Registry records' },
  { value: 'escrow', label: 'Escrow-fed records' },
];

function toggleFilterValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function OwnershipHistoryPage() {
  const { data } = useAppData();
  const tokenizedProperties = data.properties.filter((property) => property.tokenized);
  const [selectedPropertyId, setSelectedPropertyId] = useState(tokenizedProperties[0]?.id ?? '');
  const [selectedSources, setSelectedSources] = useState<string[]>(['registry', 'escrow']);

  const selectedProperty = data.properties.find((property) => property.id === selectedPropertyId);

  const records = useMemo(() => {
    const allRecords = data.transferHistory[selectedPropertyId] ?? [];
    return allRecords.filter((record) => {
      const source = record.source ?? 'registry';
      return selectedSources.includes(source);
    });
  }, [data.transferHistory, selectedPropertyId, selectedSources]);

  const mapItems = tokenizedProperties.map((property) => ({
    id: property.id,
    title: property.address,
    subtitle: property.tokenId || property.legalId,
    highlighted: property.id === selectedPropertyId,
  }));

  return (
    <section className="dashboard-page">
      <header className="page-intro">
        <h2>Ownership History</h2>
      </header>

      <div className="dashboard-grid">
        <aside className="filters-panel card">
          <h3>Filters</h3>
          <label className="filter-field">
            <span>Property</span>
            <select
              id="property-select"
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
            <span>Source</span>
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
              <p className="muted">Token {selectedProperty.tokenId}</p>
              <p className="ledger-data ledger-data--brass">Legal ID {selectedProperty.legalId}</p>
            </div>
          )}
        </aside>

        <div className="results-panel">
          <div className="results-panel__header">
            <h3>{records.length} transfer records</h3>
          </div>

          <div className="transfer-list">
            {records.length === 0 ? (
              <p className="empty-state">No transfer history for this property.</p>
            ) : (
              records.map((record) => <TransferRecordRow key={record.id} record={record} />)
            )}
          </div>
        </div>

        <div className="map-panel">
          <ResultMap
            title="Tokenized portfolio"
            items={mapItems}
          />
        </div>
      </div>
    </section>
  );
}