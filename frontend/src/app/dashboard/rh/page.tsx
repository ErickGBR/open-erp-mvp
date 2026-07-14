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
          setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
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
      label: 'Empleados',
      href: '/dashboard/rh/employees',
      icon: <Users className="h-5 w-5" />,
      description: 'Gestionar empleados activos e inactivos',
    },
    {
      label: 'Departamentos',
      href: '/dashboard/rh/departments',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Administrar departamentos',
    },
    {
      label: 'Asistencia',
      href: '/dashboard/rh/attendance',
      icon: <Clock className="h-5 w-5" />,
      description: 'Registro de asistencia diaria',
    },
    {
      label: 'Permisos',
      href: '/dashboard/rh/leaves',
      icon: <CalendarCheck className="h-5 w-5" />,
      description: 'Solicitudes de permisos y vacaciones',
    },
    {
      label: 'Bonos',
      href: '/dashboard/rh/bonuses',
      icon: <Gift className="h-5 w-5" />,
      description: 'Bonificaciones y compensaciones',
    },
    {
      label: 'Préstamos',
      href: '/dashboard/rh/loans',
      icon: <Banknote className="h-5 w-5" />,
      description: 'Préstamos y adelantos de sueldo',
    },
    {
      label: 'Planilla',
      href: '/dashboard/rh/payroll',
      icon: <ClipboardList className="h-5 w-5" />,
      description: 'Períodos de planilla y pagos',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Recursos Humanos</h1>
        <p className="mt-1 text-slate-400">Panel de gestión de personal y planilla</p>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <div className="h-1.5 animate-pulse bg-gradient-to-r from-cyan-500/30 to-blue-500/30" />
              <div className="p-5">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-cyan-500/10" />
                <div className="h-8 w-16 animate-pulse rounded bg-cyan-500/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Empleados Activos"
            value={stats ? String(stats.activeEmployees) : '—'}
            sub={stats ? `${stats.totalEmployees} total` : undefined}
            icon={<Users className="h-5 w-5" />}
            gradient="from-cyan-400 to-blue-500"
          />
          <StatCard
            label="Permisos Pendientes"
            value={stats ? String(stats.pendingLeaves) : '—'}
            icon={<CalendarCheck className="h-5 w-5" />}
            gradient="from-amber-400 to-orange-500"
          />
          <StatCard
            label="Planillas Pendientes"
            value={stats ? String(stats.pendingPayroll) : '—'}
            icon={<ClipboardList className="h-5 w-5" />}
            gradient="from-blue-400 to-purple-500"
          />
          <StatCard
            label="Departamentos"
            value="—"
            icon={<Building2 className="h-5 w-5" />}
            gradient="from-cyan-400 to-teal-500"
          />
        </div>
      )}

      {/* Quick links */}
      <h2 className="mb-4 mt-10 text-lg font-semibold text-[#e2e8f0]">Módulos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="glass-card-hover rounded-xl p-5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400">{link.icon}</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-[#e2e8f0] group-hover:text-cyan-300 transition-colors">
              {link.label}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{link.description}</p>
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
    <div className="glass-card rounded-xl overflow-hidden transition-all hover:glow-cyan-sm">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <span className="text-cyan-400">{icon}</span>
        </div>
        <p className="mt-1 text-3xl font-bold text-[#e2e8f0]">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}
