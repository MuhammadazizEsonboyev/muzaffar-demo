import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/supabase';
import { Maintenance } from '../types';
import { Spinner, ErrorState, EmptyState, Badge } from '../components/ui';
import { fmtTime } from '../utils/format';

const statusLabel: Record<string, string> = {
  scheduled: 'Rejalashtirilgan', in_progress: 'Jarayonda', completed: 'Yakunlangan', cancelled: 'Bekor qilingan',
};
const statusStyle: Record<string, string> = {
  scheduled: 'bg-info/10 text-info', in_progress: 'bg-warn/10 text-warn',
  completed: 'bg-ok/10 text-ok', cancelled: 'bg-muted/10 text-muted',
};
const prioStyle: Record<string, string> = {
  low: 'bg-info/10 text-info', medium: 'bg-warn/10 text-warn', high: 'bg-crit/10 text-crit',
};
const prioLabel: Record<string, string> = { low: 'Past', medium: 'O\'rta', high: 'Yuqori' };

export default function MaintenancePage() {
  const [items, setItems] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    const params: Record<string, string> = tab === 'all' ? {} : { status: tab };
    api.maintenance(params).then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const advance = async (m: Maintenance) => {
    const next = m.status === 'scheduled' ? 'in_progress' : 'completed';
    const body: any = { status: next };
    if (next === 'completed') body.completed_at = new Date().toISOString();
    await api.updateMaintenance(m.id, body);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'in_progress', 'completed'].map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`btn text-xs ${tab === s ? 'bg-brand-dim text-white' : 'btn-ghost'}`}>
            {s === 'all' ? 'Barchasi' : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} /> :
        items.length === 0 ? <EmptyState message="Texnik xizmatlar yo'q" /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(m => (
              <div key={m.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-muted text-xs">{m.pumps?.name ?? '—'}</p>
                  </div>
                  <Badge className={prioStyle[m.priority]}>{prioLabel[m.priority]}</Badge>
                </div>
                {m.description && <p className="text-muted text-sm">{m.description}</p>}
                <div className="flex items-center justify-between pt-2">
                  <Badge className={statusStyle[m.status]}>{statusLabel[m.status]}</Badge>
                  <span className="text-muted text-xs">{m.scheduled_at ? fmtTime(m.scheduled_at) : '—'}</span>
                </div>
                {m.status !== 'completed' && m.status !== 'cancelled' && (
                  <button onClick={() => advance(m)} className="btn-primary text-xs w-full justify-center">
                    {m.status === 'scheduled' ? 'Boshlash' : 'Yakunlash'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
