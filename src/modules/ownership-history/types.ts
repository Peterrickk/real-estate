export interface TransferRecord {
  id: string;
  propertyId: string;
  owner: string;
  dateAcquired: string;
  dateSold: string | null;
  priceAtTime: number;
  /** How this record was created — escrow completions auto-feed here. */
  source?: 'registry' | 'escrow' | 'purchase';
  escrowTxId?: string;
}
