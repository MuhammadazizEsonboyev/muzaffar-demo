import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { SensorReading } from '../../types';
import { fmtClock } from '../../utils/format';

interface Props { data: SensorReading[]; }

const axis = { stroke: '#64748b', fontSize: 11 };
const grid = '#1f2937';

function tooltipStyle() {
  return {
    contentStyle: { background: '#151b26', border: '1px solid #1f2937', borderRadius: 8, color: '#e2e8f0' },
    labelStyle: { color: '#64748b' },
  };
}

function prep(data: SensorReading[]) {
  return [...data].reverse().map(d => ({ ...d, t: fmtClock(d.recorded_at) }));
}

export function TempTrend({ data }: Props) {
  const d = prep(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={d}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle()} />
        <Line type="monotone" dataKey="bearing_temp" name="Podshipnik °C" stroke="#ef4444" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="seal_temp" name="Salnik °C" stroke="#f59e0b" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VibrationTrend({ data }: Props) {
  const d = prep(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={d}>
        <defs>
          <linearGradient id="vib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle()} />
        <Area type="monotone" dataKey="vibration" name="Vibratsiya mm/s" stroke="#2dd4bf" fill="url(#vib)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PressureTrend({ data }: Props) {
  const d = prep(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={d}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle()} />
        <Line type="monotone" dataKey="inlet_pressure" name="Kirish bar" stroke="#3b82f6" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="outlet_pressure" name="Chiqish bar" stroke="#8b5cf6" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FlowTrend({ data }: Props) {
  const d = prep(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={d}>
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle()} />
        <Area type="monotone" dataKey="flow_rate" name="Sarf m³/h" stroke="#22c55e" fill="url(#flow)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
