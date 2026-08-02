export interface PriceHistoryPoint {
  date: string;
  price: number;
  /** Escrow-completed sales auto-append a data point here. */
  source?: 'appraisal' | 'escrow' | 'purchase';
  escrowTxId?: string;
  propertyId?: string;
}

export interface ValuationSummary {
  propertyId: string;
  currentEstimatedValue: number;
  priceChangeSinceLastSale: number;
  priceChangePercent: number;
  comparableLandAverage: number;
  lastSalePrice: number;
  lastSaleDate: string;
}
