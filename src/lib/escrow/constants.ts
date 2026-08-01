import type { EscrowParties } from './types';
import { DEMO_WALLETS, TITLE_COMPANY_EMAIL } from '../ownerKeys';

/**
 * Platform-operated title company arbiter — a real chipnet demo keypair.
 * The pubkey embedded in every `PropertySaleEscrow` contract is this key's
 * public key, so `completeSale` / `cancelSale` (which require an arbiter
 * signature) can actually verify on-chain.
 */
export const TITLE_COMPANY_ARBITER: Pick<
  EscrowParties,
  'arbiterPubkey' | 'arbiterRole' | 'arbiterName'
> = {
  arbiterPubkey: DEMO_WALLETS[TITLE_COMPANY_EMAIL].publicKey,
  arbiterRole: 'title_company',
  arbiterName: 'Pacific Title & Escrow Co.',
};

/** Arbitrary model for the funding tx fee slack, in satoshis. */
export const FUNDING_SURPLUS_SATS = 10_000n;

/**
 * Satoshis locked in the contract on top of the purchase amount to cover the
 * resolution transaction's network fee (the contract UTXO is spent without a
 * change output, so the surplus becomes the fee).
 */
export const ESCROW_FEE_BUFFER_SATS = 2_000n;
