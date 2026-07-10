'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

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
  pending: 'bg-amber-900/20 text-amber-400',
  paid: 'bg-emerald-900/20 text-emerald-400',
  cancelled: 'bg-red-100 text-red-300',
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      const updated = await api.patch<Sale>(`/sales/${sale.id}`, {
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
      const updated = await api.patch<Sale>(`/sales/${sale.id}`, {
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
    setDeleting(true);
    try {
      await api.delete(`/sales/${sale.id}`);
      router.push('/dashboard/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale');
      setDeleting(false);
      setShowDeleteDialog(false);
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
            <div className="mb-2 h-8 w-64 animate-pulse rounded bg-cyan-500/10" />
            <div className="h-5 w-40 animate-pulse rounded bg-cyan-500/10" />
          </div>

          {/* Card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="mb-6 space-y-4 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm"
            >
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-cyan-500/10" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 w-full animate-pulse rounded bg-cyan-500/10" />
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

        <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#e2e8f0]">Sale not found</h2>
          <p className="mt-1 text-sm text-slate-400">
            The sale you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/sales"
            className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300"
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

        <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchSale}
            className="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2"
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
            <h1 className="text-2xl font-bold text-[#e2e8f0]">
              {sale.invoiceNumber}
            </h1>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
            >
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Created on {formatDateTime(sale.createdAt)}
          </p>
          {sale.paidAt && (
            <p className="text-sm text-slate-400">
              Paid on {formatDateTime(sale.paidAt)}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/sales"
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to sales
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300"
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
      <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Customer
        </h2>
        {sale.customer ? (
          <div className="text-sm text-[#e2e8f0]">
            <p className="font-medium">{sale.customer.name}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Walk-in customer</p>
        )}
      </div>

      {/* ── Items ─────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Items
        </h2>

        <div className="overflow-hidden rounded-lg border border-cyan-500/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Qty
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium text-[#e2e8f0]">
                    {item.productName}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-400">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-400">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-[#e2e8f0]">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1 border-t border-cyan-500/5 pt-4 text-right">
          <div className="flex justify-end gap-8 text-sm text-slate-400">
            <span>Subtotal:</span>
            <span className="w-24 text-right font-medium text-[#e2e8f0]">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-sm text-slate-400">
            <span>Tax:</span>
            <span className="w-24 text-right font-medium text-[#e2e8f0]">
              {formatCurrency(sale.tax)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-base font-semibold text-[#e2e8f0]">
            <span>Total:</span>
            <span className="w-24 text-right">
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {sale.notes && (
        <div className="mb-6 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-300">
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
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Mark as Paid'}
            </button>
            <button
              type="button"
              onClick={handleMarkAsCancelled}
              disabled={updating}
              className="rounded-lg border border-red-500/20 bg-transparent px-4 py-2 text-sm font-semibold text-red-300 shadow-sm transition-colors hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Cancel Sale'}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
        >
          Delete
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-[#12121e] p-6 shadow-xl border border-cyan-500/10">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-[#e2e8f0]">
              Delete Sale
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete invoice{' '}
              <span className="font-medium text-slate-300">
                {sale.invoiceNumber}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setError(null);
                }}
                disabled={deleting}
                className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/[0.02] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
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
        className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
      >
        &larr; Back to sales
      </Link>
    </div>
  );
}
