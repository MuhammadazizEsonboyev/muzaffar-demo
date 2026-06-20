import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/supabase';
import { Pump } from '../types';
import { Spinner, ErrorState, EmptyState, Badge, HealthRing } from '../components/ui';
import { statusBadge, statusLabel, statusDot } from '../utils/format';

export default function Pumps() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const nav = useNavigate();

  useEffect(() => {
    api.pumps().then(setPumps).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const filtered = filter === 'all' ? pumps : pumps.filter(p => p.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'running', 'warning', 'critical', 'stopped'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn text-xs ${filter === s ? 'bg-brand-dim text-white' : 'btn-ghost'}`}>
            {s === 'all' ? 'Barchasi' : statusLabel[s as keyof typeof statusLabel]}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-muted text-xs uppercase">
                <tr>
                  {['Nasos', 'Model', 'Holati', 'Health', 'Ish soatlari', 'Joylashuv'].map(h => (
                    <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} onClick={() => nav(`/pumps/${p.id}`)}
                    className="border-t border-line hover:bg-bg-hover cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot[p.status]}`} /> {p.name}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.model}</td>
                    <td className="px-4 py-3"><Badge className={statusBadge[p.status]}>{statusLabel[p.status]}</Badge></td>
                    <td className="px-4 py-3"><HealthRing score={p.health_score} size={42} /></td>
                    <td className="px-4 py-3 text-muted">{Number(p.running_hours).toLocaleString()} soat</td>
                    <td className="px-4 py-3 text-muted">{p.location ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
