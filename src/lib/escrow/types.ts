/** On-chain escrow resolution paths defined in RealEstateEscrow.cash */
export type EscrowResolution = 'completeSale' | 'cancelSale' | 'mutualClose';

/** The arbiter is a licensed title company — neutral party for title clearance & disputes. */
export type EscrowArbiterRole = 'title_company';

export interface EscrowParties {
  buyerPubkey: string;
  sellerPubkey: string;
  /** Title company pubkey — signs completeSale & cancelSale alongside the relevant party. */
  arbiterPubkey: string;
  arbiterRole: EscrowArbiterRole;
  arbiterName: string;
}

export interface EscrowDeal {
  id: string;
  propertyId: string;
  listingId: string;
  /** PropertySaleEscrow contract (P2SH32) address once created — null while pending. */
  contractAddress: string | null;
  /** Purchase amount held in escrow (USD — the app's display denomination). */
  amount: number;
  /** Purchase amount in satoshis (`usdToSats(amount)` at the demo rate). */
  amountSats: number;
  /** Satoshis actually locked in the contract (amount + resolution fee buffer) — null until funded. */
  fundedSats: number | null;
  /** Mock funding transaction id that locked the escrow UTXO — null until funded. */
  fundingTxId: string | null;
  parties: EscrowParties;
  status: EscrowStatus;
  /** Set when a resolution transaction is confirmed on-chain. */
  resolution: EscrowResolution | null;
  createdAt: string;
  resolvedAt: string | null;
  /** BCH transaction ID of the resolution spend — null until settled. */
  resolutionTxId: string | null;
}

export type EscrowStatus =
  | 'pending_funding'
  | 'funded'
  | 'awaiting_title_clearance'
  | 'completed'
  | 'cancelled'
  | 'mutually_closed';

/** Signature requirements per resolution path. */
export const ESCROW_SIGNATURE_REQUIREMENTS: Record<
  EscrowResolution,
  { signers: Array<'buyer' | 'seller' | 'arbiter'>; payout: 'buyer' | 'seller' }
> = {
  completeSale: { signers: ['seller', 'arbiter'], payout: 'seller' },
  cancelSale: { signers: ['buyer', 'arbiter'], payout: 'buyer' },
  mutualClose: { signers: ['buyer', 'seller'], payout: 'seller' },
};
