'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ClipboardList, Plus, X } from 'lucide-react';
import { PAYROLL_STATUS, formatCurrency, formatDate, unwrapList } from '@/lib/rh-utils';

/**
 * Payroll period from the API.
 */
interface PayrollPeriod {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
  grossPay: number | null;
  totalDeductions: number | null;
  netPay: number | null;
  employeeCount: number | null;
}

interface PeriodForm {
  periodName: string;
  startDate: string;
  endDate: string;
}

const INITIAL_FORM: PeriodForm = {
  periodName: '',
  startDate: '',
  endDate: '',
};

/**
 * Payroll periods list page.
 */
export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PeriodForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<PayrollPeriod[] | { data: PayrollPeriod[] }>('/rh/payroll/periods');
      setPeriods(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading periods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  const openNew = () => {
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.periodName || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await api.post('/rh/payroll/periods', {
        periodName: form.periodName.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setShowModal(false);
      await fetchPeriods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating period');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:border-border focus:ring-primary/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Payroll Periods</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Period
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-light border border-danger/30 p-3 text-sm text-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : periods.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">No payroll periods found</p>
          <button onClick={openNew} className="text-primary hover:text-primary-dark text-sm mt-2">
            Create first period
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Period</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Start</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">End</th>
                <th className="px-4 py-3 text-center font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Employees</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Gross</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Deductions</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Net</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/rh/payroll/${p.id}`}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      {p.periodName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.endDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYROLL_STATUS[p.status]?.badge || 'badge-inactive'}`}>
                      {PAYROLL_STATUS[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">{p.employeeCount ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-mono">{formatCurrency(p.grossPay)}</td>
                  <td className="px-4 py-3 text-right text-danger font-mono">{formatCurrency(p.totalDeductions)}</td>
                  <td className="px-4 py-3 text-right text-success font-mono font-semibold">{formatCurrency(p.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Period Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} aria-hidden="true" />
          <div className="relative z-10 card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">New Payroll Period</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="period-name" className="block text-sm font-medium text-text-secondary">Period Name *</label>
                <input
                  id="period-name"
                  type="text" value={form.periodName}
                  onChange={(e) => setForm({ ...form, periodName: e.target.value })}
                  placeholder="E.g.: July 2026 - First Half"
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="period-start-date" className="block text-sm font-medium text-text-secondary">Start Date *</label>
                  <input
                    id="period-start-date"
                    type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label htmlFor="period-end-date" className="block text-sm font-medium text-text-secondary">End Date *</label>
                  <input
                    id="period-end-date"
                    type="date" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={saving || !form.periodName || !form.startDate || !form.endDate}
                className="btn-primary flex-1 text-sm"
              >
                {saving ? 'Saving…' : 'Create Period'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
