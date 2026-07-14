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

  const inputClass = 'mt-1 block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Payroll Periods</h1>
        <button onClick={openNew} className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Period
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : periods.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No payroll periods found</p>
          <button onClick={openNew} className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">
            Create first period
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Period</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Start</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">End</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Employees</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Gross</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Deductions</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Net</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/rh/payroll/${p.id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      {p.periodName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(p.endDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYROLL_STATUS[p.status]?.badge || 'badge-inactive'}`}>
                      {PAYROLL_STATUS[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{p.employeeCount ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-white font-mono">{formatCurrency(p.grossPay)}</td>
                  <td className="px-4 py-3 text-right text-red-400 font-mono">{formatCurrency(p.totalDeductions)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-mono font-semibold">{formatCurrency(p.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Period Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Payroll Period</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Period Name *</label>
                <input
                  type="text" value={form.periodName}
                  onChange={(e) => setForm({ ...form, periodName: e.target.value })}
                  placeholder="E.g.: July 2026 - First Half"
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Start Date *</label>
                  <input
                    type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">End Date *</label>
                  <input
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
                className="btn-cyan flex-1 text-sm"
              >
                {saving ? 'Saving…' : 'Create Period'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white"
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
