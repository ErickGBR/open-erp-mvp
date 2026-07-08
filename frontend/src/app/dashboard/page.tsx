'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Dashboard home page — welcome message and placeholder stat cards.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Products', value: '—', color: 'bg-blue-500' },
    { label: 'Total Customers', value: '—', color: 'bg-emerald-500' },
    { label: 'Total Sales', value: '—', color: 'bg-amber-500' },
    { label: 'Revenue', value: '—', color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Welcome{user ? `, ${user.name}` : ''}!
      </h1>
      <p className="mb-8 text-gray-500">Here&apos;s what&apos;s happening with your business today.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className={`h-1.5 ${stat.color}`} />
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
        <p className="mt-2 text-sm text-gray-500">
          This is your ERP dashboard. Use the sidebar to navigate between
          Products, Customers, and Sales sections. Data will appear here once
          you start adding records to the system.
        </p>
      </div>
    </div>
  );
}
