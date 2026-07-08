'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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

/** @interface {@link Sale} — shape returned by the GET /sales endpoint */
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

/** @interface {@link PaginatedResponse} — paginated list wrapper from the API */
interface PaginatedResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
}

/** Allowed status filter values */
type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled';

/**
 * Map status to badge colour classes.
 */
const STATUS_STYLES: Record<Sale['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

/**
 * Sales list page with search, status filter, pagination, and row actions.
 * Fetches from GET /sales with ?search, ?status, ?page, and ?limit params.
 * Handles loading, empty, error, and edge-case states.
 */
export default function SalesPage() {
  const router = useRouter();

  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Sale being confirmed for deletion — null means no dialog shown */
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Sale being marked as paid */
  const [payingId, setPayingId] = useState<number | null>(null);

  /** Debounce timer ref for search input */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Fetch paginated, filtered sales list */
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await api.get<PaginatedResponse>(`/sales?${params.toString()}`);
      setSales(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales');
      setSales([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  /** Debounced search: reset to page 1 when search changes */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 300);
    },
    [],
  );

  /** Handle status filter change */
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as StatusFilter);
      setPage(1);
    },
    [],
  );

  /** Mark a sale as paid */
  const handleMarkAsPaid = useCallback(
    async (sale: Sale) => {
      setPayingId(sale.id);
      try {
        await api.patch(`/sales/${sale.id}`, { status: 'paid' });
        await fetchSales();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as paid');
      } finally {
        setPayingId(null);
      }
    },
    [fetchSales],
  );

  /** Confirm and execute deletion */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/sales/${deleteTarget.id}`);
      setDeleteTarget(null);

      // If we deleted the last item on the current page, go back a page
      if (sales.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchSales();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchSales, sales.length, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /** Format currency without toLocaleString to avoid hydration mismatch. */
  const formatCurrency = (value: number) =>
    `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  /** Format date nicely */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading && sales.length === 0) {
    return (
      <div>
        <HeaderBar />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="h-9 w-72 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Invoice #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
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

  // ── Error state (no data loaded) ─────────────────────────────────
  if (error && sales.length === 0) {
    return (
      <div>
        <HeaderBar />

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={fetchSales}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0 ? `${total} sale${total !== 1 ? 's' : ''} found` : 'Manage your sales'}
          </p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Sale
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          onChange={handleSearchChange}
          placeholder="Search by invoice number…"
          aria-label="Search sales by invoice number"
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          aria-label="Filter by status"
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error alert (non-blocking, shown above the table) */}
      {error && sales.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

      {/* Empty state */}
      {!loading && !error && sales.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M3.75 6v6m0 0v3m0-3h.75c.414 0 .75.336.75.75v.75c0 .414-.336.75-.75.75H3.75m0 0h-.75"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No sales found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter !== 'all'
              ? 'No sales match your filters. Try different search terms.'
              : 'Get started by creating your first sale.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/sales/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create your first sale
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {sales.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {sale.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {sale.customer?.name || 'Walk-in'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600">
                      {sale.items.length}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
                      >
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:table-cell">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          View
                        </Link>
                        {sale.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(sale)}
                            disabled={payingId === sale.id}
                            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          >
                            {payingId === sale.id ? '…' : 'Paid'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sale)}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete sale ${sale.invoiceNumber}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium">{total > 0 ? (page - 1) * limit + 1 : 0}</span>
              {' — '}
              <span className="font-medium">{Math.min(page * limit, total)}</span>
              {' of '}
              <span className="font-medium">{total}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
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
              <span className="font-medium text-gray-700">{deleteTarget.invoiceNumber}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
 * Header with title only (the "New Sale" button is in the page itself).
 */
function HeaderBar() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
    </div>
  );
}
