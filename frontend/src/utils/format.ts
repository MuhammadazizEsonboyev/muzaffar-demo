import { PumpStatus, Severity } from '../types';

export const statusColor: Record<PumpStatus, string> = {
  running: 'text-ok',
  warning: 'text-warn',
  critical: 'text-crit',
  stopped: 'text-muted',
  maintenance: 'text-info',
};

export const statusDot: Record<PumpStatus, string> = {
  running: 'bg-ok',
  warning: 'bg-warn',
  critical: 'bg-crit',
  stopped: 'bg-muted',
  maintenance: 'bg-info',
};

export const statusBadge: Record<PumpStatus, string> = {
  running: 'bg-ok/10 text-ok',
  warning: 'bg-warn/10 text-warn',
  critical: 'bg-crit/10 text-crit',
  stopped: 'bg-muted/10 text-muted',
  maintenance: 'bg-info/10 text-info',
};

export const statusLabel: Record<PumpStatus, string> = {
  running: 'Ishlayapti',
  warning: 'Ogohlantirish',
  critical: 'Kritik',
  stopped: 'To\'xtagan',
  maintenance: 'Texxizmat',
};

export const severityBadge: Record<Severity, string> = {
  low: 'bg-info/10 text-info',
  medium: 'bg-warn/10 text-warn',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-crit/10 text-crit',
};

export const severityLabel: Record<Severity, string> = {
  low: 'Past', medium: 'O\'rta', high: 'Yuqori', critical: 'Kritik',
};

export function healthColor(score: number): string {
  if (score >= 80) return 'text-ok';
  if (score >= 50) return 'text-warn';
  return 'text-crit';
}

export function healthBar(score: number): string {
  if (score >= 80) return 'bg-ok';
  if (score >= 50) return 'bg-warn';
  return 'bg-crit';
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export function fmtClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
