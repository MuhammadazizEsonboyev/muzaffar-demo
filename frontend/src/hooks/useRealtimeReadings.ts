import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SensorReading } from '../types';

/**
 * Subscribes to Supabase Realtime inserts on sensor_readings.
 * Optionally filtered by pump_id. Keeps a rolling buffer.
 */
export function useRealtimeReadings(pumpId?: string, buffer = 60) {
  const [readings, setReadings] = useState<SensorReading[]>([]);

  const seed = useCallback((data: SensorReading[]) => setReadings(data), []);

  useEffect(() => {
    const channel = supabase
      .channel(`readings-${pumpId ?? 'all'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings',
          ...(pumpId ? { filter: `pump_id=eq.${pumpId}` } : {}) },
        (payload) => {
          const r = payload.new as SensorReading;
          setReadings(prev => [r, ...prev].slice(0, buffer));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pumpId, buffer]);

  return { readings, seed };
}
