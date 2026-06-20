import { supabaseAdmin } from '../config/supabase.js';
import { ingestReading } from '../services/ingestion.js';
import { Pump } from '../types/index.js';

/**
 * SIMULATOR — generates realistic sensor readings for every running pump
 * every few seconds. Occasionally injects fault conditions so the
 * diagnostics engine, alerts and Telegram pipeline can be observed live.
 *
 * Run: npm run simulate
 */
const INTERVAL_MS = 4000;

function jitter(base: number, spread: number) {
  return +(base + (Math.random() - 0.5) * spread).toFixed(2);
}

async function tick() {
  const { data: pumps } = await supabaseAdmin.from('pumps').select('*');
  if (!pumps) return;

  for (const p of pumps as Pump[]) {
    if (p.status === 'stopped' || p.status === 'maintenance') continue;

    // ~12% chance of a fault scenario
    const fault = Math.random() < 0.12;

    const base = p.baseline_flow_rate ?? 170;
    const reading = {
      pump_id: p.id,
      bearing_temp: fault ? jitter(78, 6) : jitter(55, 8),
      seal_temp: fault ? jitter(76, 5) : jitter(50, 8),
      vibration: fault ? jitter(6.5, 3) : jitter(2.2, 1.2),
      inlet_pressure: fault ? jitter(0.08, 0.05) : jitter(1.4, 0.4),
      outlet_pressure: fault ? jitter((p.baseline_outlet_pressure ?? 6) * 0.7, 0.4) : jitter(p.baseline_outlet_pressure ?? 6, 0.5),
      flow_rate: fault ? jitter(base * 0.7, 10) : jitter(base, 15),
      current_a: fault ? jitter((p.rated_current ?? 90) * 1.15, 8) : jitter((p.rated_current ?? 90) * 0.85, 10),
      rpm: Math.round(jitter(2950, 60)),
    };

    try {
      const res = await ingestReading(reading as any);
      const tag = res.diagnostics.length ? `⚠ ${res.diagnostics.length} alert(s)` : 'ok';
      console.log(`[sim] ${p.name}  health=${res.health}  ${tag}`);
    } catch (e) {
      console.error(`[sim] ${p.name} xato:`, e instanceof Error ? e.message : e);
    }
  }
}

console.log('[sim] Simulator ishga tushdi. To\'xtatish: Ctrl+C');
tick();
setInterval(tick, INTERVAL_MS);