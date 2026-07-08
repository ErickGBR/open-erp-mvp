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
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
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
            <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 w-full animate-pulse rounded bg-gray-200" />
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

        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Sale not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The sale you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/sales"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
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

        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchSale}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
            <h1 className="text-2xl font-bold text-gray-900">
              {sale.invoiceNumber}
            </h1>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
            >
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {formatDateTime(sale.createdAt)}
          </p>
          {sale.paidAt && (
            <p className="text-sm text-gray-500">
              Paid on {formatDateTime(sale.paidAt)}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/sales"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to sales
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Customer Info ─────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Customer
        </h2>
        {sale.customer ? (
          <div className="text-sm text-gray-900">
            <p className="font-medium">{sale.customer.name}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Walk-in customer</p>
        )}
      </div>

      {/* ── Items ─────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Items
        </h2>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Qty
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">
                    {item.productName}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-right">
          <div className="flex justify-end gap-8 text-sm text-gray-600">
            <span>Subtotal:</span>
            <span className="w-24 text-right font-medium text-gray-900">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-sm text-gray-600">
            <span>Tax:</span>
            <span className="w-24 text-right font-medium text-gray-900">
              {formatCurrency(sale.tax)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-base font-semibold text-gray-900">
            <span>Total:</span>
            <span className="w-24 text-right">
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {sale.notes && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
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
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Mark as Paid'}
            </button>
            <button
              type="button"
              onClick={handleMarkAsCancelled}
              disabled={updating}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Cancel Sale'}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
              Delete Sale
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete invoice{' '}
              <span className="font-medium text-gray-700">
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
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
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
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        &larr; Back to sales
      </Link>
    </div>
  );
}
