export type PumpStatus = 'running' | 'warning' | 'critical' | 'stopped' | 'maintenance';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Pump {
  id: string;
  name: string;
  model: string;
  location: string | null;
  serial_number: string | null;
  status: PumpStatus;
  health_score: number;
  running_hours: number;
  baseline_outlet_pressure: number | null;
  baseline_flow_rate: number | null;
  rated_current: number | null;
}

export interface SensorReading {
  id?: number;
  pump_id: string;
  bearing_temp: number;
  seal_temp: number;
  vibration: number;
  inlet_pressure: number;
  outlet_pressure: number;
  flow_rate: number;
  current_a: number;
  rpm: number;
  recorded_at?: string;
}

export interface DiagnosticResult {
  rule_code: string;
  title: string;
  message: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: Severity;
}
