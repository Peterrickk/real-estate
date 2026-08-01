import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import type { Property } from '../property-registry/types';
import { CreateListingModal } from './CreateListingModal';
import { ListPropertyModal } from './ListPropertyModal';
<<<<<<< HEAD
=======
import { TokenizePropertyModal } from './TokenizePropertyModal';
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
import { OfferReviewCard } from './OfferReviewCard';
import { SellerEscrowCard } from './SellerEscrowCard';
import { formatPrice } from './types';

type ListingModalState = { mode: 'edit'; property: Property; listingId: string; currentPrice: number };
<<<<<<< HEAD
=======
type TokenizeModalState = { property: Property } | null;
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31

function PropertiesIcon() {
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
      <path d="M3 21h18" />
      <path d="M5 21V7.62L12 3l7 4.62V21" />
      <path d="M9.5 21v-5h5v5" />
    </svg>
  );
}

function InboxIcon() {
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
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function EscrowIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 11.5l2 2 4-4" />
    </svg>
  );
}

export function SellerDashboardPage() {
  const {
    data,
    getSellerProperties,
    getSellerListings,
    getSellerOffers,
    getSellerEscrows,
    createListing,
    updateListingPrice,
    delistProperty,
    respondToOffer,
    resolveEscrow,
  } = useAppData();
  const { showToast } = useToast();
  const [listingModal, setListingModal] = useState<ListingModalState | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForPropertyId, setCreateForPropertyId] = useState<string | undefined>();
