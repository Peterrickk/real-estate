import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { PublicOnly, RequireAuth } from './components/RouteGuards';
import { PropertyRegistryPage } from './modules/property-registry/PropertyRegistryPage';
import { LoginPage } from './modules/login/login';
import { MarketplacePage } from './modules/marketplace/MarketplacePage';
import { OwnershipHistoryPage } from './modules/ownership-history/OwnershipHistoryPage';
import { LandInsightsPage } from './modules/land-insights/LandInsightsPage';
import { UserDashboardPage } from './modules/user/UserDashboardPage';
import { SettingsPage } from './modules/auth/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/registry/PropertyRegistryPage" replace />} />
        <Route path="/registry/PropertyRegistryPage" element={<PropertyRegistryPage />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
      </Route>

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/history" element={<OwnershipHistoryPage />} />
        <Route path="/insights" element={<LandInsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}