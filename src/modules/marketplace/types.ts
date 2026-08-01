export interface Listing {
  id: string;
  propertyId: string;
  address: string;
  size: string;
  askingPrice: number;
  sellerPubkey: string;
  listedAt: string;
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
