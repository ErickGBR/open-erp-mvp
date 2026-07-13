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
  pending: 'bg-amber-900/20 text-amber-400',
  paid: 'bg-emerald-900/20 text-emerald-400',
  cancelled: 'bg-red-100 text-red-300',
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
        await api.patch(`/sales/${sale.id}/status`, { status: 'paid' });
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
          <div className="h-9 w-72 animate-pulse rounded-lg bg-cyan-500/10" />
          <div className="h-9 w-40 animate-pulse rounded-lg bg-cyan-500/10" />
        </div>

        <div className="overflow-hidden rounded-xl border border-cyan-500/10 bg-[#12121e] shadow-sm ">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyan-500/10">
              <thead className="bg-white/[0.02]">
                <tr>
                  {['Invoice #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-cyan-500/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-cyan-500/10" />
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
          className="rounded-xl border border-red-500/20 bg-red-900/20 p-8 text-center"
        >
          <p className="text-sm font-medium text-red-400">{error}</p>
          <button
            onClick={fetchSales}
            className="mt-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
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
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Sales</h1>
          <p className="mt-1 text-sm text-slate-400">
            {total > 0 ? `${total} sale${total !== 1 ? 's' : ''} found` : 'Manage your sales'}
          </p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2"
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
          className="block w-full rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm text-[#e2e8f0] placeholder-slate-500 shadow-sm transition-colors focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          aria-label="Filter by status"
          className="block w-full rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm text-[#e2e8f0] shadow-sm transition-colors focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 sm:w-40"
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
          className="mb-4 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300"
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

      {/* Empty state */}
      {!loading && !error && sales.length === 0 && (
        <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-slate-500"
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
          <h3 className="mt-4 text-sm font-semibold text-[#e2e8f0]">No sales found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {search || statusFilter !== 'all'
              ? 'No sales match your filters. Try different search terms.'
              : 'Get started by creating your first sale.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/sales/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300"
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
        <div className="overflow-hidden rounded-xl border border-cyan-500/10 bg-[#12121e] shadow-sm ">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyan-500/10">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5">
                {sales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-[#e2e8f0]">
                      {sale.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                      {sale.customer?.name || 'Walk-in'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-400">
                      {sale.items.length}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-[#e2e8f0]">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
                      >
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-400 sm:table-cell">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/dashboard/sales/${sale.id}`}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          View
                        </Link>
                        {sale.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(sale)}
                            disabled={payingId === sale.id}
                            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                          >
                            {payingId === sale.id ? '…' : 'Paid'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sale)}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
          <div className="flex items-center justify-between border-t border-cyan-500/5 px-4 py-3">
            <p className="text-sm text-slate-400">
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
                className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-3 py-1.5 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-3 py-1.5 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="w-full max-w-sm rounded-xl bg-[#12121e] p-6 shadow-xl border border-cyan-500/10">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-[#e2e8f0]">
              Delete Sale
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete invoice{' '}
              <span className="font-medium text-slate-300">{deleteTarget.invoiceNumber}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
 * Header with title only (the "New Sale" button is in the page itself).
 */
function HeaderBar() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[#e2e8f0]">Sales</h1>
    </div>
  );
}