<<<<<<< HEAD
=======
  const [tokenizeModal, setTokenizeModal] = useState<TokenizeModalState>(null);
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31

  const sellerProperties = getSellerProperties();
  const sellerListings = getSellerListings();
  const sellerOffers = getSellerOffers();
  const sellerEscrows = getSellerEscrows();

  const unlistedProperties = useMemo(
    () =>
      sellerProperties.filter(
        (property) =>
          property.tokenized &&
          !sellerListings.some((listing) => listing.propertyId === property.id),
      ),
    [sellerProperties, sellerListings],
  );

  const getListingForProperty = (propertyId: string) =>
    sellerListings.find((listing) => listing.propertyId === propertyId);

  const openCreateModal = (propertyId?: string) => {
    setCreateForPropertyId(propertyId);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForPropertyId(undefined);
  };

  const handleCreateListing = (propertyId: string, askingPrice: number) => {
    const property = sellerProperties.find((item) => item.id === propertyId);
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

  const handleAcceptOffer = async (offerId: string, address: string) => {
    const accepted = await respondToOffer(offerId, 'accepted');
    showToast(
      accepted ? `Offer accepted for ${address}. Escrow created.` : 'Unable to accept offer.',
      accepted ? 'success' : 'info',
    );
  };

  const handleRejectOffer = async (offerId: string) => {
    const rejected = await respondToOffer(offerId, 'rejected');
    showToast(rejected ? 'Offer rejected.' : 'Unable to reject offer.', rejected ? 'success' : 'info');
  };

  const handleCompleteSale = async (escrowId: string, address: string) => {
    const resolved = await resolveEscrow(escrowId, 'completeSale');
    showToast(
      resolved
        ? `Sale completed for ${address}. Ownership history updated.`
        : 'Unable to complete sale.',
      resolved ? 'success' : 'info',
    );
  };

  const handleMutualClose = async (escrowId: string, address: string) => {
    const resolved = await resolveEscrow(escrowId, 'mutualClose');
    showToast(
      resolved
        ? `Mutual close completed for ${address}. Ownership history updated.`
        : 'Unable to mutual close.',
      resolved ? 'success' : 'info',
    );
  };

<<<<<<< HEAD
=======
  const handleTokenizeProperty = (tokenId: string) => {
    // In a real app, this would update the property in the data store
    const shortTokenId = tokenId.length > 8 ? tokenId.slice(0, 8) + '...' : tokenId;
    showToast(
      `Property tokenized successfully! Token ID: ${shortTokenId}`,
      'success',
    );
    setTokenizeModal(null);
  };

>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
  return (
    <section className="dashboard-page seller-dashboard">
      <header className="page-intro">
        <h2>Seller Dashboard</h2>
        <p className="muted">
          Manage listings, review buyer offers, and resolve escrow via RealEstateEscrow.
        </p>
      </header>

      <div className="seller-stats">
        <article className="seller-stat-card">
          <p className="muted">Listed</p>
          <p className="seller-stat-value">{sellerListings.length}</p>
        </article>
        <article className="seller-stat-card">
          <p className="muted">Pending offers</p>
          <p className="seller-stat-value">{sellerOffers.length}</p>
        </article>
        <article className="seller-stat-card">
          <p className="muted">Active escrows</p>
          <p className="seller-stat-value">{sellerEscrows.length}</p>
        </article>
      </div>

      <section className="seller-section seller-section--properties">
        <div className="seller-section__header">
          <h3>My Properties</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={unlistedProperties.length === 0}
            onClick={() => openCreateModal()}
          >
            Create listing
          </button>
        </div>
        {unlistedProperties.length === 0 && sellerListings.length > 0 && (
          <p className="muted seller-section__hint">
            All your tokenized properties are listed. Delist one to create a new listing.
          </p>
        )}
        {sellerProperties.length === 0 ? (
          <EmptyState
            icon={<PropertiesIcon />}
            title="No properties yet"
            hint="Properties you own will appear here, ready to be tokenized and listed."
          />
        ) : (
          <div className="results-stack">
            {sellerProperties.map((property) => {
              const listing = getListingForProperty(property.id);
              const isListed = Boolean(listing);

              return (
                <article key={property.id} className="card result-card seller-property-card">
                  <div className="result-card__header">
                    <div>
                      <p className="result-card__eyebrow">Your property</p>
                      <h4 className="property-address">{property.address}</h4>
                    </div>
                    <span className={`badge ${isListed ? 'badge-success' : 'badge-muted'}`}>
                      {isListed ? 'Listed' : 'Not listed'}
                    </span>
                  </div>

                  <dl className="result-card__stats">
                    <div>
                      <dt>Size</dt>
                      <dd>{property.size}</dd>
                    </div>
                    <div>
                      <dt>Token ID</dt>
                      <dd className="ledger-data">{property.tokenId || '—'}</dd>
                    </div>
                    <div>
                      <dt>Listed price</dt>
                      <dd className={property.listedPrice !== null ? 'stat-primary' : undefined}>
                        {property.listedPrice !== null ? formatPrice(property.listedPrice) : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="button-row">
<<<<<<< HEAD
=======
                    {!property.tokenized && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setTokenizeModal({ property })}
                      >
                        Tokenize as NFT
                      </button>
                    )}
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
                    {!isListed && property.tokenized && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => openCreateModal(property.id)}
                      >
                        Create listing
                      </button>
                    )}
                    {isListed && listing && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            setListingModal({
                              mode: 'edit',
                              property,
                              listingId: listing.id,
                              currentPrice: listing.askingPrice,
                            })
                          }
                        >
                          Edit price
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelist(listing.id, property.address)}
                        >
                          Delist
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="seller-section seller-section--offers">
        <h3>Incoming Offers</h3>
        {sellerOffers.length === 0 ? (
          <EmptyState
            icon={<InboxIcon />}
            title="No incoming offers yet"
            hint="When buyers make an offer on your listings, it will land here for your review."
          />
        ) : (
          <div className="results-stack">
            {sellerOffers.map((offer) => {
              const listing = data.listings.find((item) => item.id === offer.listingId);
              return (
                <OfferReviewCard
                  key={offer.id}
                  offer={offer}
                  address={listing?.address ?? offer.propertyId}
                  onAccept={() => handleAcceptOffer(offer.id, listing?.address ?? offer.propertyId)}
                  onReject={() => handleRejectOffer(offer.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="seller-section seller-section--escrows">
        <h3>Active Escrows</h3>
        {sellerEscrows.length === 0 ? (
          <EmptyState
            icon={<EscrowIcon />}
            title="No active escrows"
            hint="Accepted offers become escrow deals, which you can complete or close out from here."
          />
        ) : (
          <div className="results-stack">
            {sellerEscrows.map((deal) => {
              const listing = data.listings.find((item) => item.id === deal.listingId);
              const property = data.properties.find((item) => item.id === deal.propertyId);
              const address = listing?.address ?? property?.address ?? deal.propertyId;

              return (
                <SellerEscrowCard
                  key={deal.id}
                  deal={deal}
                  address={address}
                  onCompleteSale={() => handleCompleteSale(deal.id, address)}
                  onMutualClose={() => handleMutualClose(deal.id, address)}
                />
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
<<<<<<< HEAD
=======

      {tokenizeModal && (
        <TokenizePropertyModal
          property={tokenizeModal.property}
          onSubmit={handleTokenizeProperty}
          onClose={() => setTokenizeModal(null)}
        />
      )}
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
    </section>
  );
}
