import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Gauge, TrendingUp, Wrench, DollarSign, Clock, AlertOctagon } from 'lucide-react';
import { api } from '../lib/supabase';
import { Analytics as A } from '../types';
import { Card, StatCard, Spinner, ErrorState, HealthRing } from '../components/ui';
import { statusBadge, statusLabel, healthBar } from '../utils/format';

function money(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + ' so\'m';
}

function OEEGauge({ value }: { value: number }) {
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
  const r = 70, circ = Math.PI * r; // yarim doira
  const dash = (value / 100) * circ;
  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d="M 20 100 A 70 70 0 0 1 160 100" fill="none" stroke="#1f2937" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 70 70 0 0 1 160 100" fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>{value}%</span>
        <span className="text-muted text-xs">OEE</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [a, setA] = useState<A | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.analytics().then(setA).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!a) return null;

  return (
    <div className="space-y-6">
      {/* OEE va asosiy ko'rsatkichlar */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center">
          <OEEGauge value={a.oee} />
          <div className="grid grid-cols-3 gap-3 mt-4 w-full text-center">
            <div><p className="text-muted text-xs">Mavjudlik</p><p className="font-bold text-ok">{a.availability}%</p></div>
            <div><p className="text-muted text-xs">Samaradorlik</p><p className="font-bold text-info">{a.performance}%</p></div>
            <div><p className="text-muted text-xs">Sifat</p><p className="font-bold text-brand">{a.quality}%</p></div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard icon={Wrench} label="Ochiq ish-naryad" value={a.openWorkOrders} accent="text-warn" />
          <StatCard icon={Gauge} label="O'rtacha sog'liq" value={`${a.avgHealth}%`} accent="text-ok" />
          <StatCard icon={DollarSign} label="Texxizmat xarajati" value={money(a.maintenanceCost)} accent="text-info" sub={`${a.completedWorkOrders} bajarilgan`} />
          <StatCard icon={Clock} label="O'rt. ta'mirlash vaqti" value={`${a.avgRepairHours} soat`} accent="text-brand" />
        </div>
      </div>

      {/* Sog'liq reytingi */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertOctagon size={18} className="text-crit" /> Sog'liq reytingi
            <span className="text-muted text-xs font-normal ml-auto">e'tibor talab qiladiganlar tepada</span>
          </h3>
          <div className="space-y-3">
            {a.healthRanking.map(p => (
              <Link key={p.id} to={`/pumps/${p.id}`} className="flex items-center gap-3 hover:bg-bg-hover rounded-lg p-1.5 -m-1.5 transition-colors">
                <HealthRing score={p.health_score} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-muted text-xs truncate">{p.model} · {p.workshop ?? '—'}</p>
                </div>
                <span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Model bo'yicha solishtirish */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-info" /> Model bo'yicha o'rtacha sog'liq
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={a.modelComparison} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="model" stroke="#64748b" fontSize={10} width={120} />
              <Tooltip contentStyle={{ background: '#151b26', border: '1px solid #1f2937', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v: any) => [`${v}%`, 'O\'rtacha sog\'liq']} />
              <Bar dataKey="avgHealth" radius={[0, 4, 4, 0]}>
                {a.modelComparison.map((m, i) => (
                  <Cell key={i} fill={m.avgHealth >= 80 ? '#22c55e' : m.avgHealth >= 50 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Model jadvali */}
      <Card>
        <h3 className="font-semibold mb-4">Model statistikasi</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted text-left border-b border-line">
              <tr>
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Soni</th>
                <th className="pb-2 font-medium">O'rt. sog'liq</th>
                <th className="pb-2 font-medium">Ishlayapti</th>
                <th className="pb-2 font-medium">Kritik</th>
                <th className="pb-2 font-medium">Jami soat</th>
              </tr>
            </thead>
            <tbody>
              {a.modelComparison.map(m => (
                <tr key={m.model} className="border-b border-line/50">
                  <td className="py-2.5 font-medium">{m.model}</td>
                  <td>{m.count}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-soft overflow-hidden">
                        <div className={`h-full ${healthBar(m.avgHealth)}`} style={{ width: `${m.avgHealth}%` }} />
                      </div>
                      {m.avgHealth}%
                    </div>
                  </td>
                  <td className="text-ok">{m.running}</td>
                  <td className={m.critical > 0 ? 'text-crit' : ''}>{m.critical}</td>
                  <td className="text-muted">{Math.round(m.totalHours).toLocaleString()} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
