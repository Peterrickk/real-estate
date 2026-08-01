import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_DEMO_EMAIL,
  getDemoWalletForEmail,
  type DemoWallet,
} from '../lib/ownerKeys';

/** The logged-in user's chipnet demo wallet (defaults to avery@example.com). */
export function useDemoWallet(): DemoWallet | null {
  const { user } = useAuth();
  const email = user?.email ?? DEFAULT_DEMO_EMAIL;
  return getDemoWalletForEmail(email);
}
