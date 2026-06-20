import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { ingestReading } from '../services/ingestion.js';

const ok = (res: Response, data: unknown) => res.json({ success: true, data });
const fail = (res: Response, e: unknown, code = 400) =>
  res.status(code).json({ success: false, error: e instanceof Error ? e.message : String(e) });

// ---------------- PUMPS ----------------
export const listPumps = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('pumps').select('*').order('name');
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

export const getPump = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: pump, error } = await supabaseAdmin.from('pumps').select('*').eq('id', id).single();
    if (error) throw error;

    const [{ data: readings }, { data: alerts }, { data: maintenance }] = await Promise.all([
      supabaseAdmin.from('sensor_readings').select('*').eq('pump_id', id).order('recorded_at', { ascending: false }).limit(100),
      supabaseAdmin.from('alerts').select('*').eq('pump_id', id).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('maintenance').select('*').eq('pump_id', id).order('created_at', { ascending: false }).limit(20),
    ]);
    ok(res, { pump, readings, alerts, maintenance });
  } catch (e) { fail(res, e); }
};

// ---------------- READINGS (ingest) ----------------
export const postReading = async (req: Request, res: Response) => {
  try {
    const result = await ingestReading(req.body);
    ok(res, result);
  } catch (e) { fail(res, e); }
};

export const listReadings = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 200);
    const q = supabaseAdmin.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(limit);
    if (req.query.pump_id) q.eq('pump_id', String(req.query.pump_id));
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

// ---------------- ALERTS ----------------
export const listAlerts = async (req: Request, res: Response) => {
  try {
    let q = supabaseAdmin.from('alerts').select('*, pumps(name, model)').order('created_at', { ascending: false }).limit(500);
    if (req.query.severity) q = q.eq('severity', String(req.query.severity));
    if (req.query.status) q = q.eq('status', String(req.query.status));
    if (req.query.pump_id) q = q.eq('pump_id', String(req.query.pump_id));
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patch: Record<string, unknown> = { status: req.body.status };
    if (req.body.status === 'resolved') patch.resolved_at = new Date().toISOString();
    const { data, error } = await supabaseAdmin.from('alerts').update(patch).eq('id', id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

// ---------------- MAINTENANCE ----------------
export const listMaintenance = async (req: Request, res: Response) => {
  try {
    let q = supabaseAdmin.from('maintenance').select('*, pumps(name)').order('scheduled_at', { ascending: false });
    if (req.query.status) q = q.eq('status', String(req.query.status));
    const { data, error } = await q;
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('maintenance').insert(req.body).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

export const updateMaintenance = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('maintenance').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

// ---------------- INVENTORY ----------------
export const listInventory = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('inventory').select('*').order('part_name');
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('inventory').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    ok(res, data);
  } catch (e) { fail(res, e); }
};

// ---------------- DASHBOARD ----------------
export const dashboard = async (_req: Request, res: Response) => {
  try {
    const { data: pumps } = await supabaseAdmin.from('pumps').select('*');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { count: maintToday } = await supabaseAdmin.from('maintenance')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', today.toISOString());
    const { count: openAlerts } = await supabaseAdmin.from('alerts')
      .select('*', { count: 'exact', head: true }).eq('status', 'open');
    const { count: criticalAlerts } = await supabaseAdmin.from('alerts')
      .select('*', { count: 'exact', head: true }).eq('severity', 'critical').eq('status', 'open');

    const list = pumps ?? [];
    ok(res, {
      total: list.length,
      running: list.filter(p => p.status === 'running').length,
      warnings: openAlerts ?? 0,
      critical: criticalAlerts ?? 0,
      maintenanceToday: maintToday ?? 0,
    });
  } catch (e) { fail(res, e); }
};
