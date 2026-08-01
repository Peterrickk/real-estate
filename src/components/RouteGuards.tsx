import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuardProps {
  children: ReactNode;
}

export function RequireAuth({ children }: GuardProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function PublicOnly({ children }: GuardProps) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.preferredHome ?? '/marketplace'} replace />;
  }

  return children;
}

export function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? user?.preferredHome ?? '/marketplace' : '/registry'} replace />;
}