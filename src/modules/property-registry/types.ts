import type { DevelopmentSignal, RiskLevel } from '../../lib/hazards/types';
import type { PropertyNFTMetadata } from '../../lib/tokens/types';

/**
 * Seeded hazard/geological profile for a property. Live readings (USGS
 * earthquake feed, SRTM elevation) are derived at runtime and fall back to
 * these values when a live source is unavailable.
 */
export interface PropertyHazardProfile {
  /** Flood-zone label (e.g. FEMA-style "AE", "X (minimal)", "coastal"). */
  floodZone?: string;
  terrainClass?: 'lowland' | 'upland' | 'steep';
  /** Known seismic-zone baseline when no live quakes are nearby. */
  seismicBaseline?: RiskLevel;
  /** Seeded elevation in metres (fallback when the live API is unreachable). */
  elevationM?: number;
  /** News / signals about nearby development that raises land value. */
  developmentSignals?: DevelopmentSignal[];
}

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
  lat: number;
  lng: number;
  hazard?: PropertyHazardProfile;
  /** NFT metadata if property is tokenized */
  nftMetadata?: PropertyNFTMetadata;
  /** NFT capability type */
  nftCapability?: 'none' | 'mutable' | 'minting';
  /** Current NFT commitment data */
  nftCommitment?: string;
  /** Additional property type information */
  propertyType?: string;
  /** Floor area in square meters */
  floorArea?: string;
  /** Number of bedrooms */
  bedrooms?: number;
  /** Number of bathrooms */
  bathrooms?: number;
  /** Certificate number for NFT */
  certificateNumber?: string;
  /** NFT Token ID */
  nftTokenId?: string;
  /** CashToken Category ID */
  cashTokenCategory?: string;
  /** Blockchain network */
  blockchain?: string;
  /** Verification status */
  verificationStatus?: string;
  /** Previous owner wallet address */
  previousOwner?: string;
  /** Mint date */
  mintDate?: string;
}
