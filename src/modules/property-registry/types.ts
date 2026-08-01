import type { DevelopmentSignal, RiskLevel } from '../../lib/hazards/types';

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
}
