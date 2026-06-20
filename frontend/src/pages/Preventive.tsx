import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/supabase';
import { PreventiveItem } from '../types';
import { Card, Spinner, ErrorState, Badge } from '../components/ui';

const dueBadge: Record<string, string> = {
  overdue: 'bg-crit/10 text-crit',
  soon: 'bg-warn/10 text-warn',
  ok: 'bg-ok/10 text-ok',
};
const dueLabel: Record<string, string> = { overdue: 'Muddati o\'tgan', soon: 'Yaqinlashmoqda', ok: 'Yaxshi' };
const dueIcon: Record<string, any> = { overdue: AlertTriangle, soon: CalendarClock, ok: CheckCircle2 };

export default function Preventive() {
  const [items, setItems] = useState<PreventiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.preventiveSchedule().then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const overdue = items.filter(i => i.due === 'overdue').length;
  const soon = items.filter(i => i.due === 'soon').length;

  return (
    <div className="space-y-5">
      <div className="flex gap-4 text-sm">
        {overdue > 0 && <span className="text-crit font-medium">{overdue} ta muddati o'tgan</span>}
        {soon > 0 && <span className="text-warn font-medium">{soon} ta yaqinlashmoqda</span>}
        <span className="text-muted">Ish soatlari bo'yicha profilaktika rejasi</span>
      </div>

      <div className="grid gap-3">
        {items.map(it => {
          const Icon = dueIcon[it.due];
          const barColor = it.due === 'overdue' ? 'bg-crit' : it.due === 'soon' ? 'bg-warn' : 'bg-ok';
          return (
            <Card key={it.id}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`p-2 rounded-lg bg-bg-soft ${it.due === 'overdue' ? 'text-crit' : it.due === 'soon' ? 'text-warn' : 'text-ok'}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/pumps/${it.id}`} className="font-semibold hover:text-brand">{it.name}</Link>
                    <Badge className={dueBadge[it.due]}>{dueLabel[it.due]}</Badge>
                  </div>
                  <p className="text-muted text-sm">{it.model} · {it.workshop ?? '—'}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {it.remaining > 0
                      ? <>{Math.round(it.remaining).toLocaleString()} soat qoldi</>
                      : <span className="text-crit">{Math.abs(Math.round(it.remaining)).toLocaleString()} soat kechikdi</span>}
                  </p>
                  <p className="text-muted text-xs">{Math.round(it.sinceService).toLocaleString()} / {it.interval.toLocaleString()} soat</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-bg-soft overflow-hidden">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${Math.min(100, it.pct)}%` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
