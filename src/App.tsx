import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { PropertyRegistryPage } from './modules/property-registry/PropertyRegistryPage';
import { MarketplacePage } from './modules/marketplace/MarketplacePage';
import { OwnershipHistoryPage } from './modules/ownership-history/OwnershipHistoryPage';
import { LandInsightsPage } from './modules/land-insights/LandInsightsPage';
import { SellerDashboardPage } from './modules/seller/SellerDashboardPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/registry" replace />} />
        <Route path="/registry" element={<PropertyRegistryPage />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/seller" element={<SellerDashboardPage />} />
        <Route path="/history" element={<OwnershipHistoryPage />} />
        <Route path="/insights" element={<LandInsightsPage />} />
      </Route>
    </Routes>
  );
}
