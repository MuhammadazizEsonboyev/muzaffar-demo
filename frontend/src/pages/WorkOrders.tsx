import { useEffect, useState } from 'react';
import { Plus, X, Wrench, Package, Clock } from 'lucide-react';
import { api } from '../lib/supabase';
import { WorkOrder, Pump, InventoryItem, WOStatus } from '../types';
import { Card, Spinner, ErrorState, EmptyState, Badge } from '../components/ui';
import { fmtTime } from '../utils/format';

const woStatusBadge: Record<WOStatus, string> = {
  open: 'bg-info/10 text-info',
  assigned: 'bg-brand-dim/15 text-brand',
  in_progress: 'bg-warn/10 text-warn',
  on_hold: 'bg-muted/10 text-muted',
  completed: 'bg-ok/10 text-ok',
  cancelled: 'bg-crit/10 text-crit',
};
const woStatusLabel: Record<WOStatus, string> = {
  open: 'Ochiq', assigned: 'Biriktirilgan', in_progress: 'Bajarilmoqda',
  on_hold: 'To\'xtatilgan', completed: 'Bajarilgan', cancelled: 'Bekor qilingan',
};
const priorityBadge: Record<string, string> = {
  low: 'bg-muted/10 text-muted', medium: 'bg-info/10 text-info',
  high: 'bg-warn/10 text-warn', urgent: 'bg-crit/10 text-crit',
};
const priorityLabel: Record<string, string> = { low: 'Past', medium: 'O\'rta', high: 'Yuqori', urgent: 'Shoshilinch' };
const typeLabel: Record<string, string> = { corrective: 'Tuzatuvchi', preventive: 'Profilaktik', inspection: 'Tekshiruv' };

const statusFlow: WOStatus[] = ['open', 'assigned', 'in_progress', 'completed'];

