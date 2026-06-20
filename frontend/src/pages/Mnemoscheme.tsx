import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/supabase';
import { MnemoPump, Workshop } from '../types';
import { Card, Spinner, ErrorState } from '../components/ui';
import { statusLabel } from '../utils/format';

const statusFill: Record<string, string> = {
  running: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
  stopped: '#64748b',
  maintenance: '#3b82f6',
};

export default function Mnemoscheme() {
  const [pumps, setPumps] = useState<MnemoPump[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => api.mnemoscheme()
    .then(d => { setPumps(d.pumps); setWorkshops(d.workshops); })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  // sexlar uchun ramka koordinatalari (har sex bir ustun)
  const wsBounds = [
    { name: 'Sex A', x: 4, w: 30 },
    { name: 'Sex B', x: 36, w: 30 },
    { name: 'Sex C', x: 68, w: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(statusFill).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: v }} />
            <span className="text-muted">{statusLabel[k as keyof typeof statusLabel]}</span>
          </div>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: '16/9', background: 'radial-gradient(circle at 50% 30%, #131a26 0%, #0d121b 100%)' }}>
          <svg viewBox="0 0 100 56" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* sex ramkalari */}
            {wsBounds.map(b => {
              const ws = workshops.find(w => w.name === b.name);
              const hasCrit = (ws?.critical ?? 0) > 0;
              const hasWarn = (ws?.warning ?? 0) > 0;
              const border = hasCrit ? '#ef4444' : hasWarn ? '#f59e0b' : '#1f2937';
              return (
                <g key={b.name}>
                  <rect x={b.x} y={6} width={b.w} height={46} rx={2}
                    fill="#0f1520" stroke={border} strokeWidth={0.3} opacity={0.9} />
                  <text x={b.x + b.w / 2} y={11} textAnchor="middle" fill="#94a3b8" fontSize={2.4} fontWeight="600">
                    {b.name}
                  </text>
                  {ws && (
                    <text x={b.x + b.w / 2} y={14.5} textAnchor="middle" fill="#475569" fontSize={1.6}>
                      {ws.pumps.length} nasos · {ws.running} ishlayapti
                    </text>
                  )}
                </g>
              );
            })}
            {/* quvurlar (sexlar orasidagi bog'lanish) */}
            <line x1={34} y1={29} x2={36} y2={29} stroke="#334155" strokeWidth={0.4} />
            <line x1={66} y1={29} x2={68} y2={29} stroke="#334155" strokeWidth={0.4} />
          </svg>

          {/* nasoslar — pos_x/pos_y % bo'yicha joylashtiriladi */}
          {pumps.map(p => {
            const x = p.pos_x ?? 50;
            const y = p.pos_y ?? 50;
            const color = statusFill[p.status] ?? '#64748b';
            const pulse = p.status === 'critical';
            return (
              <Link key={p.id} to={`/pumps/${p.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}>
                <div className="flex flex-col items-center gap-1">
                  <span className="relative flex items-center justify-center">
                    {pulse && <span className="absolute w-7 h-7 rounded-full animate-ping" style={{ background: color, opacity: 0.4 }} />}
                    <span className="w-5 h-5 rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center"
                      style={{ background: color }}>
                      <span className="text-[8px] font-bold text-white">{p.health_score}</span>
                    </span>
                  </span>
                  <span className="text-[10px] font-medium text-txt bg-bg-soft/80 px-1.5 py-0.5 rounded whitespace-nowrap group-hover:bg-bg-hover">
                    {p.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Sex bo'yicha xulosa */}
      <div className="grid sm:grid-cols-3 gap-4">
        {workshops.map(w => (
          <Card key={w.name}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{w.name}</h3>
              <span className="text-muted text-sm">{w.pumps.length} nasos</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-ok">{w.running} ishlayapti</span>
              {w.warning > 0 && <span className="text-warn">{w.warning} ogohlantirish</span>}
              {w.critical > 0 && <span className="text-crit">{w.critical} kritik</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
