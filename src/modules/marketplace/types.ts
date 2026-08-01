export interface Listing {
  id: string;
  propertyId: string;
  address: string;
  size: string;
  askingPrice: number;
  sellerPubkey: string;
  listedAt: string;
  /** Active escrow deal for this listing, if any. */
  escrowId?: string;
}

export interface Offer {
  id: string;
  listingId: string;
  propertyId: string;
  offerAmount: number;
  buyerPubkey: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export type { EscrowDeal, EscrowResolution, EscrowStatus } from '../../lib/escrow/types';
