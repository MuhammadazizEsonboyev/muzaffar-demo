import { Pump, SensorReading, DiagnosticResult } from '../types/index.js';

/**
 * DIAGNOSTIKA QOIDALARI — Predictive maintenance rule engine.
 * Returns an array of triggered diagnostic results for a reading.
 */
export function runDiagnostics(pump: Pump, r: SensorReading): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // 1. Podshipnik qizishi (Bearing overheat)
  if (r.bearing_temp > 75) {
    results.push(mk('BEARING_OVERHEAT', 'Podshipnik kritik qizishi', `Podshipnik harorati ${r.bearing_temp}°C — kritik chegaradan oshdi`, 'bearing_temp', r.bearing_temp, 75, 'critical'));
  } else if (r.bearing_temp > 65) {
    results.push(mk('BEARING_OVERHEAT', 'Podshipnik qizishi', `Podshipnik harorati ${r.bearing_temp}°C — ogohlantirish`, 'bearing_temp', r.bearing_temp, 65, 'medium'));
  }

  // 2. Kavitatsiya (Cavitation)
  if (r.inlet_pressure < 0.1 && r.vibration > 3.5) {
    results.push(mk('CAVITATION', 'Kavitatsiya aniqlandi', `Kirish bosimi past (${r.inlet_pressure} bar) va vibratsiya yuqori (${r.vibration} mm/s)`, 'inlet_pressure', r.inlet_pressure, 0.1, 'high'));
  }

  // 3. Ishchi g'ildirak yeyilishi (Impeller wear) — >20% drop vs baseline
  if (pump.baseline_outlet_pressure && pump.baseline_flow_rate) {
    const pDrop = pctDrop(pump.baseline_outlet_pressure, r.outlet_pressure);
    const fDrop = pctDrop(pump.baseline_flow_rate, r.flow_rate);
    if (pDrop > 20 && fDrop > 20) {
      results.push(mk('IMPELLER_WEAR', 'Ishchi g\'ildirak yeyilishi', `Bosim ${pDrop.toFixed(0)}% va sarf ${fDrop.toFixed(0)}% pasaydi`, 'flow_rate', r.flow_rate, pump.baseline_flow_rate, 'high'));
    }
  }

  // 4. Salnik sizishi (Seal leak)
  if (pump.baseline_flow_rate) {
    const fDrop = pctDrop(pump.baseline_flow_rate, r.flow_rate);
    if (r.seal_temp > 75 && fDrop > 15) {
      results.push(mk('SEAL_LEAK', 'Salnik sizishi', `Salnik harorati ${r.seal_temp}°C va sarf ${fDrop.toFixed(0)}% pasaydi`, 'seal_temp', r.seal_temp, 75, 'high'));
    }
  }

  // 5. Podshipnik yeyilishi (Bearing wear)
  if (r.bearing_temp > 70 && r.vibration > 3.0) {
    results.push(mk('BEARING_WEAR', 'Podshipnik yeyilishi', `Harorat ${r.bearing_temp}°C va vibratsiya ${r.vibration} mm/s`, 'vibration', r.vibration, 3.0, 'high'));
  }

  // 6. Vibratsiya (Vibration)
  if (r.vibration > 7) {
    results.push(mk('VIBRATION_HIGH', 'Kritik vibratsiya', `Vibratsiya ${r.vibration} mm/s — kritik`, 'vibration', r.vibration, 7, 'critical'));
  } else if (r.vibration > 4.5) {
    results.push(mk('VIBRATION_HIGH', 'Yuqori vibratsiya', `Vibratsiya ${r.vibration} mm/s — ogohlantirish`, 'vibration', r.vibration, 4.5, 'medium'));
  }

  // 7. Yetarli bo'lmagan oqim (Low flow)
  if (r.flow_rate < 60) {
    results.push(mk('LOW_FLOW', 'Yetarsiz oqim', `Sarf ${r.flow_rate} m³/h — minimal chegaradan past`, 'flow_rate', r.flow_rate, 60, 'medium'));
  }

  // 8. Dvigatel yuklanishi (Motor overload)
  if (pump.rated_current) {
    const loadPct = (r.current_a / pump.rated_current) * 100;
    if (loadPct > 110 && r.vibration > 3.0) {
      results.push(mk('MOTOR_OVERLOAD', 'Dvigatel yuklanishi', `Tok ${loadPct.toFixed(0)}% nominaldan va vibratsiya yuqori`, 'current_a', r.current_a, pump.rated_current * 1.1, 'high'));
    }
  }

  return results;
}

/** Health score 0-100 derived from worst conditions + running hours penalty */
export function computeHealthScore(pump: Pump, r: SensorReading, diagnostics: DiagnosticResult[]): number {
  let score = 100;
  for (const d of diagnostics) {
    score -= d.severity === 'critical' ? 35 : d.severity === 'high' ? 20 : d.severity === 'medium' ? 10 : 4;
  }
  // running hours wear penalty (max ~15 pts at 40k hours)
  score -= Math.min(15, (pump.running_hours / 40000) * 15);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Overall pump status from diagnostics */
export function deriveStatus(diagnostics: DiagnosticResult[]): 'running' | 'warning' | 'critical' {
  if (diagnostics.some(d => d.severity === 'critical')) return 'critical';
  if (diagnostics.some(d => d.severity === 'high' || d.severity === 'medium')) return 'warning';
  return 'running';
}

function pctDrop(baseline: number, current: number): number {
  if (!baseline) return 0;
  return ((baseline - current) / baseline) * 100;
}

function mk(rule_code: string, title: string, message: string, parameter: string, value: number, threshold: number, severity: DiagnosticResult['severity']): DiagnosticResult {
  return { rule_code, title, message, parameter, value, threshold, severity };
}
