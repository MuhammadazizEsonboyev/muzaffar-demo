import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url ?? '', anonKey ?? '');

const API = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Request failed');
  return json.data as T;
}

export const api = {
  dashboard: () => req<import('../types').DashboardStats>('/dashboard'),
  pumps: () => req<import('../types').Pump[]>('/pumps'),
  pump: (id: string) => req<any>(`/pumps/${id}`),
  readings: (pumpId?: string, limit = 200) =>
    req<import('../types').SensorReading[]>(`/readings?limit=${limit}${pumpId ? `&pump_id=${pumpId}` : ''}`),
  alerts: (params: Record<string, string> = {}) =>
    req<import('../types').Alert[]>(`/alerts?${new URLSearchParams(params)}`),
  updateAlert: (id: string, status: string) =>
    req(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  maintenance: (params: Record<string, string> = {}) =>
    req<import('../types').Maintenance[]>(`/maintenance?${new URLSearchParams(params)}`),
  createMaintenance: (body: any) =>
    req('/maintenance', { method: 'POST', body: JSON.stringify(body) }),
  updateMaintenance: (id: string, body: any) =>
    req(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  inventory: () => req<import('../types').InventoryItem[]>('/inventory'),
  updateInventory: (id: string, body: any) =>
    req(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // ---------------- YANGI MODULLAR ----------------
  mnemoscheme: () => req<{ pumps: import('../types').MnemoPump[]; workshops: import('../types').Workshop[] }>('/mnemoscheme'),

  workOrders: (params: Record<string, string> = {}) =>
    req<import('../types').WorkOrder[]>(`/work-orders?${new URLSearchParams(params)}`),
  workOrder: (id: string) => req<import('../types').WorkOrder>(`/work-orders/${id}`),
  createWorkOrder: (body: any) =>
    req<import('../types').WorkOrder>('/work-orders', { method: 'POST', body: JSON.stringify(body) }),
  updateWorkOrder: (id: string, body: any) =>
    req(`/work-orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  addWorkOrderPart: (id: string, body: any) =>
    req(`/work-orders/${id}/parts`, { method: 'POST', body: JSON.stringify(body) }),

  shiftLogs: () => req<import('../types').ShiftLog[]>('/shift-logs'),
  createShiftLog: (body: any) =>
    req<import('../types').ShiftLog>('/shift-logs', { method: 'POST', body: JSON.stringify(body) }),

  analytics: () => req<import('../types').Analytics>('/analytics'),
  partConsumption: () => req<import('../types').PartConsumption>('/part-consumption'),
  preventiveSchedule: () => req<import('../types').PreventiveItem[]>('/preventive-schedule'),
};
