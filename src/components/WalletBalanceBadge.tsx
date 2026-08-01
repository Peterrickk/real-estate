import { useState } from 'react';
import { useWalletBalance } from '../hooks/useWalletBalance';

interface WalletBalanceBadgeProps {
  className?: string;
}

function formatBch(balance: number | null): string {
  if (balance === null) return '…';
  return balance.toFixed(8).replace(/\.?0+$/, '');
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 10)}…${address.slice(-6)}`;
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`wallet-badge__refresh-icon${spinning ? ' is-spinning' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WalletBalanceBadge({ className = '' }: WalletBalanceBadgeProps) {
  const { balance, isLoading, error, noWallet, address, refresh } = useWalletBalance();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (non-secure context) — ignore.
    }
  };

  return (
    <div className={`wallet-badge ${className}`} title={address ? `Wallet: ${address}` : undefined}>
      {isLoading ? (
        <span className="wallet-badge__skeleton" role="status" aria-label="Loading wallet balance">
          Loading balance…
        </span>
      ) : error ? (
        <span className="wallet-badge__error" role="alert">
          Unable to fetch balance
        </span>
      ) : noWallet ? (
        <span className="wallet-badge__nowallet">No wallet connected</span>
      ) : (
        <span className="wallet-badge__balance">{formatBch(balance)} BCH</span>
      )}

      {address && (
        <button
          type="button"
          className="wallet-badge__address"
          onClick={handleCopy}
          title="Copy wallet address"
          aria-label="Copy wallet address"
        >
          {copied ? 'Copied!' : truncateAddress(address)}
        </button>
      )}

      <button
        type="button"
        className="wallet-badge__refresh"
        onClick={() => void refresh()}
        disabled={isLoading}
        aria-label="Refresh balance"
        title="Refresh balance"
      >
        <RefreshIcon spinning={isLoading} />
      </button>
    </div>
  );
}
