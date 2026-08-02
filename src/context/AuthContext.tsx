import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { registerAccount, seedDemoAccounts, updateStoredAccount, verifyAccount } from '../lib/authStore';

export type HomeRoute = '/marketplace' | '/dashboard' | '/history' | '/insights';

export interface AuthUser {
  displayName: string;
  email: string;
  preferredHome: HomeRoute;
}

interface LoginInput {
  email: string;
  password: string;
}

interface SignupInput {
  displayName: string;
  email: string;
  password: string;
  preferredHome?: HomeRoute;
}

interface UpdateProfileInput {
  displayName?: string;
  email?: string;
  preferredHome?: HomeRoute;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => void;
}

const STORAGE_KEY = 'bch-real-estate-auth-v1';

const AuthContext = createContext<AuthContextValue | null>(null);

const homeRoutes: HomeRoute[] = ['/marketplace', '/dashboard', '/history', '/insights'];

function normalizeHome(home?: HomeRoute): HomeRoute {
  return home && homeRoutes.includes(home) ? home : '/marketplace';
}

function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());

  useEffect(() => {
    void seedDemoAccounts();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback(async (input: LoginInput) => {
    const account = await verifyAccount(input.email, input.password);
    setUser({
      displayName: account.displayName,
      email: account.email,
      preferredHome: account.preferredHome,
    });
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const account = await registerAccount({
      displayName: input.displayName,
      email: input.email,
      password: input.password,
      preferredHome: normalizeHome(input.preferredHome),
    });
    setUser({
      displayName: account.displayName,
      email: account.email,
      preferredHome: account.preferredHome,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((input: UpdateProfileInput) => {
    setUser((current) => {
      if (!current) return current;

      const next: AuthUser = {
        displayName: input.displayName?.trim() || current.displayName,
        email: input.email?.trim() || current.email,
        preferredHome: normalizeHome(input.preferredHome ?? current.preferredHome),
      };

      updateStoredAccount(current.email, {
        displayName: next.displayName,
        email: next.email,
        preferredHome: next.preferredHome,
      });

      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}