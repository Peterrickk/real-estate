import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type HomeRoute = '/marketplace' | '/seller' | '/history' | '/insights';

export interface AuthUser {
  displayName: string;
  email: string;
  preferredHome: HomeRoute;
}

interface LoginInput {
  displayName: string;
  email: string;
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
  login: (input: LoginInput) => void;
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
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback((input: LoginInput) => {
    setUser({
      displayName: input.displayName.trim() || 'Avery',
      email: input.email.trim(),
      preferredHome: normalizeHome(input.preferredHome),
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((input: UpdateProfileInput) => {
    setUser((current) => {
      if (!current) return current;

      return {
        ...current,
        displayName: input.displayName?.trim() || current.displayName,
        email: input.email?.trim() || current.email,
        preferredHome: normalizeHome(input.preferredHome ?? current.preferredHome),
      };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      updateProfile,
    }),
    [user, login, logout, updateProfile],
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
