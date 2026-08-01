import type { FormEvent } from 'react';
import type { Property } from '../property-registry/types';
import { formatPrice } from './types';

interface ListPropertyModalProps {
  property: Property;
  initialPrice?: number;
  title: string;
  submitLabel: string;
  onSubmit: (askingPrice: number) => void;
  onClose: () => void;
}

export function ListPropertyModal({
  property,
  initialPrice,
  title,
  submitLabel,
  onSubmit,
  onClose,
}: ListPropertyModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const askingPrice = Number(formData.get('askingPrice'));

    if (!Number.isFinite(askingPrice) || askingPrice <= 0) return;

    onSubmit(askingPrice);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-property-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="list-property-title">{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="muted">{property.address}</p>
        <p className="muted">{property.size}</p>
        {initialPrice !== undefined && (
          <p>
            Current price: <strong>{formatPrice(initialPrice)}</strong>
          </p>
        )}

        <form className="offer-form" onSubmit={handleSubmit}>
          <label>
            Asking price (USD)
            <input
              type="number"
              name="askingPrice"
              defaultValue={initialPrice ?? 500_000}
              min={0}
              required
            />
          </label>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
