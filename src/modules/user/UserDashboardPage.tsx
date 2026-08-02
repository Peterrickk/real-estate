import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import type { Property } from '../property-registry/types';
import { CreateListingModal } from '../seller/CreateListingModal';
import { ListPropertyModal } from '../seller/ListPropertyModal';
import { formatPrice } from '../seller/types';

type ListingModalState = { mode: 'edit'; property: Property; listingId: string; currentPrice: number };

function CollectionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function UserDashboardPage() {
  const {
    getUserProperties,
    getUserListings,
    createListing,
    updateListingPrice,
    delistProperty,
  } = useAppData();
  const { showToast } = useToast();
  const [listingModal, setListingModal] = useState<ListingModalState | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForPropertyId, setCreateForPropertyId] = useState<string | undefined>();

  const userProperties = getUserProperties();
  const userListings = getUserListings();

  const unlistedProperties = useMemo(
    () =>
      userProperties.filter(
        (property) =>
          property.tokenized &&
          !userListings.some((listing) => listing.propertyId === property.id),
      ),
    [userProperties, userListings],
  );

  const getListingForProperty = (propertyId: string) =>
    userListings.find((listing) => listing.propertyId === propertyId);

  const openCreateModal = (propertyId?: string) => {
    setCreateForPropertyId(propertyId);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForPropertyId(undefined);
  };

  const handleCreateListing = (propertyId: string, askingPrice: number) => {
    const property = userProperties.find((item) => item.id === propertyId);
    const created = createListing(propertyId, askingPrice);
    showToast(
      created
        ? `${property?.address ?? 'Property'} listed for ${formatPrice(askingPrice)}.`
        : 'Unable to create listing.',
      created ? 'success' : 'info',
    );
  };

  const handleListSubmit = (askingPrice: number) => {
    if (!listingModal) return;

    const updated = updateListingPrice(listingModal.listingId, askingPrice);
    showToast(
      updated ? 'Listing price updated.' : 'Unable to update listing.',
      updated ? 'success' : 'info',
    );
  };

  const handleDelist = (listingId: string, address: string) => {
    const removed = delistProperty(listingId);
    showToast(
      removed ? `${address} delisted.` : 'Unable to delist property.',
      removed ? 'success' : 'info',
    );
  };

  const propertyImages = [
    '/realestate1.jpg',
    '/realestate2.jpeg',
    '/realestate3.webp',
    '/realestate4.jpg',
    '/realestate6.jpeg',
    '/realestate7.jpg',
  ];

  return (
    <section className="dashboard-page user-dashboard">
      <header className="page-intro">
        <h2>My NFT Collection</h2>
        <p className="muted">
          Manage your digital real estate NFTs and list them for sale on the marketplace.
        </p>
      </header>

      <div className="user-stats">
        <article className="user-stat-card">
          <div className="stat-content">
            <p className="stat-label">Total Properties</p>
            <p className="stat-value">{userProperties.length}</p>
          </div>
        </article>
        <article className="user-stat-card">
          <div className="stat-content">
            <p className="stat-label">NFT Collection</p>
            <p className="stat-value">{userProperties.filter(p => p.tokenized).length}</p>
          </div>
        </article>
        <article className="user-stat-card">
          <div className="stat-content">
            <p className="stat-label">Listed for Sale</p>
            <p className="stat-value">{userListings.length}</p>
          </div>
        </article>
      </div>

      <section className="user-section user-section--collection">
        <div className="user-section__header">
          <h3>My NFT Properties</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={unlistedProperties.length === 0}
            onClick={() => openCreateModal()}
          >
            List for Sale
          </button>
        </div>
        {unlistedProperties.length === 0 && userListings.length > 0 && (
          <p className="muted user-section__hint">
            All your tokenized properties are listed. Delist one to create a new listing.
          </p>
        )}
        {userProperties.length === 0 ? (
          <EmptyState
            icon={<CollectionIcon />}
            title="No NFTs yet"
            hint="Properties you purchase will appear here as NFTs in your collection."
          />
        ) : (
          <div className="nft-collection-grid">
            {userProperties.map((property) => {
              const listing = getListingForProperty(property.id);
              const isListed = Boolean(listing);
              const imageIndex = Math.abs(property.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % propertyImages.length;
              const imageUrl = propertyImages[imageIndex];

              return (
                <article key={property.id} className="nft-collection-card">
                  <div className="nft-card__media">
                    <img className="nft-card__image" src={imageUrl} alt={property.address} />
                    <div className="nft-card__badges">
                      <span className="nft-badge nft-badge--primary">LAND TITLE NFT</span>
                      <span className="nft-badge nft-badge--verified">Verified Property</span>
                      <span className="nft-badge nft-badge--blockchain">CashTokens NFT</span>
                    </div>
                    {isListed && (
                      <div className="nft-card__listed-badge">
                        <span className="listed-badge">Listed for Sale</span>
                      </div>
                    )}
                  </div>

                  <div className="nft-card__body">
                    <div className="nft-card__header">
                      <div className="nft-card__identity">
                        <span className="nft-card__token-id">#{property.nftTokenId || property.tokenId}</span>
                        <span className="nft-card__certificate-id">Cert: {property.certificateNumber || 'N/A'}</span>
                      </div>
                      <div className="nft-card__flags">
                        <span className="flag-flag">🇵🇭</span>
                        <span className="bch-logo">BCH</span>
                      </div>
                    </div>

                    <h3 className="nft-card__property-name">{property.propertyType || 'Property'}</h3>
                    <p className="nft-card__address">{property.address}</p>

                    <div className="nft-card__details">
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Type</span>
                        <span className="nft-detail-value">{property.propertyType || 'N/A'}</span>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Lot Size</span>
                        <span className="nft-detail-value">{property.size}</span>
                      </div>
                      {property.floorArea && (
                        <div className="nft-detail-item">
                          <span className="nft-detail-label">Floor Area</span>
                          <span className="nft-detail-value">{property.floorArea}</span>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="nft-detail-item">
                          <span className="nft-detail-label">Bedrooms</span>
                          <span className="nft-detail-value">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="nft-detail-item">
                          <span className="nft-detail-label">Bathrooms</span>
                          <span className="nft-detail-value">{property.bathrooms}</span>
                        </div>
                      )}
                    </div>

                    <div className="nft-card__ownership">
                      <h4 className="ownership-title">Digital Ownership</h4>
                      <ul className="ownership-list">
                        <li>CashTokens NFT Land Certificate</li>
                        <li>Transferable Ownership NFT</li>
                        <li>Property Metadata</li>
                        <li>Ownership History</li>
                        <li>Blockchain Verification</li>
                      </ul>
                    </div>

                    {isListed && listing && (
                      <div className="nft-card__price-section">
                        <div className="price-display">
                          <span className="price-label">Listed Price</span>
                          <span className="price-value">{formatPrice(listing.askingPrice)}</span>
                        </div>
                      </div>
                    )}

                    <div className="nft-card__actions">
                      {!isListed && property.tokenized && (
                        <button
                          type="button"
                          className="btn btn-primary nft-btn-list"
                          onClick={() => openCreateModal(property.id)}
                        >
                          List for Sale
                        </button>
                      )}
                      {isListed && listing && (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary nft-btn-edit"
                            onClick={() =>
                              setListingModal({
                                mode: 'edit',
                                property,
                                listingId: listing.id,
                                currentPrice: listing.askingPrice,
                              })
                            }
                          >
                            Edit Price
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary nft-btn-delist"
                            onClick={() => handleDelist(listing.id, property.address)}
                          >
                            Delist
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showCreateModal && unlistedProperties.length > 0 && (
        <CreateListingModal
          properties={unlistedProperties}
          defaultPropertyId={createForPropertyId}
          onSubmit={handleCreateListing}
          onClose={closeCreateModal}
        />
      )}

      {listingModal && (
        <ListPropertyModal
          property={listingModal.property}
          initialPrice={listingModal.currentPrice}
          title="Edit Listing Price"
          submitLabel="Save price"
          onSubmit={handleListSubmit}
          onClose={() => setListingModal(null)}
        />
      )}
    </section>
  );
}
