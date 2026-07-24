'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  CalendarCheck,
  ClipboardList,
  Building2,
  UserCheck,
  Gift,
  Banknote,
  Clock,
  ArrowRight,
} from 'lucide-react';

/**
 * Shape returned by GET /api/rh/dashboard/stats.
 */
interface RhDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  pendingPayroll: number;
}

/**
 * Quick-link card definition.
 */
interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * RH Dashboard page — shows summary cards and quick links.
 * Styled with the neon cyan/blue dark theme matching existing dashboard.
 */
export default function RhDashboardPage() {
  const [stats, setStats] = useState<RhDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<RhDashboardStats>('/rh/dashboard/stats');
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error loading stats');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const quickLinks: QuickLink[] = [
    {
      label: 'Employees',
      href: '/dashboard/rh/employees',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage active and inactive employees',
    },
    {
      label: 'Departments',
      href: '/dashboard/rh/departments',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Manage departments',
    },
    {
      label: 'Attendance',
      href: '/dashboard/rh/attendance',
      icon: <Clock className="h-5 w-5" />,
      description: 'Daily attendance records',
    },
    {
      label: 'Leave',
      href: '/dashboard/rh/leaves',
      icon: <CalendarCheck className="h-5 w-5" />,
      description: 'Leave and vacation requests',
    },
    {
      label: 'Bonuses',
      href: '/dashboard/rh/bonuses',
      icon: <Gift className="h-5 w-5" />,
      description: 'Bonuses and compensation',
    },
    {
      label: 'Loans',
      href: '/dashboard/rh/loans',
      icon: <Banknote className="h-5 w-5" />,
      description: 'Loans and salary advances',
    },
    {
      label: 'Payroll',
      href: '/dashboard/rh/payroll',
      icon: <ClipboardList className="h-5 w-5" />,
      description: 'Payroll periods and payments',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Human Resources</h1>
        <p className="mt-1 text-text-secondary">Personnel and payroll management panel</p>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-1.5 animate-pulse bg-gradient-to-r from-primary/30 to-primary-dark/30" />
              <div className="p-5">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-hover" />
                <div className="h-8 w-16 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Employees"
            value={stats ? String(stats.activeEmployees) : '—'}
            sub={stats ? `${stats.totalEmployees} total` : undefined}
            icon={<Users className="h-5 w-5" />}
            gradient="from-primary to-primary-dark"
          />
          <StatCard
            label="Pending Leave"
            value={stats ? String(stats.pendingLeaves) : '—'}
            icon={<CalendarCheck className="h-5 w-5" />}
            gradient="from-amber-400 to-orange-500"
          />
          <StatCard
            label="Pending Payroll"
            value={stats ? String(stats.pendingPayroll) : '—'}
            icon={<ClipboardList className="h-5 w-5" />}
            gradient="from-primary-light to-primary"
          />
          <StatCard
            label="Departments"
            value="—"
            icon={<Building2 className="h-5 w-5" />}
            gradient="from-primary to-primary-dark"
          />
        </div>
      )}

      {/* Quick links */}
      <h2 className="mb-4 mt-10 text-lg font-semibold text-text-primary">Modules</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="card-hover p-5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-primary">{link.icon}</span>
              <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-text-primary group-hover:text-primary-dark transition-colors">
              {link.label}
            </h3>
            <p className="mt-1 text-xs text-text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Stat card with icon, label, value and optional sub-text.
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
