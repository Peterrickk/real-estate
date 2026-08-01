export interface Property {
  id: string;
  address: string;
  size: string;
  legalId: string;
  tokenId: string;
  ownerPubkey: string;
  listedPrice: number | null;
  dateTokenized: string;
  tokenized: boolean;
}
