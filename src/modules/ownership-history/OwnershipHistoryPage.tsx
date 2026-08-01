import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { TransferRecordRow } from './TransferRecord';

export function OwnershipHistoryPage() {
  const { data } = useAppData();
  const tokenizedProperties = data.properties.filter((property) => property.tokenized);
  const [selectedPropertyId, setSelectedPropertyId] = useState(tokenizedProperties[0]?.id ?? '');

  const records = data.transferHistory[selectedPropertyId] ?? [];
  const selectedProperty = data.properties.find((property) => property.id === selectedPropertyId);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Ownership &amp; Transfer History</h1>
        <p>Chain-of-custody record for tokenized property assets.</p>
      </header>

      <div className="filter-bar">
        <label htmlFor="property-select">Property</label>
        <select
          id="property-select"
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
          Token <code>{selectedProperty.tokenId}</code> · Legal ID {selectedProperty.legalId}
        </p>
      )}

      <div className="transfer-list">
        {records.length === 0 ? (
          <p className="empty-state">No transfer history for this property.</p>
        ) : (
          records.map((record) => <TransferRecordRow key={record.id} record={record} />)
        )}
      </div>
    </section>
  );
}
