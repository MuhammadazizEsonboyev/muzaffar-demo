import { useEffect, useState } from 'react';
import { Plus, X, ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '../lib/supabase';
import { ShiftLog } from '../types';
import { Card, Spinner, ErrorState, EmptyState } from '../components/ui';
import { fmtTime } from '../utils/format';

export default function ShiftLogs() {
  const [items, setItems] = useState<ShiftLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const load = () => api.shiftLogs().then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center">
        <p className="text-muted text-sm">Smenalar orasidagi holat topshirig'i</p>
        <button onClick={() => setShow(true)} className="btn-primary ml-auto flex items-center gap-2">
          <Plus size={16} /> Yangi topshiriq
        </button>
      </div>

      {items.length === 0 ? <EmptyState message="Smena yozuvlari yo'q" /> : (
        <div className="space-y-3">
          {items.map(s => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-bg-soft text-info"><ClipboardList size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-semibold">{s.shift_name}</span>
                    <span className="text-muted">·</span>
                    <span className="flex items-center gap-1.5 text-muted">
                      {s.operator} {s.received_by && <><ArrowRight size={12} /> {s.received_by}</>}
                    </span>
                    <span className="text-muted text-xs ml-auto">{fmtTime(s.created_at)}</span>
                  </div>
                  <p className="text-sm mt-2">{s.summary}</p>
                  {s.open_issues && (
                    <div className="mt-2 text-sm bg-warn/5 border border-warn/20 rounded-lg px-3 py-2 text-warn">
                      <span className="font-medium">Ochiq muammolar: </span>{s.open_issues}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {show && <CreateModal onClose={() => setShow(false)} onCreated={() => { setShow(false); load(); }} />}
    </div>
  );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ shift_name: '', operator: '', received_by: '', summary: '', open_issues: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!form.shift_name || !form.operator || !form.summary) { setErr('Smena, operator va bayon majburiy'); return; }
    setSaving(true);
    try { await api.createShiftLog(form); onCreated(); }
    catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Smena topshirig'i</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-muted text-sm block mb-1">Smena</label>
              <input className="input w-full" value={form.shift_name} onChange={e => setForm({ ...form, shift_name: e.target.value })} placeholder="1-smena" /></div>
            <div><label className="text-muted text-sm block mb-1">Operator</label>
              <input className="input w-full" value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })} placeholder="F.I.O" /></div>
          </div>
          <div><label className="text-muted text-sm block mb-1">Qabul qiluvchi</label>
            <input className="input w-full" value={form.received_by} onChange={e => setForm({ ...form, received_by: e.target.value })} placeholder="F.I.O (ixtiyoriy)" /></div>
          <div><label className="text-muted text-sm block mb-1">Holat bayoni</label>
            <textarea className="input w-full" rows={3} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></div>
          <div><label className="text-muted text-sm block mb-1">Ochiq muammolar</label>
            <textarea className="input w-full" rows={2} value={form.open_issues} onChange={e => setForm({ ...form, open_issues: e.target.value })} /></div>
          {err && <p className="text-crit text-sm">{err}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="btn-ghost px-4 py-2">Bekor</button>
            <button onClick={submit} disabled={saving} className="btn-primary px-4 py-2">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
