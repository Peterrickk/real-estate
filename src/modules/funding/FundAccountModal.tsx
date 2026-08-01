import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { DEFAULT_DEMO_EMAIL } from '../../lib/ownerKeys';
import {
  calculatePurchase,
  FUNDING_METHODS,
  type PaymentMethod,
} from '../../lib/rates';

interface FundAccountModalProps {
  onClose: () => void;
}

type Step = 'method' | 'amount' | 'review' | 'done';

const MIN_FIAT = 10;
const MAX_FIAT = 50_000;

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatBch(amount: number): string {
  return amount.toFixed(8).replace(/\.?0+$/, '');
}

function formatSats(sats: number): string {
  return `${new Intl.NumberFormat('en-US').format(sats)} sats`;
}

export function FundAccountModal({ onClose }: FundAccountModalProps) {
  const { user } = useAuth();
  const { addDeposit } = useAppData();
  const { showToast } = useToast();
  const { balance, noWallet } = useWalletBalance();

  const email = user?.email ?? DEFAULT_DEMO_EMAIL;

  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [fiatAmount, setFiatAmount] = useState(100);
  const [purchasedSats, setPurchasedSats] = useState<number | null>(null);
  const [purchasedMethod, setPurchasedMethod] = useState<PaymentMethod>('card');

  const quote = useMemo(() => calculatePurchase(fiatAmount, method), [fiatAmount, method]);
  const methodInfo = FUNDING_METHODS[method];
  const amountValid = Number.isFinite(fiatAmount) && fiatAmount >= MIN_FIAT && fiatAmount <= MAX_FIAT;

  const handleConfirm = () => {
    if (!quote || !amountValid) return;

    const deposit = addDeposit({
      email,
      method,
      fiatAmount: quote.fiatAmount,
      grossSats: quote.grossSats,
      feeSats: quote.feeSats,
      creditedSats: quote.creditedSats,
    });

    setPurchasedSats(deposit.creditedSats);
    setPurchasedMethod(method);
    showToast(
      method === 'card'
        ? `Purchased ${formatBch(deposit.creditedSats / 100_000_000)} BCH.`
        : 'Bank transfer initiated — funds arrive shortly.',
    );
    setStep('done');
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal fund-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="fund-modal-title">Buy BCH</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {step !== 'done' && (
          <p className="fund-modal__balance">
            Current balance:{' '}
            <strong>{balance === null ? '…' : `${formatBch(balance)} BCH`}</strong>
            {noWallet ? ' — no wallet connected' : ''}
          </p>
        )}

        {step === 'method' && (
          <div className="fund-step">
            <p className="fund-step__hint">Choose how you want to fund your account.</p>
            <div className="method-grid">
              {(['bank', 'card'] as PaymentMethod[]).map((id) => {
                const info = FUNDING_METHODS[id];
                const selected = method === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`method-option${selected ? ' is-selected' : ''}`}
                    onClick={() => setMethod(id)}
                    aria-pressed={selected}
                  >
                    <strong>{info.label}</strong>
                    <span>{info.description}</span>
                    <span className="method-option__meta">
                      {info.feeLabel} fee · {info.processingLabel}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={() => setStep('amount')}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'amount' && quote && (
          <div className="fund-step">
            <label className="filter-field">
              <span>Fiat amount (USD)</span>
              <input
                type="number"
                min={MIN_FIAT}
                max={MAX_FIAT}
                step="1"
                value={fiatAmount}
                inputMode="decimal"
                onChange={(event) => setFiatAmount(Number(event.target.value))}
              />
            </label>
            <p className="fund-step__hint">
              Min {formatUsd(MIN_FIAT)} · Max {formatUsd(MAX_FIAT)}.
            </p>

            <div className="purchase-preview">
              <div className="purchase-preview__row">
                <span>Exchange rate (demo)</span>
                <strong>1 BCH ≈ ${quote.rateBchPerUsd}</strong>
              </div>
              <div className="purchase-preview__row">
                <span>Gross BCH</span>
                <span>{formatBch(quote.grossBch)}</span>
              </div>
              <div className="purchase-preview__row">
                <span>
                  Purchase fee ({methodInfo.feeLabel} · {methodInfo.label})
                </span>
                <span>− {formatBch(quote.feeBch)}</span>
              </div>
              <div className="purchase-preview__row purchase-preview__row--total">
                <span>You receive</span>
                <strong>{formatBch(quote.creditedBch)} BCH</strong>
              </div>
            </div>

            <div className="button-row">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('method')}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!amountValid}
                onClick={() => setStep('review')}
              >
                Review purchase
              </button>
            </div>
          </div>
        )}

        {step === 'review' && quote && (
          <div className="fund-step">
            <p className="fund-step__hint">Confirm the details of your purchase.</p>
            <div className="purchase-preview">
              <div className="purchase-preview__row">
                <span>Payment method</span>
                <strong>
                  {methodInfo.label} ({methodInfo.feeLabel} fee)
                </strong>
              </div>
              <div className="purchase-preview__row">
                <span>Amount</span>
                <span>{formatUsd(quote.fiatAmount)}</span>
              </div>
              <div className="purchase-preview__row">
                <span>Exchange rate (demo)</span>
                <span>1 BCH ≈ ${quote.rateBchPerUsd}</span>
              </div>
              <div className="purchase-preview__row">
                <span>Gross BCH</span>
                <span>{formatBch(quote.grossBch)}</span>
              </div>
              <div className="purchase-preview__row">
                <span>Purchase fee</span>
                <span>− {formatBch(quote.feeBch)}</span>
              </div>
              <div className="purchase-preview__row purchase-preview__row--total">
                <span>Net BCH credited</span>
                <strong>{formatBch(quote.creditedBch)}</strong>
              </div>
              <div className="purchase-preview__row">
                <span>Availability</span>
                <span>{methodInfo.processingLabel}</span>
              </div>
            </div>

            <p className="fund-step__hint fund-step__hint--note">
              Demo transaction: funds are credited to your chipnet demo wallet as a
              simulated deposit ({formatSats(quote.creditedSats)}).
            </p>

            <div className="button-row">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('amount')}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm}>
                Confirm purchase
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="fund-step fund-success">
            <p className="fund-success__amount">
              +{formatBch((purchasedSats ?? 0) / 100_000_000)} BCH
            </p>
            <p className="fund-success__title">
              {purchasedMethod === 'card'
                ? 'Purchase complete'
                : 'Bank transfer initiated'}
            </p>
            <p className="fund-step__hint">
              {purchasedMethod === 'card'
                ? 'Funds were credited instantly to your wallet.'
                : 'Processing — funds typically arrive in 1–3 business days (demo: ~30 seconds).'}
            </p>
            <p className="fund-step__hint">
              Current balance:{' '}
              <strong>{balance === null ? '…' : `${formatBch(balance)} BCH`}</strong>
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}