import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import type { Property } from '../property-registry/types';
import { ListPropertyModal } from './ListPropertyModal';
import { OfferReviewCard } from './OfferReviewCard';
import { SellerEscrowCard } from './SellerEscrowCard';
import { formatPrice } from './types';

type ListingModalState =
  | { mode: 'create'; property: Property }
  | { mode: 'edit'; property: Property; listingId: string; currentPrice: number };

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

  const sellerProperties = getSellerProperties();
  const sellerListings = getSellerListings();
  const sellerOffers = getSellerOffers();
  const sellerEscrows = getSellerEscrows();

  const getListingForProperty = (propertyId: string) =>
    sellerListings.find((listing) => listing.propertyId === propertyId);

  const handleListSubmit = (askingPrice: number) => {
    if (!listingModal) return;

    if (listingModal.mode === 'create') {
      const created = createListing(listingModal.property.id, askingPrice);
      showToast(
        created
          ? `${listingModal.property.address} listed for ${formatPrice(askingPrice)}.`
          : 'Unable to list property.',
        created ? 'success' : 'info',
      );
      return;
    }

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

  return (
    <section className="dashboard-page seller-dashboard">
      <header className="page-intro">
        <h2>Seller Dashboard</h2>
        <p className="muted">
          Manage listings, review buyer offers, and resolve escrow via RealEstateEscrow.
        </p>
      </header>

      <div className="seller-stats">
        <article className="card seller-stat-card">
          <p className="muted">Listed</p>
          <p className="seller-stat-value">{sellerListings.length}</p>
        </article>
        <article className="card seller-stat-card">
          <p className="muted">Pending offers</p>
          <p className="seller-stat-value">{sellerOffers.length}</p>
        </article>
        <article className="card seller-stat-card">
          <p className="muted">Active escrows</p>
          <p className="seller-stat-value">{sellerEscrows.length}</p>
        </article>
      </div>

      <section className="seller-section">
        <h3>My Properties</h3>
        {sellerProperties.length === 0 ? (
          <p className="empty-state">No properties owned by the demo seller.</p>
        ) : (
          <div className="results-stack">
            {sellerProperties.map((property) => {
              const listing = getListingForProperty(property.id);
              const isListed = Boolean(listing);

              return (
                <article key={property.id} className="card result-card">
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
                      <dd>
                        {property.listedPrice !== null ? formatPrice(property.listedPrice) : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="button-row">
                    {!isListed && property.tokenized && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setListingModal({ mode: 'create', property })}
                      >
                        List for sale
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

      <section className="seller-section">
        <h3>Incoming Offers</h3>
        {sellerOffers.length === 0 ? (
          <p className="empty-state">
            No pending offers. Buyers can submit offers from the Marketplace.
          </p>
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

      <section className="seller-section">
        <h3>Active Escrows</h3>
        {sellerEscrows.length === 0 ? (
          <p className="empty-state">No active escrow deals for your listings.</p>
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

      {listingModal && (
        <ListPropertyModal
          property={listingModal.property}
          initialPrice={listingModal.mode === 'edit' ? listingModal.currentPrice : undefined}
          title={listingModal.mode === 'create' ? 'List Property for Sale' : 'Edit Listing Price'}
          submitLabel={listingModal.mode === 'create' ? 'List property' : 'Save price'}
          onSubmit={handleListSubmit}
          onClose={() => setListingModal(null)}
        />
      )}
    </section>
  );
}
