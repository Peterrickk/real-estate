import type { HomeRoute } from '../context/AuthContext';

/**
 * Local, browser-only "accounts" registry backing the demo login/signup
 * flow. Passwords are never stored in plaintext — only a SHA-256 hash — but
 * this is still a client-side demo store, not a real auth backend.
 */

export interface StoredAccount {
  displayName: string;
  email: string;
  passwordHash: string;
  preferredHome: HomeRoute;
}

const ACCOUNTS_KEY = 'bch-real-estate-accounts-v1';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function loadAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, StoredAccount>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
  preferredHome: HomeRoute;
}

/** Creates a new account. Throws if the email is already registered. */
export async function registerAccount(input: RegisterInput): Promise<StoredAccount> {
  const key = normalizeEmail(input.email);
  const accounts = loadAccounts();

  if (accounts[key]) {
    throw new Error('An account with this email already exists. Try signing in instead.');
  }

  const account: StoredAccount = {
    displayName: input.displayName.trim(),
    email: key,
    passwordHash: await hashPassword(input.password),
    preferredHome: input.preferredHome,
  };

  accounts[key] = account;
  saveAccounts(accounts);
  return account;
}

/** Verifies email + password against the stored registry. Throws on mismatch. */
export async function verifyAccount(email: string, password: string): Promise<StoredAccount> {
  const key = normalizeEmail(email);
  const accounts = loadAccounts();
  const account = accounts[key];

  if (!account) {
    throw new Error('No account found for that email. Try signing up instead.');
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) {
    throw new Error('Incorrect password.');
  }

  return account;
}

/** Applies profile edits (from Settings) to the stored account, renaming its key if the email changed. */
export function updateStoredAccount(
  currentEmail: string,
  updates: { displayName?: string; email?: string; preferredHome?: HomeRoute },
): void {
  const accounts = loadAccounts();
  const key = normalizeEmail(currentEmail);
  const existing = accounts[key];
  if (!existing) return;

  const nextKey = updates.email ? normalizeEmail(updates.email) : key;
  const updated: StoredAccount = {
    ...existing,
    displayName: updates.displayName ?? existing.displayName,
    email: nextKey,
    preferredHome: updates.preferredHome ?? existing.preferredHome,
  };

  if (nextKey !== key) {
    delete accounts[key];
  }
  accounts[nextKey] = updated;
  saveAccounts(accounts);
}

const DEMO_ACCOUNTS: RegisterInput[] = [
  { displayName: 'Avery', email: 'avery@example.com', password: 'demo1234', preferredHome: '/marketplace' },
];

/** Seeds a couple of ready-to-use demo accounts the first time the app runs. Safe to call repeatedly. */
export async function seedDemoAccounts(): Promise<void> {
  const accounts = loadAccounts();
  let changed = false;

  for (const demo of DEMO_ACCOUNTS) {
    const key = normalizeEmail(demo.email);
    if (accounts[key]) continue;

    accounts[key] = {
      displayName: demo.displayName,
      email: key,
      passwordHash: await hashPassword(demo.password),
      preferredHome: demo.preferredHome,
    };
    changed = true;
  }

  if (changed) saveAccounts(accounts);
}
