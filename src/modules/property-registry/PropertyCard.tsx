import { Link } from 'react-router-dom';
import type { Property } from './types';

const propertyImages = [
  '/realestate1.jpg',
  '/realestate2.jpeg',
  '/realestate3.webp',
  '/realestate4.jpg',
  '/realestate6.jpeg',
  '/realestate7.jpg',
];

interface PropertyCardProps {
  property: Property;
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Not listed';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ property }: PropertyCardProps) {
  const statusLabel = property.listedPrice !== null ? 'For Sale' : property.tokenized ? 'Off Market' : 'Unlisted';
  const imageIndex = Math.abs(property.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % propertyImages.length;
  const imageUrl = propertyImages[imageIndex];

  return (
    <Link
      to="/login"
      className="property-card nft-property-card"
      aria-label={`${property.address} — sign in or create an account to view full details`}
    >
      <div className="property-card__media nft-card__media">
        <img className="property-card__image nft-card__image" src={imageUrl} alt={property.address} />
        <div className="nft-card__badges">
          <span className="nft-badge nft-badge--primary">🏠 LAND TITLE NFT</span>
          {property.tokenized && <span className="nft-badge nft-badge--verified">✓ Verified</span>}
        </div>
        <span className="property-card__status">{statusLabel}</span>
      </div>

      <div className="property-card__body nft-card__body">
        <div className="nft-card__header">
          <div className="nft-card__identity">
            <span className="nft-card__token-id">#{property.nftTokenId || property.tokenId}</span>
            {property.certificateNumber && (
              <span className="nft-card__certificate-id">Cert: {property.certificateNumber}</span>
            )}
          </div>
          <div className="nft-card__flags">
            <span className="flag-flag">🇵🇭</span>
            <span className="bch-logo">BCH</span>
          </div>
        </div>
        <h3 className="property-card__address nft-card__property-name">{property.address}</h3>
        <p className="property-card__price">{formatPrice(property.listedPrice)}</p>
        {property.propertyType && (
          <p className="muted" style={{fontSize: '0.8rem', marginTop: '0.3rem'}}>{property.propertyType}</p>
        )}
      </div>
    </Link>
  );
}