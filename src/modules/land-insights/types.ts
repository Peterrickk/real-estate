export interface PriceHistoryPoint {
  date: string;
  price: number;
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
