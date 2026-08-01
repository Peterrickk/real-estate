import type { EscrowParties } from './types';

/**
 * Platform-operated title company arbiter key (mock).
 * In production this would be the title company's BCH public key,
 * registered during onboarding — not the platform's own wallet.
 */
export const TITLE_COMPANY_ARBITER: Pick<
  EscrowParties,
  'arbiterPubkey' | 'arbiterRole' | 'arbiterName'
> = {
  arbiterPubkey: '02titleco00000000000000000000000000000001',
  arbiterRole: 'title_company',
  arbiterName: 'Pacific Title & Escrow Co.',
};
