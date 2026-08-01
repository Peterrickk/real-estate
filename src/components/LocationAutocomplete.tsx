import { useMemo } from 'react';
import type { LocationSelection } from '../../lib/mapUtils';

interface LocationAutocompleteProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  // Additional prop for location options - in a real app this would come from context/store
  locations?: { address: string; lat: number; lng: number }[];
}

export function LocationAutocomplete({
  id = 'location-autocomplete',
  label = 'Location',
  placeholder = 'Select location...',
  value,
  onChange,
  locations,
}: LocationAutocompleteProps) {
  // Create location options from the locations prop
  const options = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    return locations.map(loc => ({
      label: loc.address,
      value: loc,
    }));
  }, [locations]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange(null);
    } else {
      const selectedLoc = locations?.find(loc => loc.address === selectedValue);
      if (selectedLoc) {
        onSelected(selectedLoc);
      }
    }
  };

  const onSelected = (location: { address: string; lat: number; lng: number }) => {
    onChange({
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    });
  };

  const handleClear = () => {
    onChange(null);
    // Reset select to placeholder
    const select = document.getElementById(id) as HTMLSelectElement | null;
    if (select) select.value = '';
  };

  return (
    <label className="filter-field">
      <span>{label}</span>
      <select
        id={id}
        value={value?.address ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="location-autocomplete"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value.address} value={option.value.address}>
            {option.label}
          </option>
        ))}
      </select>
      {value && (
        <div className="location-autocomplete__selection">
          <p className="muted">{value.address}</p>
          <p className="ledger-data ledger-data--brass">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
            Clear location
          </button>
        </div>
      )}
    </label>
  );
}
