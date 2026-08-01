import { useMemo, useState } from 'react';
import { PropertyMap } from '../../components/PropertyMap';
import { useAppData } from '../../context/AppDataContext';
import { filterByLocation, toMapProperty, type LocationSelection } from '../../lib/mapUtils';
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
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['registry', 'escrow']);

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

  const selectedProperty = data.properties.find((property) => property.id === selectedPropertyId);

  const records = useMemo(() => {
    const allRecords = data.transferHistory[selectedPropertyId] ?? [];
    return allRecords.filter((record) => {
      const source = record.source ?? 'registry';
      return selectedSources.includes(source);
    });
  }, [data.transferHistory, selectedPropertyId, selectedSources]);

  const ownedTokens = useMemo(
    () =>
      locationFilteredProperties.map((property) =>
        toMapProperty(property, property.tokenId || property.legalId),
      ),
    [locationFilteredProperties],
  );

  return (
    <section className="dashboard-page">
      <header className="page-intro">
        <h2>Ownership History</h2>
      </header>

      <div className="dashboard-grid">
        <aside className="filters-panel card">
          <h3>Filters</h3>
          <label className="filter-field">
            <span>Location</span>
            <select
              id="ownership-location"
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
          <PropertyMap
            title="Tokenized portfolio"
            properties={ownedTokens}
            center={locationSelection ?? undefined}
            highlightedId={selectedPropertyId}
          />
        </div>
      </div>
    </section>
  );
}
