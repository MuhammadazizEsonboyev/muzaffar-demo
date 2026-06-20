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

// ---------------- YANGI MODUL TIPLARI ----------------
export type WOStatus = 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type WOPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WOType = 'corrective' | 'preventive' | 'inspection';

export interface WorkOrder {
  id: string;
  wo_number: string;
  pump_id: string | null;
  alert_id: string | null;
  type: WOType;
  title: string;
  description: string | null;
  status: WOStatus;
  priority: WOPriority;
  assigned_to: string | null;
  labor_hours: number;
  labor_cost: number;
  parts_cost: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  pumps?: { name: string; model: string };
  users?: { full_name: string };
  parts?: WorkOrderPart[];
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  inventory_id: string;
  quantity: number;
  unit_cost: number;
  inventory?: { part_name: string; part_code: string; unit: string };
}

export interface ShiftLog {
  id: string;
  shift_name: string;
  operator: string;
  received_by: string | null;
  summary: string;
  open_issues: string | null;
  shift_date: string;
  created_at: string;
}

export interface MnemoPump {
  id: string;
  name: string;
  model: string;
  status: PumpStatus;
  health_score: number;
  workshop: string | null;
  pos_x: number | null;
  pos_y: number | null;
  location: string | null;
}

export interface Workshop {
  name: string;
  pumps: MnemoPump[];
  critical: number;
  warning: number;
  running: number;
}

export interface Analytics {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  avgHealth: number;
  openAlerts: number;
  criticalAlerts: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  maintenanceCost: number;
  avgRepairHours: number;
  healthRanking: { id: string; name: string; model: string; status: PumpStatus; health_score: number; workshop: string | null }[];
  modelComparison: { model: string; count: number; avgHealth: number; running: number; critical: number; totalHours: number }[];
}

export interface PartConsumption {
  consumption: { part_name: string; part_code: string; totalQty: number; totalCost: number }[];
  lowStock: (InventoryItem & { shortage: number; unit_cost?: number })[];
}

export interface PreventiveItem {
  id: string;
  name: string;
  model: string;
  workshop: string | null;
  running_hours: number;
  interval: number;
  sinceService: number;
  remaining: number;
  pct: number;
  due: 'overdue' | 'soon' | 'ok';
}
