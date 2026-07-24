'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';

/**
 * Dark-mode badge classes for stock levels and active/inactive status.
 * Replaces the legacy bg-emerald-100/text-emerald-700 pattern.
 */

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
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UNITS: Record<string, string> = {
  unit: 'Unit', dozen: 'Dozen', kg: 'Kg', lb: 'Lb', ft: 'Foot',
  inch: 'Inch', m: 'Meter', cm: 'Cm', l: 'Liter', ml: 'Ml', box: 'Box', pack: 'Pack',
};

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Products list page — searchable, paginated table with edit/delete actions.
 * Handles loading, empty, error, and edge-case states.
 */
export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /** Debounced search — resets to page 1 when the user types. */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = await confirmDelete(product.name);
    if (!confirmed) return;

    setDeletingId(product.id);
    try {
      await api.delete(`/products/${product.id}`);
      // If the deleted item was the last one on the current page, go back a page
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      setDeletingId(null);
    }
  };

  /** Format currency without toLocaleString to avoid hydration mismatch. */
  const formatCurrency = (value: number) =>
    `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div>
        <HeaderBar onNew={() => router.push('/dashboard/products/new')} />

        <div className="rounded-xl border border-border bg-surface-card  shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-white/[0.02] text-xs uppercase text-text-secondary">
                <tr>
                  <Th></Th>
                  <Th>Name</Th>
                  <Th>SKU</Th>
                  <Th>Barcode</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Unit</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error && products.length === 0) {
    return (
      <div>
        <HeaderBar onNew={() => router.push('/dashboard/products/new')} />

        <div className="rounded-xl border border-danger/20 bg-danger-light p-8 text-center">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm "
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderBar onNew={() => router.push('/dashboard/products/new')} />

      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products by name…"
          aria-label="Search products"
          className="block w-full max-w-sm rounded-lg border border-border px-3 py-2 text-sm shadow-sm placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Error alert (non-blocking, shown above the table) */}
      {error && (
        <div
          className="mb-4 rounded-lg bg-danger-light p-3 text-sm text-danger"
          role="alert"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface-card  shadow-sm">
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-secondary">
              {search ? 'No products match your search.' : 'No products found.'}
            </p>
            {!search && (
              <Link
                href="/dashboard/products/new"
                className="mt-3 inline-block rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg "
              >
                Add your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-white/[0.02] text-xs uppercase text-text-secondary">
                <tr>
                  <Th></Th>
                  <Th>Name</Th>
                  <Th>SKU</Th>
                  <Th>Barcode</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Unit</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-2 py-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-surface-hover" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      <Link href={`/dashboard/products/${product.id}`} className="hover:text-primary">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                      {product.sku || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {product.barcode ? (
                        <span className="font-mono text-xs text-primary">{product.barcode}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {UNITS[product.unitOfMeasure] || product.unitOfMeasure}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={product.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="text-sm font-medium text-primary hover:text-primary-dark"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="text-sm font-medium text-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === product.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

/**
 * Header with title and "New Product" button.
 */
function HeaderBar({ onNew }: { onNew: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
      <button
        onClick={onNew}
        className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-2"
      >
        + New Product
      </button>
    </div>
  );
}

/** Table header cell with consistent padding and text styling. */
function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-medium">{children}</th>
  );
}

/**
 * Colored badge for stock level.
 */
function StockBadge({ stock }: { stock: number }) {
  let colorClass: string;
  if (stock <= 0) {
    colorClass = 'bg-danger-light text-danger';
  } else if (stock < 10) {
    colorClass = 'bg-amber-900/20 text-warning';
  } else {
    colorClass = 'bg-emerald-900/20 text-success';
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {stock}
    </span>
  );
}

/**
 * Active / Inactive status badge.
 */
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-emerald-900/20 text-success'
          : 'bg-slate-500/20 text-text-secondary'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

/**
 * Pagination bar with Previous / Next buttons and a page counter.
 */
function PaginationBar({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
      <p>
        Showing page {page} of {totalPages} ({total} total products)
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm hover:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm hover:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
