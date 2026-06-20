import { ReactNode } from 'react';
import { LucideIcon, Loader2, Inbox, AlertTriangle } from 'lucide-react';
import { healthColor } from '../../utils/format';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, accent = 'text-brand', sub }:
  { icon: LucideIcon; label: string; value: ReactNode; accent?: string; sub?: string }) {
  return (
    <div className="card p-5 flex items-start justify-between hover:bg-bg-hover transition-colors">
      <div>
        <p className="text-muted text-sm">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
        {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-lg bg-bg-soft ${accent}`}><Icon size={22} /></div>
    </div>
  );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function Spinner({ label = 'Yuklanmoqda...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
      <Loader2 className="animate-spin text-brand" size={28} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ message = 'Ma\'lumot yo\'q' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted gap-3">
      <Inbox size={32} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-crit gap-3">
      <AlertTriangle size={32} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function HealthRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className={`absolute text-sm font-bold ${healthColor(score)}`}>{score}</span>
    </div>
  );
}
