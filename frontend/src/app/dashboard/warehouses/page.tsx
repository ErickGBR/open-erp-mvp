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

  const load = async () => {
    try {
      const data = await api.get<WarehouseType[]>('/warehouses');
      setWarehouses(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    await api.delete(`/warehouses/${id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Almacenes</h1>
        <Link href="/dashboard/warehouses/new" className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo Almacén
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Cargando…</div>
      ) : warehouses.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-slate-500">
          <Warehouse className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p>No hay almacenes configurados</p>
          <Link href="/dashboard/warehouses/new" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
            Crear primer almacén
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouses.map(wh => (
            <div key={wh.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">{wh.name}</h2>
                  </div>
                  {(wh.country || wh.city) && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {[wh.locality, wh.city, wh.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {wh.address && <p className="text-xs text-slate-500 mt-1">{wh.address}</p>}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/warehouses/${wh.id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Editar
                  </Link>
                  <button onClick={() => handleDelete(wh.id, wh.name)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
              {wh.locations && wh.locations.length > 0 && (
                <div className="mt-3 border-t border-cyan-500/10 pt-3">
                  <p className="text-xs text-slate-500 mb-1">Ubicaciones ({wh.locations.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {wh.locations.map(loc => (
                      <span key={loc.id} className="text-xs bg-white/5 rounded px-2 py-1 text-slate-300">
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
