import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
<<<<<<< HEAD
import { registerAccount, seedDemoAccounts, updateStoredAccount, verifyAccount } from '../lib/authStore';
=======
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31

export type HomeRoute = '/marketplace' | '/seller' | '/history' | '/insights';

export interface AuthUser {
  displayName: string;
  email: string;
  preferredHome: HomeRoute;
}

interface LoginInput {
<<<<<<< HEAD
  email: string;
  password: string;
}

interface SignupInput {
  displayName: string;
  email: string;
  password: string;
=======
  displayName: string;
  email: string;
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
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
<<<<<<< HEAD
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
=======
  login: (input: LoginInput) => void;
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => void;
}

const STORAGE_KEY = 'bch-real-estate-auth-v1';

const AuthContext = createContext<AuthContextValue | null>(null);

const homeRoutes: HomeRoute[] = ['/marketplace', '/seller', '/history', '/insights'];

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
<<<<<<< HEAD
    void seedDemoAccounts();
  }, []);

  useEffect(() => {
=======
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

<<<<<<< HEAD
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
=======
  const login = useCallback((input: LoginInput) => {
    setUser({
      displayName: input.displayName.trim() || 'Avery',
      email: input.email.trim(),
      preferredHome: normalizeHome(input.preferredHome),
    });
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((input: UpdateProfileInput) => {
    setUser((current) => {
      if (!current) return current;

<<<<<<< HEAD
      const next: AuthUser = {
=======
      return {
        ...current,
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
        displayName: input.displayName?.trim() || current.displayName,
        email: input.email?.trim() || current.email,
        preferredHome: normalizeHome(input.preferredHome ?? current.preferredHome),
      };
<<<<<<< HEAD

      updateStoredAccount(current.email, {
        displayName: next.displayName,
        email: next.email,
        preferredHome: next.preferredHome,
      });

      return next;
=======
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
<<<<<<< HEAD
      signup,
      logout,
      updateProfile,
    }),
    [user, login, signup, logout, updateProfile],
=======
      logout,
      updateProfile,
    }),
    [user, login, logout, updateProfile],
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
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
