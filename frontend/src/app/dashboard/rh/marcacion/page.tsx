'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import DemoOverlay from '@/components/DemoOverlay';
import { Clock, ArrowRight, QrCode, Scan, CalendarRange, List } from 'lucide-react';

interface AttendanceSummary {
  id: number;
  employee: { firstName: string; lastName: string; code: string } | null;
  clockIn: string | null;
  clockOut: string | null;
}

export default function MarcacionPage() {
  const { t } = useLanguage();
  const [clockedIn, setClockedIn] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];
        const params = new URLSearchParams({ startDate: today });
        const result = await api.get<AttendanceSummary[] | { data: AttendanceSummary[] }>(`/rh/attendance?${params.toString()}`);
        const list = Array.isArray(result) ? result : (result && typeof result === 'object' && 'data' in result ? (result as { data: AttendanceSummary[] }).data : []);
        if (!cancelled) setClockedIn(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error loading attendance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const quickLinks = [
    { label: t('marcacion.kiosk'), href: '/marcar', icon: <Scan className="w-5 h-5" />, desc: 'Open attendance kiosk for QR scanning' },
    { label: t('sidebar.rh.shifts'), href: '/dashboard/rh/shifts', icon: <CalendarRange className="w-5 h-5" />, desc: 'Manage work shifts and schedules' },
    { label: t('sidebar.rh.assignments'), href: '/dashboard/rh/assignments', icon: <List className="w-5 h-5" />, desc: 'Assign shifts to employees' },
    { label: t('sidebar.rh.attendance'), href: '/dashboard/rh/attendance', icon: <Clock className="w-5 h-5" />, desc: 'View detailed attendance records' },
  ];

  const formatTime = (val: string | null) => {
    if (!val) return '—';
    const m = val.match(/T(\d{2}:\d{2})/);
    return m ? m[1] : '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{t('marcacion.title')}</h1>
          <span className="badge-info text-xs">Demo</span>
        </div>
        <Link
          href="/marcar"
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <Scan className="w-4 h-4" /> {t('marcacion.kiosk')}
        </Link>
      </div>

      {/* Demo overlay */}
      <DemoOverlay
        title={t('marcacion.demoTitle')}
        description="Employee time tracking allows you to record when employees start and end their workday. This module integrates with QR codes and the attendance kiosk for seamless clock-in/out."
        steps={[
          { icon: '🔑', text: 'Each employee has a unique QR code linked to their profile.' },
          { icon: '📱', text: 'Open the Kiosk at /marcar and scan the QR code to identify the employee.' },
          { icon: '⏰', text: 'Select the assigned shift and clock in/out with one tap.' },
          { icon: '📊', text: 'Attendance records are generated automatically and visible in the Attendance module.' },
        ]}
        sectionKey="rh_marcacion"
      />

      {/* Today's summary */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {t('marcacion.summary')}
        </h2>

        {error && (
          <div className="rounded-lg bg-danger-light border border-danger/30 p-3 text-sm text-danger mb-3" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : clockedIn.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-glow mb-3">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-text-secondary text-sm">No employees clocked in today</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-secondary mb-3">
              <span className="font-semibold text-primary">{clockedIn.length}</span> employee{clockedIn.length !== 1 ? 's' : ''} clocked in today
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover">
                    <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Employee</th>
                    <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Check-in</th>
                    <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {clockedIn.map((rec) => (
                    <tr key={rec.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-2.5 text-text-primary">
                        {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : `ID: ${rec.id}`}
                      </td>
                      <td className="px-4 py-2.5 text-primary font-mono">{formatTime(rec.clockIn)}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{rec.clockOut ? formatTime(rec.clockOut) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <h3 className="font-semibold text-text-primary group-hover:text-primary-dark transition-colors text-sm">
              {link.label}
            </h3>
            <p className="mt-1 text-xs text-text-muted">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
