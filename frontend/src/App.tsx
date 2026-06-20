import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pumps from './pages/Pumps';
import PumpDetail from './pages/PumpDetail';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import Mnemoscheme from './pages/Mnemoscheme';
import Analytics from './pages/Analytics';
import WorkOrders from './pages/WorkOrders';
import Preventive from './pages/Preventive';
import ShiftLogs from './pages/ShiftLogs';
import ShiftReport from './pages/ShiftReport';
import VideoWall from './pages/VideoWall';

export default function App() {
  return (
    <Routes>
      {/* Video wall — Layout'siz to'liq ekran */}
      <Route path="/wall" element={<VideoWall />} />

      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mnemoscheme" element={<Mnemoscheme />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pumps" element={<Pumps />} />
            <Route path="/pumps/:id" element={<PumpDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/preventive" element={<Preventive />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/shift-logs" element={<ShiftLogs />} />
            <Route path="/shift-report" element={<ShiftReport />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}
