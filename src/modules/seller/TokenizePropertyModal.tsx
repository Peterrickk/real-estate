import type { FormEvent } from 'react';
import type { Property } from '../property-registry/types';
import type { PropertyNFTMetadata } from '../../lib/tokens/types';
import { PropertyTokenService } from '../../lib/tokens/tokenService';

interface TokenizePropertyModalProps {
  property: Property;
  onSubmit: (tokenId: string) => void;
  onClose: () => void;
}

export function TokenizePropertyModal({
  property,
  onSubmit,
  onClose,
}: TokenizePropertyModalProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Collect property metadata for NFT
    const nftMetadata: PropertyNFTMetadata = {
      propertyId: property.id,
      propertyType: formData.get('propertyType') as string || 'residential',
      subtype: formData.get('subtype') as string || 'single_family',
      address: property.address,
      gpsCoordinates: {
        lat: property.lat,
        lng: property.lng,
      },
      lotArea: formData.get('lotArea') as string || property.size,
      floorArea: formData.get('floorArea') as string || property.size,
      bedrooms: Number(formData.get('bedrooms')) || 3,
      bathrooms: Number(formData.get('bathrooms')) || 2,
      garage: Number(formData.get('garage')) || 1,
      yearBuilt: Number(formData.get('yearBuilt')) || 2000,
      priceBCH: Number(formData.get('priceBCH')) || 1.0,
      sellerWallet: property.ownerPubkey,
      currentOwnerWallet: property.ownerPubkey,
      governmentTitleNumber: property.legalId,
      images: [], // Would be IPFS URIs in production
      blueprint: '', // Would be IPFS URI in production
      inspectionReport: '', // Would be IPFS URI in production
      status: 'For Sale',
    };

    try {
      // Initialize token service
      const tokenService = new PropertyTokenService({ network: 'testnet' });
      await tokenService.initializeWallet();

      // Mint the NFT
      const result = await tokenService.mintPropertyNFT(nftMetadata);

      onSubmit(result.tokenId);
      onClose();
    } catch (error) {
      console.error('Error minting property NFT:', error);
      alert('Failed to mint property NFT. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tokenize-property-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="tokenize-property-title">Tokenize Property as NFT</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="muted">{property.address}</p>
        <p className="muted">{property.size}</p>
        <p className="muted">Legal ID: {property.legalId}</p>

        <form className="offer-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Property Type
              <select name="propertyType" defaultValue="residential">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
            </label>

            <label>
              Subtype
              <select name="subtype" defaultValue="single_family">
                <option value="single_family">Single Family</option>
                <option value="multi_family">Multi Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </label>

            <label>
              Lot Area
              <input
                type="text"
                name="lotArea"
                defaultValue={property.size}
                placeholder="e.g., 2,400 sq ft"
              />
            </label>

            <label>
              Floor Area
              <input
                type="text"
                name="floorArea"
                defaultValue={property.size}
                placeholder="e.g., 2,400 sq ft"
              />
            </label>

            <label>
              Bedrooms
              <input type="number" name="bedrooms" defaultValue={3} min={0} />
            </label>

            <label>
              Bathrooms
              <input type="number" name="bathrooms" defaultValue={2} min={0} step={0.5} />
            </label>

            <label>
              Garage Spaces
              <input type="number" name="garage" defaultValue={1} min={0} />
            </label>

            <label>
              Year Built
              <input type="number" name="yearBuilt" defaultValue={2000} min={1800} max={2026} />
            </label>

            <label>
              Price (BCH)
              <input type="number" name="priceBCH" defaultValue={1.0} min={0} step={0.01} />
            </label>
          </div>

          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Mint Property NFT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}