import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Activity, Gauge, Droplets, Zap, RotateCw } from 'lucide-react';
import { api } from '../lib/supabase';
import { Pump, SensorReading, Alert, Maintenance } from '../types';
import { Card, Spinner, ErrorState, EmptyState, Badge, HealthRing } from '../components/ui';
import { TempTrend, VibrationTrend, PressureTrend, FlowTrend } from '../components/charts';
import { useRealtimeReadings } from '../hooks/useRealtimeReadings';
import { statusBadge, statusLabel, severityBadge, severityLabel, fmtTime } from '../utils/format';

export default function PumpDetail() {
  const { id } = useParams<{ id: string }>();
  const [pump, setPump] = useState<Pump | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { readings, seed } = useRealtimeReadings(id, 60);

  useEffect(() => {
    if (!id) return;
    api.pump(id)
      .then(d => {
        setPump(d.pump); setAlerts(d.alerts ?? []); setMaintenance(d.maintenance ?? []);
        seed((d.readings ?? []) as SensorReading[]);
      })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id, seed]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!pump) return <ErrorState message="Nasos topilmadi" />;

  const latest = readings[0];
  const sensors = latest ? [
    { icon: Thermometer, label: 'Podshipnik harorati', value: `${latest.bearing_temp}°C`, c: 'text-crit' },
    { icon: Thermometer, label: 'Salnik harorati', value: `${latest.seal_temp}°C`, c: 'text-warn' },
    { icon: Activity, label: 'Vibratsiya', value: `${latest.vibration} mm/s`, c: 'text-brand' },
    { icon: Gauge, label: 'Kirish bosimi', value: `${latest.inlet_pressure} bar`, c: 'text-info' },
    { icon: Gauge, label: 'Chiqish bosimi', value: `${latest.outlet_pressure} bar`, c: 'text-purple-400' },
    { icon: Droplets, label: 'Sarf', value: `${latest.flow_rate} m³/h`, c: 'text-ok' },
    { icon: Zap, label: 'Tok', value: `${latest.current_a} A`, c: 'text-yellow-400' },
    { icon: RotateCw, label: 'RPM', value: `${latest.rpm}`, c: 'text-pink-400' },
  ] : [];

  return (
    <div className="space-y-6">
      <Link to="/pumps" className="btn-ghost text-sm w-fit"><ArrowLeft size={16} /> Nasoslarga qaytish</Link>

      <div className="card p-5 flex flex-col md:flex-row md:items-center gap-5">
        <HealthRing score={pump.health_score} size={80} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{pump.name}</h2>
            <Badge className={statusBadge[pump.status]}>{statusLabel[pump.status]}</Badge>
          </div>
          <p className="text-muted mt-1">{pump.model} · {pump.location ?? '—'}</p>
          <p className="text-muted text-sm mt-1">Ish soatlari: {Number(pump.running_hours).toLocaleString()} · Seriya: {pump.serial_number}</p>
        </div>
        {/* QR kod — mexanik telefonda skanerlab shu sahifani ochadi */}
        <div className="flex flex-col items-center gap-1">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&bgcolor=151b26&color=e2e8f0&data=${encodeURIComponent(window.location.href)}`}
            alt="QR kod" width={90} height={90} className="rounded-lg border border-line"
          />
          <span className="text-muted text-[10px]">Skanerlash</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ok animate-pulse" /> Real-time sensorlar
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sensors.length === 0 ? <EmptyState message="Sensor ma'lumoti kutilmoqda..." /> :
            sensors.map((s, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 text-muted text-xs"><s.icon size={14} /> {s.label}</div>
                <p className={`text-xl font-bold mt-2 ${s.c}`}>{s.value}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card><h3 className="font-semibold mb-4">Harorat</h3><TempTrend data={readings} /></Card>
        <Card><h3 className="font-semibold mb-4">Vibratsiya</h3><VibrationTrend data={readings} /></Card>
        <Card><h3 className="font-semibold mb-4">Bosim</h3><PressureTrend data={readings} /></Card>
        <Card><h3 className="font-semibold mb-4">Sarf</h3><FlowTrend data={readings} /></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">So'nggi ogohlantirishlar</h3>
          {alerts.length === 0 ? <EmptyState /> : (
            <div className="space-y-2">
              {alerts.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-soft">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-muted text-xs">{fmtTime(a.created_at)}</p>
                  </div>
                  <Badge className={severityBadge[a.severity]}>{severityLabel[a.severity]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Texnik xizmat tarixi</h3>
          {maintenance.length === 0 ? <EmptyState /> : (
            <div className="space-y-2">
              {maintenance.slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-soft">
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-muted text-xs">{m.scheduled_at ? fmtTime(m.scheduled_at) : '—'}</p>
                  </div>
                  <Badge className="bg-info/10 text-info">{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
