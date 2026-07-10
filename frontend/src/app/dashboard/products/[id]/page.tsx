'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  sku: string | null;
  category: string | null;
  stock: number;
  isActive: boolean;
}

interface KardexEntry {
  id: number;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType: string;
  referenceId: number | null;
  previousStock: number;
  newStock: number;
  previousAvgCost: number;
  newAvgCost: number;
  notes: string | null;
  createdAt: string;
}

type Tab = 'edit' | 'kardex';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [kardex, setKardex] = useState<KardexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('edit');

  useEffect(() => {
    Promise.all([
      api.get<Product>(`/products/${productId}`),
      api.get<KardexEntry[]>(`/kardex/product/${productId}`),
    ]).then(([prod, entries]) => {
      setProduct(prod);
      setKardex(entries);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12 text-slate-400">Product not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <p className="text-sm text-slate-400 mt-1">SKU: {product.sku || '—'} | Category: {product.category || '—'}</p>
        </div>
        <Link href="/dashboard/products" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to Products
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Stock</p>
          <p className={`text-2xl font-bold mt-1 ${product.stock > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {product.stock}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Price</p>
          <p className="text-2xl font-bold text-white mt-1">${Number(product.price).toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Cost</p>
          <p className="text-2xl font-bold text-slate-300 mt-1">${Number(product.cost).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-cyan-500/10">
        <button
          onClick={() => setTab('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'edit' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Edit Product
        </button>
        <button
          onClick={() => setTab('kardex')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'kardex' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Kardex ({kardex.length})
        </button>
      </div>

      {/* Edit Tab */}
      {tab === 'edit' && (
        <EditProductForm product={product} productId={productId} />
      )}

      {/* Kardex Tab */}
      {tab === 'kardex' && (
        <KardexView entries={kardex} />
      )}
    </div>
  );
}

function EditProductForm({ product, productId }: { product: Product; productId: number }) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || '',
    price: String(product.price),
    cost: String(product.cost),
    sku: product.sku || '',
    category: product.category || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(`/products/${productId}`, {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
      });
      setMessage('Product updated successfully');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4 max-w-lg">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${
          message.includes('success') ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
            : 'bg-red-900/30 text-red-300 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300">Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Price</label>
          <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Cost</label>
          <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">SKU</label>
          <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Category</label>
          <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
      </div>
      <button type="submit" disabled={saving}
        className="btn-cyan w-full">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

function KardexView({ entries }: { entries: KardexEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-slate-400">No kardex movements recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyan-500/10 bg-white/5">
            <th className="px-3 py-2 text-left font-medium text-slate-400">Date</th>
            <th className="px-3 py-2 text-left font-medium text-slate-400">Type</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">Qty</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">Unit Cost</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">Total</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">Prev Stock</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">New Stock</th>
            <th className="px-3 py-2 text-right font-medium text-slate-400">Avg Cost</th>
            <th className="px-3 py-2 text-left font-medium text-slate-400">Ref</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 text-slate-400 text-xs">
                {new Date(entry.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  entry.type === 'entry' ? 'bg-emerald-900/30 text-emerald-300' :
                  entry.type === 'exit' ? 'bg-red-900/30 text-red-300' :
                  'bg-amber-900/30 text-amber-300'
                }`}>
                  {entry.type}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-white font-mono">{entry.quantity}</td>
              <td className="px-3 py-2 text-right text-slate-300 font-mono">${Number(entry.unitCost).toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-white font-mono">${Number(entry.totalCost).toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-slate-400 font-mono">{entry.previousStock}</td>
              <td className="px-3 py-2 text-right text-cyan-400 font-mono font-semibold">{entry.newStock}</td>
              <td className="px-3 py-2 text-right text-slate-300 font-mono">${Number(entry.newAvgCost).toFixed(2)}</td>
              <td className="px-3 py-2 text-slate-400 text-xs">{entry.referenceType}{entry.referenceId ? ` #${entry.referenceId}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
