'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Package, Upload, Barcode, QrCode, MapPin, Warehouse, Camera } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unitOfMeasure: string;
  category: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockLocation {
  id: number;
  quantity: number;
  location: {
    id: number;
    name: string;
    section: string | null;
    warehouse: { id: number; name: string; country: string | null; city: string | null; locality: string | null };
  };
}

interface KardexEntry {
  id: number;
  type: string;
  quantity: number;
  unitCost: string;
  totalCost: string;
  referenceType: string;
  previousStock: number;
  newStock: number;
  previousAvgCost: string;
  newAvgCost: string;
  createdAt: string;
}

interface Warehouse {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  locality: string | null;
  locations: Array<{ id: number; name: string; section: string | null }>;
}

const UNITS: Record<string, string> = {
  unit: 'Unit', dozen: 'Dozen', kg: 'Kg', lb: 'Lb', ft: 'Foot',
  inch: 'Inch', m: 'Meter', cm: 'Cm', l: 'Liter', ml: 'Ml', box: 'Box', pack: 'Pack',
};
const UNIT_OPTIONS = Object.keys(UNITS);

export default function ClientPage() {
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [kardex, setKardex] = useState<KardexEntry[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'kardex' | 'stock'>('info');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: 0, cost: 0, sku: '', barcode: '', unitOfMeasure: 'unit', category: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [avgCost, setAvgCost] = useState<string>('0');

  useEffect(() => {
    if (!productId) return;
    loadProduct();
    loadStock();
    loadKardex();
    api.get<Warehouse[]>('/warehouses').then(setWarehouses).catch(() => {});
  }, [productId]);

  /** Render barcode via jsbarcode when product data is available */
  useEffect(() => {
    if (barcodeRef.current && product?.barcode) {
      import('jsbarcode').then((mod) => {
        // Dynamic import of CJS jsbarcode module — needs unknown assertion
        type JsBarcodeFn = (el: SVGSVGElement | null, text: string, opts?: Record<string, unknown>) => void;
        const JsBarcode = (mod as unknown as { default: JsBarcodeFn }).default ?? (mod as unknown as JsBarcodeFn);
        try {
          JsBarcode(barcodeRef.current, product.barcode!, {
            format: 'CODE128',
            width: 2,
            height: 60,
            displayValue: false,
            background: 'transparent',
            lineColor: '#22d3ee',
          });
        } catch {
          // Swallow rendering errors for invalid barcodes
        }
      });
    }
  }, [product?.barcode]);

  const loadProduct = async () => {
    const p = await api.get<Product>(`/products/${productId}`);
    setProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      cost: p.cost,
      sku: p.sku || '',
      barcode: p.barcode || '',
      unitOfMeasure: p.unitOfMeasure || 'unit',
      category: p.category || '',
    });
  };

  const loadStock = async () => {
    try {
      const data = await api.get<StockLocation[]>(`/products/${productId}/stock-locations`);
      setStockLocations(data);
    } catch { setStockLocations([]); }
  };

  const loadKardex = async () => {
    try {
      const data = await api.get<KardexEntry[]>(`/kardex/product/${productId}`);
      setKardex(data);
      const cost = await api.get<{ avgCost: string }>(`/kardex/product/${productId}/avg-cost`);
      setAvgCost(cost.avgCost);
    } catch { setKardex([]); }
  };

  const handleSave = async () => {
    await api.patch(`/products/${productId}`, {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      cost: form.cost,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      unitOfMeasure: form.unitOfMeasure || undefined,
      category: form.category || undefined,
    });
    await loadProduct();
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/products/${productId}/image`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      if (res.ok) await loadProduct();
    } catch {}
    setUploading(false);
  };

  const handleSetStock = async (locationId: number, quantity: number) => {
    await api.post(`/products/${productId}/stock-locations`, { locationId, quantity });
    await loadStock();
  };

  if (!product) return <div className="text-text-secondary p-8">Loading…</div>;

  const qrUrl = product.barcode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: product.id, name: product.name, barcode: product.barcode, code: product.sku }))}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-surface-hover flex-shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-text-muted" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center hover:bg-primary transition-colors"
            >
              <Camera className="w-4 h-4 text-text-primary" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-text-primary truncate">{product.name}</h1>
              <button onClick={() => setEditMode(!editMode)} className="text-xs text-primary hover:text-primary-dark shrink-0 ml-2">
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Barcodes & QR */}
            <div className="flex gap-4 mt-3">
              {product.barcode && (
                <div className="text-center">
                  <Barcode className="w-4 h-4 text-primary mx-auto mb-1" />
                  <svg ref={barcodeRef} className="h-16 mx-auto"></svg>
                  <p className="text-[9px] text-text-muted font-mono mt-0.5">{product.barcode}</p>
                </div>
              )}
              {qrUrl && (
                <div className="text-center">
                  <QrCode className="w-4 h-4 text-primary mx-auto mb-1" />
                  <img src={qrUrl} alt="QR" className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">Price</p>
                <p className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">Cost</p>
                <p className="text-lg font-bold text-success">${Number(product.cost).toFixed(2)}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">Total Stock</p>
                <p className={`text-lg font-bold ${product.stock > 0 ? 'text-text-primary' : 'text-danger'}`}>{product.stock}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">Unit</p>
                <p className="text-sm font-bold text-text-primary">{UNITS[product.unitOfMeasure] || product.unitOfMeasure}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">SKU</p>
                <p className="text-sm font-mono text-text-primary truncate">{product.sku || '—'}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2.5 text-center">
                <p className="text-xs text-text-secondary">Avg. Cost</p>
                <p className="text-sm font-bold text-success">${Number(avgCost).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 text-sm">
        {(['info', 'stock', 'kardex'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}>
            {tab === 'info' ? 'Info / Edit' : tab === 'stock' ? 'Warehouse Location' : 'Kardex'}
          </button>
        ))}
      </div>

      {/* Tab: Info / Edit */}
      {activeTab === 'info' && (
        <div className="card p-6">
          {editMode ? (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Price</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value) || 0})}
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Cost</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value) || 0})}
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Barcode (EAN-8)</label>
                  <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                    placeholder="E.g.: 12345670"
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Unit of Measure</label>
                  <select value={form.unitOfMeasure} onChange={e => setForm({...form, unitOfMeasure: e.target.value})}
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary">
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{UNITS[u]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Category</label>
                  <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                  className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
              </div>
              <button onClick={handleSave} className="btn-primary">Save Changes</button>
            </div>
          ) : (
            <div className="text-sm text-text-secondary space-y-2">
              <p><span className="text-text-muted">Description:</span> {product.description || 'No description'}</p>
              <p><span className="text-text-muted">Category:</span> {product.category || 'No category'}</p>
              <p><span className="text-text-muted">Barcode:</span> <span className="font-mono text-primary">{product.barcode || '—'}</span></p>
              <p><span className="text-text-muted">Unit of Measure:</span> {UNITS[product.unitOfMeasure] || product.unitOfMeasure}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Stock / Warehouse */}
      {activeTab === 'stock' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Warehouse Location</h2>
          </div>

          {warehouses.length === 0 && (
            <p className="text-text-muted text-sm">No warehouses configured.</p>
          )}

          {warehouses.map(wh => (
            <div key={wh.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-text-primary font-semibold">{wh.name}</h3>
                {wh.country && <span className="text-xs text-text-muted">| {wh.city}, {wh.country}</span>}
              </div>
              <div className="space-y-2">
                {wh.locations?.map(loc => {
                  const stockHere = stockLocations.find(s => s.location.id === loc.id);
                  return (
                    <div key={loc.id} className="flex items-center justify-between bg-surface-hover rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-text-primary">{loc.name}</p>
                        {loc.section && <p className="text-xs text-text-muted">Section: {loc.section}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono ${(stockHere?.quantity || 0) > 0 ? 'text-success' : 'text-text-muted'}`}>
                          {stockHere?.quantity || 0} {UNITS[product.unitOfMeasure] || ''}
                        </span>
                        <button onClick={() => {
                          const q = prompt('Quantity:', String(stockHere?.quantity || 0));
                          if (q !== null) handleSetStock(loc.id, parseInt(q) || 0);
                        }} className="text-xs text-primary hover:text-primary-dark">Change</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Kardex */}
      {activeTab === 'kardex' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Kardex / Movements</h2>
          {kardex.length === 0 ? (
            <p className="text-text-muted text-sm">No movements recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-text-secondary border-b border-border">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Cost</th>
                    <th className="text-right py-2">Total Cost</th>
                    <th className="text-right py-2">Previous Stock</th>
                    <th className="text-right py-2">New Stock</th>
                    <th className="text-right py-2">Avg. Cost</th>
                    <th className="text-left py-2">Ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {kardex.map(entry => (
                    <tr key={entry.id} className="border-b border-border">
                      <td className="py-2 text-text-secondary">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          entry.type === 'entry' ? 'bg-success-light text-success' :
                          entry.type === 'exit' ? 'bg-red-500/20 text-danger' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {entry.type === 'entry' ? 'Entry' : entry.type === 'exit' ? 'Exit' : 'Adjustment'}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono">{entry.quantity}</td>
                      <td className="py-2 text-right font-mono">${Number(entry.unitCost).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono">${Number(entry.totalCost).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono">{entry.previousStock}</td>
                      <td className="py-2 text-right font-mono">{entry.newStock}</td>
                      <td className="py-2 text-right font-mono text-primary">${Number(entry.newAvgCost).toFixed(2)}</td>
                      <td className="py-2 text-xs text-text-muted">{entry.referenceType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
