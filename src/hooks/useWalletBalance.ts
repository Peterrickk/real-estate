import { useCallback, useEffect, useRef, useState } from 'react';
import { ElectrumNetworkProvider } from 'cashscript';
import { useAuth } from '../context/AuthContext';
import { getDemoWalletForEmail } from '../lib/ownerKeys';

const POLL_INTERVAL_MS = 30_000;

/**
 * The demo app has no real onboarding flow, so with no logged-in session we
 * fall back to the default Avery demo wallet. Otherwise we use the email
 * recorded at login (buyer or seller) to resolve that user's demo keypair.
 */
const DEFAULT_DEMO_EMAIL = 'avery@example.com';

/**
 * Real BCH balance (chipnet) for the current user's demo wallet.
 *
 * Resolves the user's demo address from `ownerKeys.ts`, queries UTXOs via the
 * same `ElectrumNetworkProvider('chipnet')` used by the escrow service, and
 * polls every 30 seconds.
 */
export function useWalletBalance() {
  const { user } = useAuth();
  const email = user?.email ?? DEFAULT_DEMO_EMAIL;
  const wallet = getDemoWalletForEmail(email);
  const address = wallet?.address ?? null;

  const [balanceSat, setBalanceSat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(address !== null);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<ElectrumNetworkProvider | null>(null);
  const activeRef = useRef(false);

  // Reset to a clean state whenever the wallet address changes (e.g. the
  // logged-in user changes). Setting state during render is the documented
  // pattern for resetting state when a prop changes.
  const [resolvedAddress, setResolvedAddress] = useState(address);
  if (resolvedAddress !== address) {
    setResolvedAddress(address);
    setBalanceSat(null);
    setError(null);
    setIsLoading(address !== null);
  }

  const fetchBalance = useCallback(async () => {
    if (!address || !activeRef.current) return;

    try {
      if (!providerRef.current) {
        providerRef.current = new ElectrumNetworkProvider('chipnet');
      }

      const utxos = await providerRef.current.getUtxos(address);
      if (!activeRef.current) return; // stale response

      const totalSat = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      setBalanceSat(Number(totalSat));
      setError(null);
    } catch (err) {
      if (!activeRef.current) return;
      console.error('Failed to fetch wallet balance:', err);
      setError('Unable to fetch balance');
    } finally {
      if (activeRef.current) {
        setIsLoading(false);
      }
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;

    activeRef.current = true;
    fetchBalance();
    const intervalId = window.setInterval(fetchBalance, POLL_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [address, fetchBalance]);

  return {
    /** Chipnet cashaddr for the current user, or null when no demo keypair exists. */
    address,
    /** Balance in satoshis, or null while loading / on error / no wallet. */
    balanceSat,
    /** Balance in BCH (satoshis / 100_000_000), or null. */
    balance: balanceSat !== null ? balanceSat / 100_000_000 : null,
    isLoading,
    error,
    /** True when the logged-in email has no demo keypair yet. */
    noWallet: address === null,
    refresh: fetchBalance,
  };
}
