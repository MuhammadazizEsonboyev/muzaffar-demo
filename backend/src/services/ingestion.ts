import { supabaseAdmin } from '../config/supabase.js';
import { Pump, SensorReading } from '../types/index.js';
import { runDiagnostics, computeHealthScore, deriveStatus } from './diagnostics.js';
import { sendTelegramAlert } from './telegram.js';

/**
 * Process an incoming sensor reading:
 *  1. store reading (triggers Supabase Realtime -> frontend updates)
 *  2. run diagnostics
 *  3. create alerts (+ telegram for critical)
 *  4. update pump status & health score
 */
export async function ingestReading(reading: SensorReading) {
  const { data: pump, error: pumpErr } = await supabaseAdmin
    .from('pumps').select('*').eq('id', reading.pump_id).single();

  if (pumpErr || !pump) throw new Error(`Pump topilmadi: ${reading.pump_id}`);

  // 1. store reading
  const { data: stored, error: insErr } = await supabaseAdmin
    .from('sensor_readings').insert(reading).select().single();
  if (insErr) throw insErr;

  // 2. diagnostics
  const diagnostics = runDiagnostics(pump as Pump, reading);

  // 3. alerts
  for (const d of diagnostics) {
    const telegramSent = d.severity === 'critical'
      ? await sendTelegramAlert(pump as Pump, d)
      : false;

    await supabaseAdmin.from('alerts').insert({
      pump_id: pump.id,
      rule_code: d.rule_code,
      title: d.title,
      message: d.message,
      parameter: d.parameter,
      value: d.value,
      threshold: d.threshold,
      severity: d.severity,
      telegram_sent: telegramSent,
    });
  }

  // 4. update pump
  const health = computeHealthScore(pump as Pump, reading, diagnostics);
  const status = pump.status === 'stopped' || pump.status === 'maintenance'
    ? pump.status
    : deriveStatus(diagnostics);

  await supabaseAdmin.from('pumps')
    .update({ health_score: health, status, running_hours: Number(pump.running_hours) + 0.05 })
    .eq('id', pump.id);

  return { reading: stored, diagnostics, health, status };
}
