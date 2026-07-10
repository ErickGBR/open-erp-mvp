'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, X, QrCode, Package, Barcode } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unitOfMeasure: string;
  category: string | null;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  nit: string | null;
  nrc: string | null;
}

interface Company {
  name: string;
  nit: string | null;
  nrc: string | null;
  npe: string | null;
  commercialName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxRate: number;
  logoUrl: string | null;
}

interface CartItem {
  productId: number;
  productName: string;
  barcode: string | null;
  price: number;
  quantity: number;
  stock: number;
  unitOfMeasure: string;
}

interface SaleResult {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  qrData: string | null;
  generationCode: string | null;
  receiverName: string | null;
  receiverNit: string | null;
  receiverNrc: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    total: number;
    product: { barcode: string | null };
  }>;
  createdAt: string;
}

const UNITS: Record<string, string> = {
  unit: 'Unidad', dozen: 'Docena', kg: 'Kg', lb: 'Lb',
  ft: 'Pie', inch: 'Pulgada', m: 'Metro', cm: 'Cm',
  l: 'Litro', ml: 'Ml', box: 'Caja', pack: 'Paquete',
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [receiverForm, setReceiverForm] = useState({ nit: '', nrc: '', name: '', address: '', phone: '' });
  const [showReceiverForm, setShowReceiverForm] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<{ data: Product[]; total: number }>('/products?limit=200')
      .then(r => setProducts(r.data))
      .catch(() => {});
    api.get<Customer[]>('/customers')
      .then(setCustomers)
      .catch(() => {});
    api.get<Company>('/company')
      .then(setCompany)
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.barcode && p.barcode.includes(search))
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
        unitOfMeasure: product.unitOfMeasure,
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.stock) return item;
      return { ...item, quantity: newQty };
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = company?.taxRate ?? 13;
  const tax = +(subtotal * taxRate / 100).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: any = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      if (selectedCustomerId) {
        body.customerId = selectedCustomerId;
      }
      // Use receiver form data or auto-fill from selected customer
      if (showReceiverForm) {
        body.receiverNit = receiverForm.nit || undefined;
        body.receiverNrc = receiverForm.nrc || undefined;
        body.receiverName = receiverForm.name || undefined;
        body.receiverAddress = receiverForm.address || undefined;
        body.receiverPhone = receiverForm.phone || undefined;
      } else if (selectedCustomer) {
        body.receiverNit = (selectedCustomer as any).nit || undefined;
        body.receiverName = selectedCustomer.name || undefined;
      }

      const sale = await api.post<SaleResult>('/sales', body);
      setResult(sale);
      setCart([]);
      setSelectedCustomerId(null);
      // Refresh products
      const updated = await api.get<{ data: Product[]; total: number }>('/products?limit=200');
      setProducts(updated.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !invoiceRef.current) return;
    
    const content = invoiceRef.current.innerHTML;
    printWindow.document.write(`
      <html><head><title>Factura</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { padding: 4px 2px; text-align: left; border-bottom: 1px dashed #ccc; }
        th { border-bottom: 2px solid #000; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        h2, h3 { margin: 5px 0; }
        .total-row td { border-top: 2px solid #000; font-weight: bold; }
        hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
        .qr { text-align: center; margin: 10px 0; }
        .qr img { width: 100px; height: 100px; }
        .footer { text-align: center; font-size: 10px; margin-top: 10px; }
      </style></head><body>
      ${content}
      <script>window.print();window.close();<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  // Success screen with Invoice
  if (result) {
    const qrUrl = result.qrData
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.qrData)}`
      : null;

    return (
      <div className="flex flex-col items-center min-h-[80vh] py-8">
        {/* Invoice Preview */}
        <div ref={invoiceRef} className="bg-white text-black rounded-xl p-6 max-w-sm w-full mb-4 shadow-lg" style={{ fontFamily: "'Courier New', monospace" }}>
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
            <h2 className="font-bold text-lg">{company?.commercialName || company?.name || 'MI EMPRESA'}</h2>
            <p className="text-xs">{company?.address}</p>
            <p className="text-xs">NIT: {company?.nit || '______'}</p>
            <p className="text-xs">NRC: {company?.nrc || '______'}</p>
            <p className="text-xs">Tel: {company?.phone || ''}</p>
            <hr className="my-2" />
            <h3 className="font-bold text-base">FACTURA</h3>
            <p className="text-xs">No. {result.invoiceNumber}</p>
            <p className="text-xs">Fecha: {new Date(result.createdAt).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs">DOCUMENTO TRIBUTARIO ELECTRÓNICO (DTE)</p>
          </div>

          {/* Customer */}
          <div className="border-b border-dashed border-gray-300 pb-2 mb-2 text-xs">
            <p><span className="font-bold">Cliente:</span> {result.receiverName || 'Consumidor Final'}</p>
            {result.receiverNit && <p><span className="font-bold">NIT:</span> {result.receiverNit}</p>}
            {result.receiverNrc && <p><span className="font-bold">NRC:</span> {result.receiverNrc}</p>}
          </div>

          {/* Items */}
          <table className="mb-2">
            <thead>
              <tr className="text-xs">
                <th>Cant</th>
                <th>Descripción</th>
                <th className="text-right">P.Unit</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item, i) => (
                <tr key={i} className="text-xs">
                  <td className="text-center">{item.quantity}</td>
                  <td>{item.productName}</td>
                  <td className="text-right">${Number(item.price).toFixed(2)}</td>
                  <td className="text-right">${Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <hr className="my-1" />
          <div className="text-xs">
            <div className="flex justify-between"><span>Subtotal:</span><span>${result.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA {taxRate}%:</span><span>${result.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-sm mt-1"><span>TOTAL:</span><span>${result.total.toFixed(2)}</span></div>
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="qr flex justify-center my-3">
              <img src={qrUrl} alt="QR DTE" className="w-24 h-24" />
            </div>
          )}

          {/* Footer */}
          <div className="footer text-center text-xs mt-3 pt-3 border-t border-dashed border-gray-300">
            <p className="font-bold">¡Gracias por su compra!</p>
            <p>Código de Generación: {result.generationCode?.slice(0, 20)}...</p>
            <p>Conserve esta factura para efectos fiscales</p>
            <p className="mt-1">---</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 max-w-sm w-full">
          <button onClick={handlePrint} className="btn-cyan flex-1 flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={() => setResult(null)} className="btn-cyan flex-1">
            Nueva Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Products panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o código de barras…"
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            autoFocus
          />
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`glass-card rounded-xl p-2.5 text-left transition-all ${
                product.stock <= 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-cyan-500/30'
              }`}
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name}
                  className="w-full h-20 object-cover rounded-lg mb-2 bg-white/5" />
              ) : (
                <div className="w-full h-20 rounded-lg mb-2 bg-white/5 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <p className="text-xs font-medium text-white truncate">{product.name}</p>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">${Number(product.price).toFixed(2)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                </span>
                <span className="text-[10px] text-slate-500">{UNITS[product.unitOfMeasure] || product.unitOfMeasure}</span>
              </div>
              {product.barcode && (
                <p className="text-[8px] text-slate-600 mt-0.5 font-mono">Código: {product.barcode}</p>
              )}
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-8">No se encontraron productos</p>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-80 flex flex-col glass-card rounded-xl">
        <div className="p-3 border-b border-cyan-500/10">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            Venta ({cart.length} items)
          </div>
        </div>

        {/* Customer selection */}
        <div className="px-3 py-2 border-b border-cyan-500/5 space-y-1">
          <button
            onClick={() => { setShowCustomerSelect(!showCustomerSelect); setShowReceiverForm(false); }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors w-full text-left"
          >
            {selectedCustomer
              ? `Cliente: ${selectedCustomer.name}`
              : showReceiverForm
                ? 'Datos manuales'
                : '+ Agregar Cliente'}
          </button>

          {showCustomerSelect && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar cliente…"
                className="w-full rounded bg-white/5 border border-cyan-500/10 px-2 py-1 text-xs text-white placeholder:text-slate-500"
              />
              <button
                onClick={() => { setSelectedCustomerId(null); setShowCustomerSelect(false); }}
                className="block w-full text-left text-xs text-slate-500 hover:text-white py-1"
              >
                — Consumidor Final —
              </button>
              <button
                onClick={() => { setShowCustomerSelect(false); setShowReceiverForm(true); }}
                className="block w-full text-left text-xs text-cyan-400 hover:text-cyan-300 py-1"
              >
                + Ingresar datos manualmente
              </button>
              {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                <button key={c.id} onClick={() => { setSelectedCustomerId(c.id); setShowCustomerSelect(false); }}
                  className={`block w-full text-left text-xs py-0.5 ${selectedCustomerId === c.id ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                  {c.name} {c.nit && <span className="text-slate-600">({c.nit})</span>}
                </button>
              ))}
            </div>
          )}

          {showReceiverForm && (
            <div className="space-y-1 text-xs">
              <input placeholder="NIT" value={receiverForm.nit} onChange={e => setReceiverForm(p => ({...p, nit: e.target.value}))}
                className="w-full rounded bg-white/5 border border-cyan-500/10 px-2 py-1 text-white placeholder:text-slate-500" />
              <input placeholder="NRC" value={receiverForm.nrc} onChange={e => setReceiverForm(p => ({...p, nrc: e.target.value}))}
                className="w-full rounded bg-white/5 border border-cyan-500/10 px-2 py-1 text-white placeholder:text-slate-500" />
              <input placeholder="Nombre / Razón Social" value={receiverForm.name} onChange={e => setReceiverForm(p => ({...p, name: e.target.value}))}
                className="w-full rounded bg-white/5 border border-cyan-500/10 px-2 py-1 text-white placeholder:text-slate-500" />
              <input placeholder="Dirección" value={receiverForm.address} onChange={e => setReceiverForm(p => ({...p, address: e.target.value}))}
                className="w-full rounded bg-white/5 border border-cyan-500/10 px-2 py-1 text-white placeholder:text-slate-500" />
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">Seleccione productos</p>
          )}
          {cart.map(item => (
            <div key={item.productId} className="bg-white/5 rounded-lg p-2">
              <div className="flex items-start justify-between">
                <p className="text-xs text-white font-medium truncate flex-1">{item.productName}</p>
                <button onClick={() => removeFromCart(item.productId)} className="text-slate-500 hover:text-red-400 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {item.barcode && <p className="text-[9px] text-slate-600 font-mono">{item.barcode}</p>}
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.productId, -1)}
                    className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20">
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs text-white font-mono w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)}
                    className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cyan-400 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-[9px] text-slate-500">${Number(item.price).toFixed(2)} c/u</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Checkout */}
        <div className="p-3 border-t border-cyan-500/10 space-y-2">
          {error && (
            <div className="text-xs text-red-300 bg-red-900/30 rounded p-2">{error}</div>
          )}
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>IVA ({taxRate}%)</span>
            <span className="text-white font-mono">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-white">TOTAL</span>
            <span className="text-cyan-400">${total.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className="btn-cyan w-full text-sm">
            {submitting ? 'Procesando…' : `Cobrar $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
