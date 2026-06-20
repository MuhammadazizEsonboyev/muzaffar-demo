import { useEffect, useState, useCallback } from 'react';
import { Check, Send } from 'lucide-react';
import { api } from '../lib/supabase';
import { Alert } from '../types';
import { Spinner, ErrorState, EmptyState, Badge } from '../components/ui';
import { severityBadge, severityLabel, fmtTime } from '../utils/format';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sev, setSev] = useState('all');
  const [status, setStatus] = useState('all');

  const load = useCallback(() => {
    const params: Record<string, string> = {};
    if (sev !== 'all') params.severity = sev;
    if (status !== 'all') params.status = status;
    api.alerts(params).then(setAlerts).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [sev, status]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, s: string) => {
    await api.updateAlert(id, s);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select className="input" value={sev} onChange={e => setSev(e.target.value)}>
          <option value="all">Barcha darajalar</option>
          <option value="low">Past</option><option value="medium">O'rta</option>
          <option value="high">Yuqori</option><option value="critical">Kritik</option>
        </select>
        <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Barcha holatlar</option>
          <option value="open">Ochiq</option><option value="acknowledged">Tasdiqlangan</option>
          <option value="resolved">Yopilgan</option>
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} /> :
        alerts.length === 0 ? <EmptyState message="Ogohlantirishlar yo'q" /> : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft text-muted text-xs uppercase">
                  <tr>{['Nasos', 'Muammo', 'Qiymat', 'Daraja', 'Holat', 'Vaqt', 'TG', 'Amal'].map(h =>
                    <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a.id} className="border-t border-line hover:bg-bg-hover">
                      <td className="px-4 py-3 font-medium">{a.pumps?.name ?? '—'}</td>
                      <td className="px-4 py-3">{a.title}</td>
                      <td className="px-4 py-3 text-muted">{a.value} / {a.threshold}</td>
                      <td className="px-4 py-3"><Badge className={severityBadge[a.severity]}>{severityLabel[a.severity]}</Badge></td>
                      <td className="px-4 py-3 text-muted">{a.status}</td>
                      <td className="px-4 py-3 text-muted">{fmtTime(a.created_at)}</td>
                      <td className="px-4 py-3">{a.telegram_sent && <Send size={14} className="text-info" />}</td>
                      <td className="px-4 py-3">
                        {a.status !== 'resolved' && (
                          <div className="flex gap-1">
                            {a.status === 'open' &&
                              <button onClick={() => act(a.id, 'acknowledged')} className="btn-ghost text-xs p-1.5" title="Tasdiqlash"><Check size={14} /></button>}
                            <button onClick={() => act(a.id, 'resolved')} className="btn-ghost text-xs px-2 py-1 text-ok">Yopish</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
