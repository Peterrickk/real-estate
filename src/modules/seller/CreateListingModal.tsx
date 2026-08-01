import type { FormEvent } from 'react';
import type { Property } from '../property-registry/types';

interface CreateListingModalProps {
  properties: Property[];
  defaultPropertyId?: string;
  onSubmit: (propertyId: string, askingPrice: number) => void;
  onClose: () => void;
}

export function CreateListingModal({
  properties,
  defaultPropertyId,
  onSubmit,
  onClose,
}: CreateListingModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const propertyId = String(formData.get('propertyId'));
    const askingPrice = Number(formData.get('askingPrice'));

    if (!propertyId || !Number.isFinite(askingPrice) || askingPrice <= 0) return;

    onSubmit(propertyId, askingPrice);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-listing-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="create-listing-title">Create Listing</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="muted">Choose a tokenized property and set an asking price for the marketplace.</p>

        <form className="offer-form" onSubmit={handleSubmit}>
          <label>
            Property
            <select
              name="propertyId"
              required
              defaultValue={defaultPropertyId ?? properties[0]?.id ?? ''}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address} · {property.size}
                </option>
              ))}
            </select>
          </label>
          <label>
            Asking price (USD)
            <input type="number" name="askingPrice" defaultValue={485_000} min={0} required />
          </label>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
