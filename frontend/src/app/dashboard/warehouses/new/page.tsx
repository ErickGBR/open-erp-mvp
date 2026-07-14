'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewWarehousePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', description: '', country: 'El Salvador', city: '', locality: '', address: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const wh = await api.post<any>('/warehouses', {
        name: form.name,
        description: form.description || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        locality: form.locality || undefined,
        address: form.address || undefined,
      });
      // Add default location
      await api.post('/warehouse-locations', {
        warehouseId: wh.id,
        name: 'Main',
        section: 'General',
      });
      router.push('/dashboard/warehouses');
    } catch {}
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">New Warehouse</h1>
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Warehouse Name *</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Country</label>
            <input value={form.country} onChange={e => setForm({...form, country: e.target.value})}
              className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">City</label>
            <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
              className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
          </div>
        </div>
        <div>
            <label className="text-xs text-slate-400 mb-1 block">Locality</label>
          <input value={form.locality} onChange={e => setForm({...form, locality: e.target.value})}
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Address</label>
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
        </div>
        <button type="submit" disabled={saving || !form.name} className="btn-cyan w-full">
          {saving ? 'Saving…' : 'Create Warehouse'}
        </button>
      </form>
    </div>
  );
}
