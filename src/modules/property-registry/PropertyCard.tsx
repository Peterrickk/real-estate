import type { Property } from './types';
import heroImage from '../../assets/hero.png';

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
  const statusLabel = property.listedPrice !== null ? 'For Sale' : property.tokenized ? 'Off Market' : 'Unlisted';

  return (
    <article className="property-card">
      <div className="property-card__media">
        <img className="property-card__image" src={heroImage} alt={property.address} />
        <span className="property-card__status">{statusLabel}</span>
      </div>

      <div className="property-card__body">
        <h3 className="property-card__address">{property.address}</h3>
        <p className="property-card__price">{formatPrice(property.listedPrice)}</p>
      </div>
    </article>
  );
}
