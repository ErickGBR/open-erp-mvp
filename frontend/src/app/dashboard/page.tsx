'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

/**
 * Shape returned by GET /dashboard/stats.
 */
interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  paidRevenue: number;
  recentSales: Array<{
    id: number;
    invoiceNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Status badge color map for corporate theme.
 */
const STATUS_STYLES: Record<string, string> = {
  pending: 'badge-warning',
  paid: 'badge-success',
  cancelled: 'badge-danger',
};

/**
 * Map status name to a display label.
 */
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

/**
 * Dashboard home page — fetches real stats from the API and displays
 * stat cards, a recent sales table, and handles loading / error / empty states.
 * Styled with the corporate premium theme.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch dashboard stats from the API. */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<DashboardStats>('/dashboard/stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /** Format currency for display. */
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  /** Format a date string for display. */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="mb-1 h-8 w-64 animate-pulse rounded bg-surface-hover" />
          <div className="h-5 w-96 animate-pulse rounded bg-surface-hover" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card overflow-hidden"
            >
              <div className="h-1.5 animate-pulse bg-gradient-to-r from-primary/30 to-primary-dark/30" />
              <div className="p-5">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-hover" />
                <div className="h-8 w-32 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <div className="h-5 w-40 animate-pulse rounded bg-surface-hover" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-hover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          Welcome{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="mb-8 text-text-secondary">
          Here&apos;s what&apos;s happening with your business today.
        </p>

        <div className="card p-8 text-center border-danger/20">
          <svg
            className="mx-auto h-12 w-12 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-danger">{error}</p>
          <button
            onClick={fetchStats}
            className="btn-primary mt-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty welcome state (no data yet) ─────────────────────────────
  const isEmpty = stats && stats.totalProducts === 0 && stats.totalCustomers === 0 && stats.totalSales === 0;

  if (isEmpty) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          Welcome{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="mb-8 text-text-secondary">
          Here&apos;s what&apos;s happening with your business today.
        </p>

        {/* Still show cards even if zero */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Products"
            value="0"
            sub="0 active"
            icon={<ProductIcon />}
            gradient="from-primary to-primary-dark"
          />
          <StatCard
            label="Customers"
            value="0"
            icon={<CustomersIcon />}
            gradient="from-primary-light to-primary"
          />
          <StatCard
            label="Total Revenue"
            value="$0.00"
            icon={<RevenueIcon />}
            gradient="from-primary to-navy"
          />
          <StatCard
            label="Sales"
            value="0"
            icon={<SalesIcon />}
            gradient="from-primary-light to-primary-dark"
          />
        </div>

        <div className="mt-8 card p-12 text-center border-dashed border-border">
          <svg
            className="mx-auto h-16 w-16 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Welcome to Open ERP!</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-text-secondary">
            Your dashboard is ready. Start by adding products, customers, and creating your first sale.
            All your key metrics will appear here in real time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/dashboard/products/new"
              className="btn-primary"
            >
              Add Product
            </a>
            <a
              href="/dashboard/customers/new"
              className="btn-outline px-4 py-2 text-sm"
            >
              Add Customer
            </a>
            <a
              href="/dashboard/sales/new"
              className="btn-outline px-4 py-2 text-sm"
            >
              Create Sale
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Data loaded state ─────────────────────────────────────────────
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-text-primary">
        Welcome{user ? `, ${user.name}` : ''}!
      </h1>
      <p className="mb-8 text-text-secondary">
        Here&apos;s what&apos;s happening with your business today.
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={String(stats!.totalProducts)}
          sub={`${stats!.activeProducts} active`}
          icon={<ProductIcon />}
          gradient="from-primary to-primary-dark"
        />
        <StatCard
          label="Customers"
          value={String(stats!.totalCustomers)}
          icon={<CustomersIcon />}
          gradient="from-primary-light to-primary"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats!.totalRevenue)}
          sub={`${formatCurrency(stats!.paidRevenue)} paid`}
          icon={<RevenueIcon />}
          gradient="from-primary to-navy"
        />
        <StatCard
          label="Sales"
          value={String(stats!.totalSales)}
          icon={<SalesIcon />}
          gradient="from-primary-light to-primary-dark"
        />
      </div>

      {/* Recent Sales table */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Sales</h2>

        {stats!.recentSales.length === 0 ? (
          <div className="card px-6 py-12 text-center border-dashed border-border">
            <svg
              className="mx-auto h-10 w-10 text-text-muted"
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
            <p className="mt-3 text-sm text-text-secondary">
              No sales yet. Create your first sale to see it here.
            </p>
            <a
              href="/dashboard/sales/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create your first sale
            </a>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-hover">
                <tr>
                  <th className="px-6 py-3 font-medium text-text-secondary">Invoice #</th>
                  <th className="px-6 py-3 font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-right font-medium text-text-secondary">Total</th>
                  <th className="px-6 py-3 text-center font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats!.recentSales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{sale.customer}</td>
                    <td className="px-6 py-4 text-right font-medium text-text-primary">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[sale.status] || 'badge-neutral'
                        }`}
                      >
                        {STATUS_LABEL[sale.status] || sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{formatDate(sale.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-6 py-3 text-right">
              <a
                href="/dashboard/sales"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all sales &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

/**
 * Stat card with icon, label, value and optional sub-text.
 * Styled with corporate card and gradient accent.
 */
function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="card overflow-hidden transition-all hover:shadow-md">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <span className="text-primary">{icon}</span>
        </div>
        <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
        {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

/** Products icon (grid) */
function ProductIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

/** Customers icon (people) */
function CustomersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

/** Revenue icon (dollar) */
function RevenueIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** Sales icon (receipt) */
function SalesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}
