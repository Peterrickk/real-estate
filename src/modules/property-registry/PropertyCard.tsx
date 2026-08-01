import type { Property } from './types';

interface PropertyCardProps {
  property: Property;
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Not listed';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="card property-card">
      <header className="card-header">
        <h3>{property.address}</h3>
        <span className={`badge ${property.tokenized ? 'badge-success' : 'badge-muted'}`}>
          {property.tokenized ? 'Tokenized' : 'Not tokenized'}
        </span>
      </header>
      <dl className="detail-list">
        <div>
          <dt>ID</dt>
          <dd>{property.id}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{property.size}</dd>
        </div>
        <div>
          <dt>Legal ID</dt>
          <dd>{property.legalId}</dd>
        </div>
        <div>
          <dt>Token ID</dt>
          <dd>{property.tokenId || '—'}</dd>
        </div>
        <div>
          <dt>Listed price</dt>
          <dd>{formatPrice(property.listedPrice)}</dd>
        </div>
        <div>
          <dt>Tokenized</dt>
          <dd>{property.dateTokenized || '—'}</dd>
        </div>
      </dl>
    </article>
  );
}
