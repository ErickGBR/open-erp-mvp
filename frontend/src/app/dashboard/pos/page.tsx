'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, Check, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  category: string | null;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
}

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ invoiceNumber: string; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);

  useEffect(() => {
    api.get<{ data: Product[]; total: number }>('/products?limit=50')
      .then(r => setProducts(r.data))
      .catch(() => {});
    api.get<Customer[]>('/customers')
      .then(setCustomers)
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
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
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item; // will be filtered below
      if (newQty > item.stock) return item;
      return { ...item, quantity: newQty };
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // flat 0% tax for MVP

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const sale = await api.post<{ invoiceNumber: string; total: number }>('/sales', {
        customerId: selectedCustomerId || undefined,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      setResult(sale);
      setCart([]);
      setSelectedCustomerId(null);
      // Refresh products to update stock
      const updated = await api.get<{ data: Product[]; total: number }>('/products?limit=50');
      setProducts(updated.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetSale = () => {
    setResult(null);
    setCart([]);
    setSelectedCustomerId(null);
    setError(null);
  };

  // Success screen
  if (result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card rounded-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sale Completed!</h2>
          <p className="text-slate-400 mb-1">Invoice: <span className="text-cyan-400 font-mono">{result.invoiceNumber}</span></p>
          <p className="text-2xl font-bold text-white mb-6">${Number(result.total).toFixed(2)}</p>
          <button onClick={resetSale} className="btn-cyan w-full">
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Products panel */}
      <div className="flex-1 flex flex-col">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            autoFocus
          />
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`glass-card rounded-xl p-3 text-left transition-all hover:border-cyan-500/30 text-left ${
                product.stock <= 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <p className="text-sm font-medium text-white truncate">{product.name}</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">${Number(product.price).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Stock: {product.stock} {product.sku && `| ${product.sku}`}
              </p>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-8">No products found</p>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-80 flex flex-col glass-card rounded-xl">
        <div className="p-4 border-b border-cyan-500/10">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            Cart ({cart.length})
          </div>
        </div>

        {/* Customer select */}
        <div className="px-4 py-2 border-b border-cyan-500/5">
          <button
            onClick={() => setShowCustomerSelect(!showCustomerSelect)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {selectedCustomerId
              ? `Customer: ${customers.find(c => c.id === selectedCustomerId)?.name || 'Selected'}`
              : '+ Add Customer (optional)'}
          </button>
          {showCustomerSelect && (
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
              <button
                onClick={() => { setSelectedCustomerId(null); setShowCustomerSelect(false); }}
                className="block w-full text-left text-xs text-slate-500 hover:text-white py-1"
              >
                — Walk-in Customer —
              </button>
              {customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomerId(c.id); setShowCustomerSelect(false); }}
                  className={`block w-full text-left text-xs py-1 ${
                    selectedCustomerId === c.id ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">Click products to add them to the cart</p>
          )}
          {cart.map(item => (
            <div key={item.productId} className="bg-white/5 rounded-lg p-2.5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-white font-medium truncate flex-1">{item.productName}</p>
                <button onClick={() => removeFromCart(item.productId)} className="text-slate-500 hover:text-red-400 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)}
                    className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm text-white font-mono w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)}
                    className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm text-cyan-400 font-mono">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 border-t border-cyan-500/10 space-y-3">
          {error && (
            <div className="text-xs text-red-300 bg-red-900/30 rounded p-2">{error}</div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-white">Total</span>
            <span className="text-cyan-400">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className="btn-cyan w-full"
          >
            {submitting ? 'Processing…' : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
