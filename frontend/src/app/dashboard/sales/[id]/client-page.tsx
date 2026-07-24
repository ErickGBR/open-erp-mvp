'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';

/** @interface {@link SaleItem} — individual line item within a sale */
interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

/** @interface {@link Sale} — full sale shape returned by GET /sales/:id */
interface Sale {
  id: number;
  invoiceNumber: string;
  customer: { id: number; name: string } | null;
  customerId: number | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  notes: string | null;
  paidAt: string | null;
  items: SaleItem[];
  createdAt: string;
}

/** Map status to badge colour classes */
const STATUS_STYLES: Record<Sale['status'], string> = {
  pending: 'bg-amber-900/20 text-warning',
  paid: 'bg-emerald-900/20 text-success',
  cancelled: 'bg-red-100 text-danger',
};

/**
 * Sale detail page — shows full information for a single sale.
 * Supports Mark as Paid, Mark as Cancelled, and Delete actions
 * with confirmation modals.
 * Handles loading, not-found, and error states.
 */
export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Action states ────────────────────────────────────────────────
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** Fetch the sale by ID */
  const fetchSale = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Sale>(`/sales/${params.id}`);
      setSale(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load sale');
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  /** Mark sale as paid */
  const handleMarkAsPaid = useCallback(async () => {
    if (!sale) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await api.patch<Sale>(`/sales/${sale.id}/status`, {
        status: 'paid',
      });
      setSale(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
    } finally {
      setUpdating(false);
    }
  }, [sale]);

  /** Mark sale as cancelled */
  const handleMarkAsCancelled = useCallback(async () => {
    if (!sale) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await api.patch<Sale>(`/sales/${sale.id}/status`, {
        status: 'cancelled',
      });
      setSale(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel sale');
    } finally {
      setUpdating(false);
    }
  }, [sale]);

  /** Delete sale */
  const handleDelete = useCallback(async () => {
    if (!sale) return;
    const confirmed = await confirmDelete(`Factura ${sale.invoiceNumber}`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.delete(`/sales/${sale.id}`);
      router.push('/dashboard/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale');
      setDeleting(false);
    }
  }, [sale, router]);

  /** Format currency */
  const formatCurrency = (value: number) =>
    `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  /** Format date nicely */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <BackLink />

        <div className="mx-auto max-w-3xl">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="mb-2 h-8 w-64 animate-pulse rounded bg-surface-hover" />
            <div className="h-5 w-40 animate-pulse rounded bg-surface-hover" />
          </div>

          {/* Card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="mb-6 space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm"
            >
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-surface-hover" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found state ──────────────────────────────────────────────
  if (notFound) {
    return (
      <div>
        <BackLink />

        <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary">Sale not found</h2>
          <p className="mt-1 text-sm text-text-secondary">
            The sale you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/sales"
            className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark"
          >
            &larr; Back to sales
          </Link>
        </div>
      </div>
    );
  }

  // ── Error state (no data loaded) ─────────────────────────────────
  if (!sale && error) {
    return (
      <div>
        <BackLink />

        <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={fetchSale}
            className="mt-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sale) return null;

  // ── Main content ─────────────────────────────────────────────────
  const isPending = sale.status === 'pending';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">
              {sale.invoiceNumber}
            </h1>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
            >
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Created on {formatDateTime(sale.createdAt)}
          </p>
          {sale.paidAt && (
            <p className="text-sm text-text-secondary">
              Paid on {formatDateTime(sale.paidAt)}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/sales"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to sales
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Customer Info ─────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-border bg-surface-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Customer
        </h2>
        {sale.customer ? (
          <div className="text-sm text-text-primary">
            <p className="font-medium">{sale.customer.name}</p>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Walk-in customer</p>
        )}
      </div>

      {/* ── Items ─────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-border bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Items
        </h2>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Product
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Qty
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium text-text-primary">
                    {item.productName}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-secondary">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-secondary">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-text-primary">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-right">
          <div className="flex justify-end gap-8 text-sm text-text-secondary">
            <span>Subtotal:</span>
            <span className="w-24 text-right font-medium text-text-primary">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-sm text-text-secondary">
            <span>Tax:</span>
            <span className="w-24 text-right font-medium text-text-primary">
              {formatCurrency(sale.tax)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-base font-semibold text-text-primary">
            <span>Total:</span>
            <span className="w-24 text-right">
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {sale.notes && (
        <div className="mb-6 rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {sale.notes}
          </p>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {isPending && (
          <>
            <button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={updating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Mark as Paid'}
            </button>
            <button
              type="button"
              onClick={handleMarkAsCancelled}
              disabled={updating}
              className="rounded-lg border border-danger/20 bg-transparent px-4 py-2 text-sm font-semibold text-danger shadow-sm transition-colors hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Cancel Sale'}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-red-500/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {/* Delete is handled via SweetAlert2 in handleDelete() */}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

/**
 * Back link used above the form in all states.
 */
function BackLink() {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard/sales"
        className="text-sm font-medium text-primary hover:text-primary-dark"
      >
        &larr; Back to sales
      </Link>
    </div>
  );
}
