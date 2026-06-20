import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '../lib/supabase';
import { InventoryItem } from '../types';
import { Spinner, ErrorState, EmptyState, Badge } from '../components/ui';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.inventory().then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="card overflow-hidden">
      {items.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-muted text-xs uppercase">
              <tr>{['Detal nomi', 'Kod', 'Qoldiq', 'Minimal', 'Joylashuv', 'Holati'].map(h =>
                <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map(it => {
                const low = it.quantity < it.min_quantity;
                return (
                  <tr key={it.id} className={`border-t border-line hover:bg-bg-hover ${low ? 'bg-crit/5' : ''}`}>
                    <td className="px-4 py-3 font-medium">{it.part_name}</td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{it.part_code}</td>
                    <td className={`px-4 py-3 font-semibold ${low ? 'text-crit' : 'text-txt'}`}>
                      {it.quantity} {it.unit}
                    </td>
                    <td className="px-4 py-3 text-muted">{it.min_quantity} {it.unit}</td>
                    <td className="px-4 py-3 text-muted">{it.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      {low
                        ? <Badge className="bg-crit/10 text-crit"><AlertTriangle size={12} className="mr-1" /> Kam qoldi</Badge>
                        : <Badge className="bg-ok/10 text-ok">Yetarli</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
