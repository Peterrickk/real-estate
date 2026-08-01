import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { PublicOnly, RequireAuth } from './components/RouteGuards';
import { PropertyRegistryPage } from './modules/property-registry/PropertyRegistryPage';
import { LoginPage } from './modules/login/login';
import { MarketplacePage } from './modules/marketplace/MarketplacePage';
import { OwnershipHistoryPage } from './modules/ownership-history/OwnershipHistoryPage';
import { LandInsightsPage } from './modules/land-insights/LandInsightsPage';
import { SellerDashboardPage } from './modules/seller/SellerDashboardPage';
<<<<<<< HEAD
import { SettingsPage } from './modules/auth/SettingsPage';
=======
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31

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
        <Route path="/seller" element={<SellerDashboardPage />} />
        <Route path="/history" element={<OwnershipHistoryPage />} />
        <Route path="/insights" element={<LandInsightsPage />} />
<<<<<<< HEAD
        <Route path="/settings" element={<SettingsPage />} />
=======
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
      </Route>
    </Routes>
  );
}
