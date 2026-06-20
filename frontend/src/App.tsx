import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pumps from './pages/Pumps';
import PumpDetail from './pages/PumpDetail';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pumps" element={<Pumps />} />
        <Route path="/pumps/:id" element={<PumpDetail />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Layout>
  );
}
