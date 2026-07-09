'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

/** @interface {@link Customer} — minimal shape used for customer dropdown */
interface Customer {
  id: number;
  name: string;
  company: string | null;
}

/** @interface {@link Product} — minimal shape used for product search */
interface Product {
  id: number;
  name: string;
  price: number;
  sku: string | null;
}

/** @interface {@link LineItem} — a product row in the invoice being built */
interface LineItem {
  /** Unique client-side key for React rendering */
  key: string;
  product: Product;
  quantity: number;
  price: number;
}

/** @interface {@link ProductsResponse} — paginated products from API */
interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

/** @interface {@link CustomersResponse} — paginated customers from API */
interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

/** Generate a stable unique key for line items */
let itemCounter = 0;
function nextItemKey(): string {
  itemCounter += 1;
  return `item-${itemCounter}`;
}

/**
 * Create Sale page — two-section form:
 *
 * Section 1: Customer selection (searchable dropdown or walk-in)
 * Section 2: Line items with product search, editable price/qty, running totals
 *
 * On success, POSTs to /sales and redirects to the sales list.
 */
export default function NewSalePage() {
  const router = useRouter();

  // ── Customers ────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // ── Products & Line Items ────────────────────────────────────────
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [productSearching, setProductSearching] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const productDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // ── Notes ────────────────────────────────────────────────────────
  const [notes, setNotes] = useState('');

  // ── Submission ───────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Validation ───────────────────────────────────────────────────
  const [lineItemError, setLineItemError] = useState<string | null>(null);

  // ── Fetch customers on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadCustomers() {
      try {
        const res = await api.get<CustomersResponse>(
          `/customers?limit=100&sort=name`,
        );
        if (!cancelled) setCustomers(res.data);
      } catch {
        // Non-blocking — customers are optional
      } finally {
        if (!cancelled) setCustomersLoading(false);
      }
    }
    loadCustomers();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Filtered customer list based on search text ──────────────────
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  // ── Close customer dropdown on outside click ─────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setCustomerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Close product dropdown on outside click ──────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Debounced product search ─────────────────────────────────────
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProductResults([]);
      return;
    }
    setProductSearching(true);
    try {
      const params = new URLSearchParams();
      params.set('search', query.trim());
      params.set('limit', '20');
      const res = await api.get<ProductsResponse>(
        `/products?${params.toString()}`,
      );
      setProductResults(res.data);
    } catch {
      setProductResults([]);
    } finally {
      setProductSearching(false);
    }
  }, []);

  const handleProductSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setProductSearch(value);
      setProductDropdownOpen(true);
      if (productDebounceRef.current) clearTimeout(productDebounceRef.current);
      productDebounceRef.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    },
    [searchProducts],
  );

  // ── Add product to line items ────────────────────────────────────
  const addProduct = useCallback((product: Product) => {
    // Check if product is already added
    setLineItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Increment quantity instead of duplicating
        return prev.map((item) =>
          item.key === existing.key
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          key: nextItemKey(),
          product,
          quantity: 1,
          price: product.price,
        },
      ];
    });
    setProductSearch('');
    setProductResults([]);
    setProductDropdownOpen(false);
    setLineItemError(null);
    // Refocus the product search input
    productSearchRef.current?.focus();
  }, []);

  // ── Update line item quantity ────────────────────────────────────
  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  }, []);

  // ── Update line item price ────────────────────────────────────────
  const updatePrice = useCallback((key: string, price: number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, price: Math.max(0, price) }
          : item,
      ),
    );
  }, []);

  // ── Remove line item ──────────────────────────────────────────────
  const removeItem = useCallback((key: string) => {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // ── Running totals ────────────────────────────────────────────────
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = 0; // 0% for MVP
  const total = subtotal + tax;

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLineItemError(null);
      setSubmitError(null);

      if (lineItems.length === 0) {
        setLineItemError('Add at least one product to the sale.');
        return;
      }

      setSubmitting(true);
      try {
        await api.post('/sales', {
          customerId: selectedCustomer?.id ?? null,
          items: lineItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.price,
          })),
          notes: notes.trim() || null,
        });
        router.push('/dashboard/sales');
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Failed to create sale',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [selectedCustomer, lineItems, notes, router],
  );

  // ── Select customer —──────────────────────────────────────────────
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setCustomerDropdownOpen(false);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerSearch('');
  }, []);

  /** Format currency */
  const formatCurrency = (value: number) =>
    `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">New Sale</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create a new invoice with line items.
          </p>
        </div>
        <Link
          href="/dashboard/sales"
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to sales
        </Link>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300"
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Section 1: Customer Selection ───────────────────────── */}
        <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">
            Customer
          </h2>

          <div className="relative" ref={customerDropdownRef}>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setSelectedCustomer(null);
                setCustomerDropdownOpen(true);
              }}
              onFocus={() => setCustomerDropdownOpen(true)}
              placeholder="Search customer… (leave empty for walk-in)"
              aria-label="Search customer"
              className="block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 sm:w-96"
            />

            {customerDropdownOpen && !selectedCustomer && (
              <div className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-cyan-500/20 bg-[#1a1a2e] shadow-lg sm:w-96">
                {customersLoading ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    Loading customers…
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    {customerSearch
                      ? 'No customers match your search.'
                      : 'No customers found.'}
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-cyan-500/10"
                    >
                      <span className="font-medium">{customer.name}</span>
                      {customer.company && (
                        <span className="text-xs text-slate-500">
                          {customer.company}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Selected:{' '}
                <span className="font-medium text-[#e2e8f0]">
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.company && (
                  <span className="text-slate-500">
                    {' '}— {selectedCustomer.company}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={handleClearCustomer}
                className="text-xs font-medium text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Section 2: Line Items ───────────────────────────────── */}
        <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">
            Items
          </h2>

          {/* Product search */}
          <div className="relative mb-4" ref={productDropdownRef}>
            <input
              ref={productSearchRef}
              type="text"
              value={productSearch}
              onChange={handleProductSearchChange}
              onFocus={() => productSearch.trim() && setProductDropdownOpen(true)}
              placeholder="Search and add products…"
              aria-label="Search products to add"
              className="block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 sm:w-96"
            />

            {productDropdownOpen && productSearch.trim() && (
              <div className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-cyan-500/20 bg-[#1a1a2e] shadow-lg sm:w-96">
                {productSearching ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    Searching…
                  </div>
                ) : productResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    No products found.
                  </div>
                ) : (
                  productResults.map((product) => {
                    const alreadyAdded = lineItems.some(
                      (item) => item.product.id === product.id,
                    );
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-cyan-500/10"
                      >
                        <div>
                          <span className="font-medium">{product.name}</span>
                          {product.sku && (
                            <span className="ml-2 text-xs text-slate-500">
                              ({product.sku})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {formatCurrency(product.price)}
                          </span>
                          {alreadyAdded && (
                            <span className="text-xs text-amber-600">
                              Already added
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Line item error */}
          {lineItemError && (
            <p className="mb-3 text-xs text-red-400" role="alert">
              {lineItemError}
            </p>
          )}

          {/* Items table */}
          {lineItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-cyan-500/15 px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                No items yet. Search and add products above.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-cyan-500/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Product
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Price
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/5">
                  {lineItems.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <tr key={item.key} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-medium text-[#e2e8f0]">
                          {item.product.name}
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(
                                item.key,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            aria-label={`Unit price for ${item.product.name}`}
                            className="w-24 rounded border border-cyan-500/15 px-2 py-1 text-sm text-[#e2e8f0] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.key,
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                            aria-label={`Quantity for ${item.product.name}`}
                            className="w-20 rounded border border-cyan-500/15 px-2 py-1 text-sm text-[#e2e8f0] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#e2e8f0]">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Running totals */}
          {lineItems.length > 0 && (
            <div className="mt-4 space-y-1 border-t border-cyan-500/5 pt-4 text-right">
              <div className="flex justify-end gap-8 text-sm text-slate-400">
                <span>Subtotal:</span>
                <span className="w-24 text-right font-medium text-[#e2e8f0]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-end gap-8 text-sm text-slate-400">
                <span>Tax (0%):</span>
                <span className="w-24 text-right font-medium text-[#e2e8f0]">
                  {formatCurrency(tax)}
                </span>
              </div>
              <div className="flex justify-end gap-8 text-base font-semibold text-[#e2e8f0]">
                <span>Total:</span>
                <span className="w-24 text-right">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3: Notes ────────────────────────────────────── */}
        <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">Notes</h2>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes or comments…"
            className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/sales"
            className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/[0.02]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating…
              </span>
            ) : (
              'Create Sale'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
