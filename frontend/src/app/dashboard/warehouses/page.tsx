'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Warehouse, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

interface WarehouseType {
  id: number;
  name: string;
  description: string | null;
  country: string | null;
  city: string | null;
  locality: string | null;
  address: string | null;
  locations: Array<{ id: number; name: string; section: string | null }>;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<WarehouseType[]>('/warehouses');
      setWarehouses(data);
    } catch (err) {
      setError('Error loading warehouses');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/warehouses/${id}`);
      await load();
    } catch (err) {
      setError('Error deleting warehouse');
      console.error(err);
    }
    setDeletingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Warehouses</h1>
        <Link href="/dashboard/warehouses/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Warehouse
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-danger/30 rounded-lg text-danger text-sm">{error}</div>
      )}
      {loading ? (
        <div className="text-text-secondary">Loading…</div>
      ) : warehouses.length === 0 ? (
        <div className="card p-8 text-center text-text-muted">
          <Warehouse className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <p>No warehouses configured</p>
          <Link href="/dashboard/warehouses/new" className="text-primary hover:text-primary-dark text-sm mt-2 inline-block">
            Create first warehouse
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouses.map(wh => (
            <div key={wh.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">{wh.name}</h2>
                  </div>
                  {(wh.country || wh.city) && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" />
                      {[wh.locality, wh.city, wh.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {wh.address && <p className="text-xs text-text-muted mt-1">{wh.address}</p>}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/warehouses/${wh.id}`}
                    className="text-xs text-primary hover:text-primary-dark flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(wh.id, wh.name)} disabled={deletingId === wh.id}
                    className="text-xs text-danger hover:text-danger disabled:text-text-muted disabled:cursor-not-allowed flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> {deletingId === wh.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
              {wh.locations && wh.locations.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs text-text-muted mb-1">Locations ({wh.locations.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {wh.locations.map(loc => (
                      <span key={loc.id} className="text-xs bg-surface-hover rounded px-2 py-1 text-text-secondary">
                        {loc.name}{loc.section ? ` (${loc.section})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
