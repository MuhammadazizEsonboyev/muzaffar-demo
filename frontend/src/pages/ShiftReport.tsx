import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { api } from '../lib/supabase';
import { Analytics, ShiftLog, WorkOrder, MnemoPump } from '../types';
import { Spinner, ErrorState } from '../components/ui';
import { statusLabel } from '../utils/format';

export default function ShiftReport() {
  const [a, setA] = useState<Analytics | null>(null);
  const [shift, setShift] = useState<ShiftLog | null>(null);
  const [wos, setWos] = useState<WorkOrder[]>([]);
  const [pumps, setPumps] = useState<MnemoPump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.analytics(), api.shiftLogs(), api.workOrders(), api.mnemoscheme()])
      .then(([an, sh, wo, mn]) => { setA(an); setShift(sh[0] ?? null); setWos(wo); setPumps(mn.pumps); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const today = new Date();
  const critical = pumps.filter(p => p.status === 'critical');
  const openWos = wos.filter(w => ['open', 'assigned', 'in_progress'].includes(w.status));

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Printer size={16} /> Chop etish / PDF saqlash
        </button>
      </div>

      {/* Bosiladigan hisobot */}
      <div className="card p-8 print:shadow-none print:border-0 bg-white text-slate-900" id="report">
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold">AGMK — Nasos Monitoring Tizimi</h1>
          <p className="text-slate-600">Smena hisoboti · {today.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-slate-500 text-sm">Yaratilgan: {today.toLocaleString('uz-UZ')}</p>
        </div>

        {/* KPI */}
        {a && (
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-slate-800">Umumiy ko'rsatkichlar</h2>
            <div className="grid grid-cols-4 gap-3">
              <ReportStat label="OEE" value={`${a.oee}%`} />
              <ReportStat label="O'rtacha sog'liq" value={`${a.avgHealth}%`} />
              <ReportStat label="Ishlayotgan" value={`${pumps.filter(p => p.status === 'running').length}/${pumps.length}`} />
              <ReportStat label="Ochiq ish-naryad" value={a.openWorkOrders} />
            </div>
          </section>
        )}

        {/* Kritik holatlar */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-slate-800">Kritik holatlar ({critical.length})</h2>
          {critical.length === 0 ? <p className="text-slate-500">Kritik holat yo'q.</p> : (
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-slate-100 text-left">
                <th className="border border-slate-300 px-3 py-1.5">Nasos</th>
                <th className="border border-slate-300 px-3 py-1.5">Model</th>
                <th className="border border-slate-300 px-3 py-1.5">Sex</th>
                <th className="border border-slate-300 px-3 py-1.5">Sog'liq</th>
              </tr></thead>
              <tbody>{critical.map(p => (
                <tr key={p.id}>
                  <td className="border border-slate-300 px-3 py-1.5 font-medium">{p.name}</td>
                  <td className="border border-slate-300 px-3 py-1.5">{p.model}</td>
                  <td className="border border-slate-300 px-3 py-1.5">{p.workshop ?? '—'}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-red-600 font-bold">{p.health_score}%</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </section>

        {/* Ochiq ish-naryadlar */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-slate-800">Ochiq ish-naryadlar ({openWos.length})</h2>
          {openWos.length === 0 ? <p className="text-slate-500">Ochiq ish-naryad yo'q.</p> : (
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-slate-100 text-left">
                <th className="border border-slate-300 px-3 py-1.5">Raqam</th>
                <th className="border border-slate-300 px-3 py-1.5">Sarlavha</th>
                <th className="border border-slate-300 px-3 py-1.5">Nasos</th>
                <th className="border border-slate-300 px-3 py-1.5">Holat</th>
              </tr></thead>
              <tbody>{openWos.map(w => (
                <tr key={w.id}>
                  <td className="border border-slate-300 px-3 py-1.5 font-mono text-xs">{w.wo_number}</td>
                  <td className="border border-slate-300 px-3 py-1.5">{w.title}</td>
                  <td className="border border-slate-300 px-3 py-1.5">{w.pumps?.name ?? '—'}</td>
                  <td className="border border-slate-300 px-3 py-1.5">{w.status}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </section>

        {/* Smena topshirig'i */}
        {shift && (
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-slate-800">Oxirgi smena topshirig'i</h2>
            <div className="border border-slate-300 rounded p-3 text-sm">
              <p><strong>{shift.shift_name}</strong> · {shift.operator}{shift.received_by ? ` → ${shift.received_by}` : ''}</p>
              <p className="mt-1">{shift.summary}</p>
              {shift.open_issues && <p className="mt-1 text-amber-700"><strong>Ochiq muammolar:</strong> {shift.open_issues}</p>}
            </div>
          </section>
        )}

        <div className="border-t border-slate-300 pt-4 mt-8 flex justify-between text-sm text-slate-500">
          <div>Tayyorladi: ________________</div>
          <div>Tasdiqladi: ________________</div>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-slate-300 rounded p-3 text-center">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
