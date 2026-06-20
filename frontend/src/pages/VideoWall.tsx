import { useEffect, useState } from 'react';
import { api } from '../lib/supabase';
import { MnemoPump, Workshop, Analytics } from '../types';
import { statusLabel } from '../utils/format';

const statusBg: Record<string, string> = {
  running: 'bg-ok/15 border-ok/40 text-ok',
  warning: 'bg-warn/15 border-warn/40 text-warn',
  critical: 'bg-crit/20 border-crit/50 text-crit',
  stopped: 'bg-muted/10 border-muted/30 text-muted',
  maintenance: 'bg-info/15 border-info/40 text-info',
};

export default function VideoWall() {
  const [pumps, setPumps] = useState<MnemoPump[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [a, setA] = useState<Analytics | null>(null);
  const [now, setNow] = useState(new Date());

  const load = () => {
    api.mnemoscheme().then(d => { setPumps(d.pumps); setWorkshops(d.workshops); }).catch(() => {});
    api.analytics().then(setA).catch(() => {});
  };

  useEffect(() => {
    load();
    const dataTimer = setInterval(load, 5000);
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(dataTimer); clearInterval(clockTimer); };
  }, []);

  const critical = pumps.filter(p => p.status === 'critical');

  return (
    <div className="fixed inset-0 bg-[#0a0e16] text-white p-6 overflow-auto z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AGMK — Nasos Monitoring</h1>
          <p className="text-slate-400">Dispetcher markazi · jonli kuzatuv</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums">{now.toLocaleTimeString('uz-UZ')}</p>
          <p className="text-slate-400">{now.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* KPI lentasi */}
      {a && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Kpi label="OEE" value={`${a.oee}%`} color={a.oee >= 75 ? 'text-ok' : a.oee >= 50 ? 'text-warn' : 'text-crit'} />
          <Kpi label="O'rtacha sog'liq" value={`${a.avgHealth}%`} color="text-ok" />
          <Kpi label="Ishlayotgan" value={`${pumps.filter(p => p.status === 'running').length}/${pumps.length}`} color="text-ok" />
          <Kpi label="Ochiq ogohlantirish" value={a.openAlerts} color={a.openAlerts > 0 ? 'text-warn' : 'text-ok'} />
          <Kpi label="Kritik holat" value={a.criticalAlerts} color={a.criticalAlerts > 0 ? 'text-crit' : 'text-ok'} />
        </div>
      )}

      {/* Kritik holatlar bannerи */}
      {critical.length > 0 && (
        <div className="mb-6 bg-crit/20 border-2 border-crit/50 rounded-xl p-4 animate-pulse">
          <p className="text-crit font-bold text-xl mb-1">⚠ KRITIK HOLAT — {critical.length} ta nasos</p>
          <p className="text-crit/80">{critical.map(p => p.name).join(', ')}</p>
        </div>
      )}

      {/* Sexlar */}
      <div className="grid lg:grid-cols-3 gap-5">
        {workshops.map(w => (
          <div key={w.name} className="bg-[#0f1520] rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{w.name}</h2>
              <div className="flex gap-2 text-sm">
                {w.critical > 0 && <span className="px-2 py-0.5 rounded bg-crit/20 text-crit">{w.critical} kritik</span>}
                {w.warning > 0 && <span className="px-2 py-0.5 rounded bg-warn/20 text-warn">{w.warning} ogoh.</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {w.pumps.map(p => (
                <div key={p.id} className={`rounded-lg border-2 p-3 ${statusBg[p.status]}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-2xl font-bold">{p.health_score}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{statusLabel[p.status]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-600 text-sm mt-6">Avtomatik yangilanish · har 5 soniya</p>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#0f1520] rounded-xl border border-slate-800 p-4 text-center">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