export default function WorkOrders() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<WorkOrder | null>(null);

  const load = () => {
    const params: Record<string, string> = filter ? { status: filter } : {};
    return Promise.all([api.workOrders(params), api.pumps()])
      .then(([wo, p]) => { setItems(wo); setPumps(p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const updateStatus = async (id: string, status: WOStatus) => {
    await api.updateWorkOrder(id, { status });
    load();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {['', 'open', 'in_progress', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === s ? 'bg-brand-dim/15 text-brand font-medium' : 'text-muted hover:bg-bg-hover'}`}>
              {s === '' ? 'Hammasi' : woStatusLabel[s as WOStatus]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary ml-auto flex items-center gap-2">
          <Plus size={16} /> Yangi ish-naryad
        </button>
      </div>

      {items.length === 0 ? <EmptyState message="Ish-naryadlar topilmadi" /> : (
        <div className="grid gap-3">
          {items.map(wo => (
            <Card key={wo.id} className="hover:bg-bg-hover transition-colors cursor-pointer" >
              <div onClick={() => api.workOrder(wo.id).then(setDetail)}>
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="p-2 rounded-lg bg-bg-soft text-brand"><Wrench size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{wo.title}</span>
                      <Badge className={priorityBadge[wo.priority]}>{priorityLabel[wo.priority]}</Badge>
                      <Badge className="bg-bg-soft text-muted">{typeLabel[wo.type]}</Badge>
                    </div>
                    <p className="text-muted text-sm mt-0.5">
                      {wo.wo_number} · {wo.pumps?.name ?? 'Nasos —'} · {fmtTime(wo.created_at)}
                    </p>
                    {wo.description && <p className="text-sm mt-1 text-txt/80">{wo.description}</p>}
                  </div>
                  <Badge className={woStatusBadge[wo.status]}>{woStatusLabel[wo.status]}</Badge>
                </div>
              </div>
              {/* status tugmalari */}
              {wo.status !== 'completed' && wo.status !== 'cancelled' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-line/50">
                  {statusFlow.filter(s => statusFlow.indexOf(s) > statusFlow.indexOf(wo.status)).slice(0, 1).map(next => (
                    <button key={next} onClick={() => updateStatus(wo.id, next)}
                      className="btn-ghost text-xs px-3 py-1.5 border border-line rounded-lg hover:border-brand">
                      → {woStatusLabel[next]}
                    </button>
                  ))}
                  <button onClick={() => updateStatus(wo.id, 'cancelled')}
                    className="btn-ghost text-xs px-3 py-1.5 text-crit hover:bg-crit/10 rounded-lg">
                    Bekor qilish
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateModal pumps={pumps} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {detail && <DetailModal wo={detail} onClose={() => setDetail(null)} onChanged={() => { api.workOrder(detail.id).then(setDetail); load(); }} />}
    </div>
  );
}

function CreateModal({ pumps, onClose, onCreated }: { pumps: Pump[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', pump_id: '', type: 'corrective', priority: 'medium' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!form.title) { setErr('Sarlavha kiriting'); return; }
    setSaving(true);
    try {
      await api.createWorkOrder({ ...form, pump_id: form.pump_id || null });
      onCreated();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title="Yangi ish-naryad" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Sarlavha">
          <input className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Masalan: Podshipnik almashtirish" />
        </Field>
        <Field label="Tavsif">
          <textarea className="input w-full" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Nasos">
          <select className="input w-full" value={form.pump_id} onChange={e => setForm({ ...form, pump_id: e.target.value })}>
            <option value="">— tanlanmagan —</option>
            {pumps.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Turi">
            <select className="input w-full" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="corrective">Tuzatuvchi</option>
              <option value="preventive">Profilaktik</option>
              <option value="inspection">Tekshiruv</option>
            </select>
          </Field>
          <Field label="Muhimlik">
            <select className="input w-full" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Past</option>
              <option value="medium">O'rta</option>
              <option value="high">Yuqori</option>
              <option value="urgent">Shoshilinch</option>
            </select>
          </Field>
        </div>
        {err && <p className="text-crit text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="btn-ghost px-4 py-2">Bekor</button>
          <button onClick={submit} disabled={saving} className="btn-primary px-4 py-2">{saving ? 'Saqlanmoqda...' : 'Yaratish'}</button>
        </div>
      </div>
    </Modal>
  );
}

function DetailModal({ wo, onClose, onChanged }: { wo: WorkOrder; onClose: () => void; onChanged: () => void }) {
  const [inv, setInv] = useState<InventoryItem[]>([]);
  const [partId, setPartId] = useState('');
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');

  useEffect(() => { api.inventory().then(setInv); }, []);

  const addPart = async () => {
    if (!partId) return;
    setErr('');
    try {
      await api.addWorkOrderPart(wo.id, { inventory_id: partId, quantity: qty });
      setPartId(''); setQty(1); onChanged();
    } catch (e: any) { setErr(e.message); }
  };

  const total = (wo.labor_cost ?? 0) + (wo.parts_cost ?? 0);

  return (
    <Modal title={wo.wo_number} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{wo.title}</h3>
          {wo.description && <p className="text-muted text-sm mt-1">{wo.description}</p>}
          <p className="text-muted text-sm mt-2">{wo.pumps?.name} · {wo.pumps?.model}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="card p-3"><p className="text-muted text-xs">Ish soati</p><p className="font-bold">{wo.labor_hours} s</p></div>
          <div className="card p-3"><p className="text-muted text-xs">Qism xarajati</p><p className="font-bold text-info">{(wo.parts_cost ?? 0).toLocaleString()}</p></div>
          <div className="card p-3"><p className="text-muted text-xs">Jami</p><p className="font-bold text-brand">{total.toLocaleString()}</p></div>
        </div>

        {/* qismlar */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Package size={15} /> Ishlatilgan qismlar</h4>
          {wo.parts && wo.parts.length > 0 ? (
            <div className="space-y-1.5">
              {wo.parts.map(p => (
                <div key={p.id} className="flex justify-between text-sm bg-bg-soft rounded-lg px-3 py-2">
                  <span>{p.inventory?.part_name} × {p.quantity}</span>
                  <span className="text-muted">{(p.unit_cost * p.quantity).toLocaleString()} so'm</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted text-sm">Qism qo'shilmagan</p>}

          {wo.status !== 'completed' && wo.status !== 'cancelled' && (
            <div className="flex gap-2 mt-3">
              <select className="input flex-1" value={partId} onChange={e => setPartId(e.target.value)}>
                <option value="">Qism tanlang...</option>
                {inv.map(i => <option key={i.id} value={i.id}>{i.part_name} (mavjud: {i.quantity})</option>)}
              </select>
              <input type="number" min={1} className="input w-20" value={qty} onChange={e => setQty(Number(e.target.value))} />
              <button onClick={addPart} className="btn-primary px-3">Qo'shish</button>
            </div>
          )}
          {err && <p className="text-crit text-sm mt-2">{err}</p>}
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-auto p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-muted text-sm block mb-1">{label}</label>{children}</div>;
}
