export type PumpStatus = 'running' | 'warning' | 'critical' | 'stopped' | 'maintenance';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type MaintStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MaintPriority = 'low' | 'medium' | 'high';

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
  id: number;
  pump_id: string;
  bearing_temp: number;
  seal_temp: number;
  vibration: number;
  inlet_pressure: number;
  outlet_pressure: number;
  flow_rate: number;
  current_a: number;
  rpm: number;
  recorded_at: string;
}

export interface Alert {
  id: string;
  pump_id: string;
  rule_code: string;
  title: string;
  message: string | null;
  parameter: string | null;
  value: number | null;
  threshold: number | null;
  severity: Severity;
  status: AlertStatus;
  telegram_sent: boolean;
  created_at: string;
  resolved_at: string | null;
  pumps?: { name: string; model: string };
}

export interface Maintenance {
  id: string;
  pump_id: string;
  title: string;
  description: string | null;
  status: MaintStatus;
  priority: MaintPriority;
  scheduled_at: string | null;
  completed_at: string | null;
  pumps?: { name: string };
}

export interface InventoryItem {
  id: string;
  part_name: string;
  part_code: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  location: string | null;
}

export interface DashboardStats {
  total: number;
  running: number;
  warnings: number;
  critical: number;
  maintenanceToday: number;
}
