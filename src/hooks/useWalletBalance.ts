import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ElectrumNetworkProvider } from 'cashscript';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { getDemoWalletForEmail, DEFAULT_DEMO_EMAIL } from '../lib/ownerKeys';

const POLL_INTERVAL_MS = 30_000;

/**
 * Wallet balance for the current user's demo wallet.
 *
 * = on-chain chipnet UTXOs (queried via the same `ElectrumNetworkProvider`
 *   used by the escrow service) + completed fiat purchases recorded in the
 *   app data layer. Credits are stored in exact satoshis.
 */
export function useWalletBalance() {
  const { user } = useAuth();
  const { data } = useAppData();
  const email = user?.email ?? DEFAULT_DEMO_EMAIL;
  const wallet = getDemoWalletForEmail(email);
  const address = wallet?.address ?? null;

  const [onChainSat, setOnChainSat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(address !== null);
  const [error, setError] = useState<string | null>(null);

  // Completed fiat purchases credited to this user (app-data layer). Uses the
  // unspent remainder so escrow fundings reduce the available balance.
  const fundedSats = useMemo(
    () =>
      data.deposits.reduce(
        (sum, deposit) =>
          deposit.email === email && deposit.status === 'completed'
            ? sum + deposit.remainingSats
            : sum,
        0,
      ),
    [data.deposits, email],
  );

  const balanceSat = onChainSat !== null ? onChainSat + fundedSats : null;

  const providerRef = useRef<ElectrumNetworkProvider | null>(null);
  const activeRef = useRef(false);

  // Reset to a clean state whenever the wallet address changes (e.g. the
  // logged-in user changes). Setting state during render is the documented
  // pattern for resetting state when a prop changes.
  const [resolvedAddress, setResolvedAddress] = useState(address);
  if (resolvedAddress !== address) {
    setResolvedAddress(address);
    setOnChainSat(null);
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
      setOnChainSat(Number(totalSat));
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
    /** Balance in satoshis (on-chain + funded), or null while loading / on error / no wallet. */
    balanceSat,
    /** Balance in BCH (satoshis / 100_000_000), or null. */
    balance: balanceSat !== null ? balanceSat / 100_000_000 : null,
    /** On-chain chipnet portion only, in satoshis. */
    onChainSat,
    isLoading,
    error,
    /** True when the logged-in email has no demo keypair yet. */
    noWallet: address === null,
    refresh: fetchBalance,
  };
}
