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
  unit: 'Unidad', dozen: 'Docena', kg: 'Kg', lb: 'Lb', ft: 'Pie',
  inch: 'Pulgada', m: 'Metro', cm: 'Cm', l: 'Litro', ml: 'Ml', box: 'Caja', pack: 'Paquete',
};
const UNIT_OPTIONS = Object.keys(UNITS);

export default function ProductDetailPage() {
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
  const [avgCost, setAvgCost] = useState<string>('0');

  useEffect(() => {
    if (!productId) return;
    loadProduct();
    loadStock();
    loadKardex();
    api.get<Warehouse[]>('/warehouses').then(setWarehouses).catch(() => {});
  }, [productId]);

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
      cost: Number(form.cost) || undefined,
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/${productId}/image`,
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

  if (!product) return <div className="text-slate-400 p-8">Cargando…</div>;

  const barcodeUrl = product.barcode
    ? `https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=EAN8&translate-esc=true&dpi=96&imagetype=png`
    : null;
  const qrUrl = product.barcode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: product.id, name: product.name, barcode: product.barcode, code: product.sku }))}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-slate-600" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-cyan-500/80 flex items-center justify-center hover:bg-cyan-400 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-white truncate">{product.name}</h1>
              <button onClick={() => setEditMode(!editMode)} className="text-xs text-cyan-400 hover:text-cyan-300 shrink-0 ml-2">
                {editMode ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {/* Barcodes & QR */}
            <div className="flex gap-4 mt-3">
              {barcodeUrl && (
                <div className="text-center">
                  <Barcode className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <img src={barcodeUrl} alt={product.barcode!} className="h-10" />
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{product.barcode}</p>
                </div>
              )}
              {qrUrl && (
                <div className="text-center">
                  <QrCode className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <img src={qrUrl} alt="QR" className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">Precio</p>
                <p className="text-lg font-bold text-cyan-400">${Number(product.price).toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">Costo</p>
                <p className="text-lg font-bold text-emerald-400">${Number(product.cost).toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">Stock Total</p>
                <p className={`text-lg font-bold ${product.stock > 0 ? 'text-white' : 'text-red-400'}`}>{product.stock}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">Unidad</p>
                <p className="text-sm font-bold text-white">{UNITS[product.unitOfMeasure] || product.unitOfMeasure}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">SKU</p>
                <p className="text-sm font-mono text-white truncate">{product.sku || '—'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400">Costo Prom.</p>
                <p className="text-sm font-bold text-emerald-400">${Number(avgCost).toFixed(2)}</p>
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
              activeTab === tab ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}>
            {tab === 'info' ? 'Info / Editar' : tab === 'stock' ? 'Ubicación en Almacén' : 'Kardex'}
          </button>
        ))}
      </div>

      {/* Tab: Info / Edit */}
      {activeTab === 'info' && (
        <div className="glass-card rounded-xl p-6">
          {editMode ? (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Precio</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value) || 0})}
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Costo</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value) || 0})}
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Código de Barras (EAN-8)</label>
                  <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                    placeholder="Ej: 12345670"
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Unidad de Medida</label>
                  <select value={form.unitOfMeasure} onChange={e => setForm({...form, unitOfMeasure: e.target.value})}
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white">
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{UNITS[u]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Categoría</label>
                  <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                  className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white" />
              </div>
              <button onClick={handleSave} className="btn-cyan">Guardar Cambios</button>
            </div>
          ) : (
            <div className="text-sm text-slate-300 space-y-2">
              <p><span className="text-slate-500">Descripción:</span> {product.description || 'Sin descripción'}</p>
              <p><span className="text-slate-500">Categoría:</span> {product.category || 'Sin categoría'}</p>
              <p><span className="text-slate-500">Código de Barras:</span> <span className="font-mono text-cyan-400">{product.barcode || '—'}</span></p>
              <p><span className="text-slate-500">Unidad de Medida:</span> {UNITS[product.unitOfMeasure] || product.unitOfMeasure}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Stock / Warehouse */}
      {activeTab === 'stock' && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Ubicación en Almacén</h2>
          </div>

          {warehouses.length === 0 && (
            <p className="text-slate-500 text-sm">No hay almacenes configurados.</p>
          )}

          {warehouses.map(wh => (
            <div key={wh.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-white font-semibold">{wh.name}</h3>
                {wh.country && <span className="text-xs text-slate-500">| {wh.city}, {wh.country}</span>}
              </div>
              <div className="space-y-2">
                {wh.locations?.map(loc => {
                  const stockHere = stockLocations.find(s => s.location.id === loc.id);
                  return (
                    <div key={loc.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{loc.name}</p>
                        {loc.section && <p className="text-xs text-slate-500">Sección: {loc.section}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono ${(stockHere?.quantity || 0) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {stockHere?.quantity || 0} {UNITS[product.unitOfMeasure] || ''}
                        </span>
                        <button onClick={() => {
                          const q = prompt('Cantidad:', String(stockHere?.quantity || 0));
                          if (q !== null) handleSetStock(loc.id, parseInt(q) || 0);
                        }} className="text-xs text-cyan-400 hover:text-cyan-300">Cambiar</button>
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
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Kardex / Movimientos</h2>
          {kardex.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin movimientos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-cyan-500/10">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-right py-2">Cant.</th>
                    <th className="text-right py-2">Costo Unit.</th>
                    <th className="text-right py-2">Costo Total</th>
                    <th className="text-right py-2">Stock Anterior</th>
                    <th className="text-right py-2">Stock Nuevo</th>
                    <th className="text-right py-2">Costo Prom.</th>
                    <th className="text-left py-2">Ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {kardex.map(entry => (
                    <tr key={entry.id} className="border-b border-cyan-500/5">
                      <td className="py-2 text-slate-300">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          entry.type === 'entry' ? 'bg-emerald-500/20 text-emerald-400' :
                          entry.type === 'exit' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {entry.type === 'entry' ? 'Entrada' : entry.type === 'exit' ? 'Salida' : 'Ajuste'}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono">{entry.quantity}</td>
                      <td className="py-2 text-right font-mono">${Number(entry.unitCost).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono">${Number(entry.totalCost).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono">{entry.previousStock}</td>
                      <td className="py-2 text-right font-mono">{entry.newStock}</td>
                      <td className="py-2 text-right font-mono text-cyan-400">${Number(entry.newAvgCost).toFixed(2)}</td>
                      <td className="py-2 text-xs text-slate-500">{entry.referenceType}</td>
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
