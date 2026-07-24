'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';

/** @interface {@link Customer} — shape returned by the GET /customers endpoint */
interface Customer {
  id: number;
  name: string;
  company: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

/** @interface {@link PaginatedResponse} — paginated list wrapper from the API */
interface PaginatedResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Customers list page with search, pagination, and CRUD actions.
 * Fetches from GET /customers with ?search, ?page, and ?limit params.
 * Handles loading, empty, and error states.
 */
export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Customer being deleted */
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /** Fetch paginated customer list */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await api.get<PaginatedResponse>(`/customers?${params.toString()}`);
      setCustomers(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /** Debounced search: reset to page 1 when search changes */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [],
  );

  /** Confirm and execute deletion */
  const handleDelete = useCallback(async (customer: Customer) => {
    const confirmed = await confirmDelete(customer.name);
    if (!confirmed) return;
    setDeletingId(customer.id);
    try {
      await api.delete(`/customers/${customer.id}`);
      fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  }, [fetchCustomers]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {total > 0 ? `${total} customer${total !== 1 ? 's' : ''} found` : 'Manage your customers'}
          </p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Customer
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name…"
          aria-label="Search customers by name"
          className="w-full rounded-lg border border-border bg-surface-card px-4 py-2 text-sm text-text-primary placeholder-slate-500 shadow-sm transition-colors focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50 sm:w-72"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
          <button
            onClick={fetchCustomers}
            className="ml-2 font-medium underline hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-text-secondary">Loading customers…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && customers.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-text-primary">No customers yet</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {search
              ? 'No customers match your search. Try a different name.'
              : 'Get started by adding your first customer.'}
          </p>
          {!search && (
            <Link
              href="/dashboard/customers/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add your first customer
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && customers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm ">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary sm:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-text-primary">
                      {customer.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
                      {customer.company || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
                      {customer.document || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                          {customer.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-text-secondary sm:table-cell">
                      {customer.phone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customer.isActive
                            ? 'bg-emerald-900/20 text-success'
                            : 'bg-slate-500/20 text-text-secondary'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.02] hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                          aria-label={`Edit ${customer.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer.id}
                          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-red-500/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${customer.name}`}
                        >
                          {deletingId === customer.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-text-secondary">
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
                className="rounded-lg border border-border bg-surface-card px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border bg-surface-card px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete is handled via SweetAlert2 in handleDelete() */}
    </div>
  );
}
