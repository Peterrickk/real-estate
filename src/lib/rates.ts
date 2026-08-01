/**
 * Demo exchange-rate + funding math.
 *
 * The app uses a fixed demo BCH/USD rate (consistent with the marketplace's
 * balance gating). All amounts are converted with integer satoshi math so the
 * credited balance is exact in cashscript terms (1 BCH = 100_000_000 sats).
 */

/** 1 BCH = 100_000_000 satoshis (cashscript / BCH consensus unit). */
export const SATOSHIS_PER_BCH = 100_000_000;

/** Demo rate: 1 BCH ≈ $100 USD. */
export const DEMO_BCH_USD_RATE = 100;

export type PaymentMethod = 'bank' | 'card';

export interface FundingMethodInfo {
  id: PaymentMethod;
  label: string;
  description: string;
  /** Fee as a decimal rate, e.g. 0.025 = 2.5%. */
  feeRate: number;
  feeLabel: string;
  processingLabel: string;
  /** Simulated processing time in ms; null = credited instantly. */
  processingDelayMs: number | null;
}

export const FUNDING_METHODS: Record<PaymentMethod, FundingMethodInfo> = {
  bank: {
    id: 'bank',
    label: 'Bank transfer',
    description: 'ACH / wire — lower fees, longer processing',
    feeRate: 0.0025,
    feeLabel: '0.25%',
    processingLabel: '1–3 business days',
    processingDelayMs: 30_000,
  },
  card: {
    id: 'card',
    label: 'Credit / debit card',
    description: 'Instant funding — higher fees',
    feeRate: 0.029,
    feeLabel: '2.9%',
    processingLabel: 'Instant',
    processingDelayMs: null,
  },
};

export interface PurchaseQuote {
  fiatAmount: number;
  rateBchPerUsd: number;
  feePercent: number;
  grossSats: number;
  feeSats: number;
  creditedSats: number;
  grossBch: number;
  feeBch: number;
  creditedBch: number;
}

/**
 * Convert a USD amount into satoshis at the demo rate using integer math.
 * At the demo rate ($100/BCH) this is exactly `usd * 1_000_000` sats.
 */
export function usdToSats(usd: number): number {
  return Math.round(usd * (SATOSHIS_PER_BCH / DEMO_BCH_USD_RATE));
}

/**
 * Convert a fiat amount (USD) into BCH for a given payment method, using
 * integer satoshi math throughout so the credited figure is exact.
 * Returns null for non-positive / non-finite amounts.
 */
export function calculatePurchase(fiatAmount: number, method: PaymentMethod): PurchaseQuote | null {
  if (!Number.isFinite(fiatAmount) || fiatAmount <= 0) return null;

  const info = FUNDING_METHODS[method];
  const fiatCents = Math.round(fiatAmount * 100);
  const grossSats = Math.floor((fiatCents * SATOSHIS_PER_BCH) / (DEMO_BCH_USD_RATE * 100));
  const feeSats = Math.round(grossSats * info.feeRate);
  const creditedSats = Math.max(0, grossSats - feeSats);

  return {
    fiatAmount,
    rateBchPerUsd: DEMO_BCH_USD_RATE,
    feePercent: info.feeRate,
    grossSats,
    feeSats,
    creditedSats,
    grossBch: grossSats / SATOSHIS_PER_BCH,
    feeBch: feeSats / SATOSHIS_PER_BCH,
    creditedBch: creditedSats / SATOSHIS_PER_BCH,
  };
}
