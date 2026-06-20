import { useEffect, useState } from 'react';
import { Gauge, Activity, Bell, AlertOctagon, Wrench } from 'lucide-react';
import { api } from '../lib/supabase';
import { DashboardStats, SensorReading } from '../types';
import { StatCard, Card, Spinner, ErrorState } from '../components/ui';
import { TempTrend, VibrationTrend, PressureTrend, FlowTrend } from '../components/charts';
import { useRealtimeReadings } from '../hooks/useRealtimeReadings';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { readings, seed } = useRealtimeReadings(undefined, 40);

  useEffect(() => {
    Promise.all([api.dashboard(), api.readings(undefined, 40)])
      .then(([s, r]) => { setStats(s); seed(r as SensorReading[]); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [seed]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Gauge} label="Jami nasoslar" value={stats?.total ?? 0} accent="text-brand" />
        <StatCard icon={Activity} label="Ishlayotgan" value={stats?.running ?? 0} accent="text-ok" />
        <StatCard icon={Bell} label="Ogohlantirishlar" value={stats?.warnings ?? 0} accent="text-warn" />
        <StatCard icon={AlertOctagon} label="Kritik holatlar" value={stats?.critical ?? 0} accent="text-crit" />
        <StatCard icon={Wrench} label="Bugungi texxizmat" value={stats?.maintenanceToday ?? 0} accent="text-info" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-crit" /> Harorat trendi</h3>
          <TempTrend data={readings} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand" /> Vibratsiya trendi</h3>
          <VibrationTrend data={readings} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-info" /> Bosim trendi</h3>
          <PressureTrend data={readings} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ok" /> Sarf trendi</h3>
          <FlowTrend data={readings} />
        </Card>
      </div>
    </div>
  );
}
