import type { PaymentMethod } from '../../lib/rates';

/**
 * A simulated fiat → BCH purchase (demo). Amounts are stored in exact
 * satoshis; `status` is advanced by the app data layer (bank transfers are
 * "processing" for a short delay, cards are credited instantly).
 */
export interface FiatDeposit {
  id: string;
  /** Email of the demo wallet that receives the credit. */
  email: string;
  method: PaymentMethod;
  fiatAmount: number;
  fiatCurrency: 'USD';
  /** BCH purchased before the fee, in satoshis. */
  grossSats: number;
  /** Platform fee, in satoshis. */
  feeSats: number;
  /** Net BCH credited to the wallet, in satoshis. */
  creditedSats: number;
  /**
   * Unspent portion of the credit in satoshis. Decreased by escrow funding
   * (FIFO) so a deposit is never double-counted between the wallet and an
   * escrow contract. Mirrors `creditedSats` until the first funding.
   */
  remainingSats: number;
  /** BCH-per-USD rate used at purchase time (demo). */
  rateBchPerUsd: number;
  status: 'processing' | 'completed';
  createdAt: string;
  completedAt: string | null;
}
