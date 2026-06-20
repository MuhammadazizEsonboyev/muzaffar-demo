import { useEffect, useState } from 'react';
import { AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react';
import { api } from '../lib/supabase';
import { InventoryItem, PartConsumption } from '../types';
import { Spinner, ErrorState, EmptyState, Badge, Card } from '../components/ui';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [analysis, setAnalysis] = useState<PartConsumption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.inventory(), api.partConsumption()])
      .then(([inv, a]) => { setItems(inv); setAnalysis(a); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      {/* Avtomatik buyurtma signali */}
      {analysis && analysis.lowStock.length > 0 && (
        <Card className="border-warn/30 bg-warn/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-warn">
            <ShoppingCart size={18} /> Avtomatik buyurtma talab qiladi
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-bg-soft rounded-lg px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{p.part_name}</p>
                  <p className="text-muted text-xs">{p.part_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-crit font-semibold">{p.quantity}/{p.min_quantity}</p>
                  <p className="text-warn text-xs">+{p.shortage} kerak</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Qism iste'moli tahlili */}
      {analysis && analysis.consumption.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-info" /> Eng ko'p ishlatilgan qismlar
          </h3>
          <div className="space-y-2.5">
            {analysis.consumption.slice(0, 6).map((c, i) => {
              const max = analysis.consumption[0].totalQty || 1;
              return (
                <div key={c.part_code} className="flex items-center gap-3 text-sm">
                  <span className="text-muted w-4">{i + 1}</span>
                  <span className="w-40 truncate font-medium">{c.part_name}</span>
                  <div className="flex-1 h-2 rounded-full bg-bg-soft overflow-hidden">
                    <div className="h-full bg-info" style={{ width: `${(c.totalQty / max) * 100}%` }} />
                  </div>
                  <span className="text-muted w-12 text-right">{c.totalQty} dona</span>
                  <span className="text-muted w-28 text-right text-xs">{c.totalCost.toLocaleString()} so'm</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Ombor jadvali */}
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
                  const low = it.quantity <= it.min_quantity;
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
    </div>
  );
}
