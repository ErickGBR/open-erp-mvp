'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Settings page — displays user profile info and application details.
 * Uses the AuthContext to show the current user's name, email, and role.
 */
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mb-8 text-gray-500">Manage your account and view application information.</p>

      {/* User Profile */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">User Profile</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            <InfoRow label="Name" value={user?.name || '—'} />
            <InfoRow label="Email" value={user?.email || '—'} />
            <InfoRow label="Role" value={user?.role || '—'} />
          </div>
        </div>
      </section>

      {/* Application Info */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Application</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Frontend" value="Next.js 16 + React 19 + Tailwind CSS 4" />
            <InfoRow label="Backend" value="NestJS + TypeORM + PostgreSQL" />
            <InfoRow label="Authentication" value="JWT (JSON Web Tokens)" />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Single row in an info card — label on the left, value on the right.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}
