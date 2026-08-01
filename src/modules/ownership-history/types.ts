export interface TransferRecord {
  id: string;
  propertyId: string;
  owner: string;
  dateAcquired: string;
  dateSold: string | null;
  priceAtTime: number;
}
