'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { CalendarCheck, Plus, X, Check, Ban } from 'lucide-react';
import { LEAVE_STATUS, LEAVE_TYPE, formatDate, unwrapList } from '@/lib/rh-utils';

/**
 * Leave record from the API.
 */
interface LeaveRecord {
  id: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string; code: string } | null;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string | null;
}

/**
 * Employee option.
 */
interface EmployeeOption {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
}

interface LeaveForm {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const LEAVE_TYPES = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'paternity', label: 'Paternity' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM: LeaveForm = {
  employeeId: '',
  type: 'vacation',
  startDate: '',
  endDate: '',
  reason: '',
};

/**
 * Leave requests page.
 */
export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LeaveForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const result = await api.get<LeaveRecord[] | { data: LeaveRecord[] }>(`/rh/leaves?${params.toString()}`);
      setLeaves(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading leaves');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  useEffect(() => {
    api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active')
      .then((result) => setEmployees(unwrapList(result)))
      .catch(() => {});
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/rh/leaves/${id}/status`, { status });
      await fetchLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const openNew = () => {
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await api.post('/rh/leaves', {
        employeeId: Number(form.employeeId),
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim() || undefined,
      });
      setShowModal(false);
      await fetchLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating leave');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Leave</h1>
        <button onClick={openNew} className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
      ) : leaves.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No leave requests found</p>
          <button onClick={openNew} className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">
            Create request
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Start</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">End</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Reason</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">
                    {leave.employee
                      ? `${leave.employee.firstName} ${leave.employee.lastName}`
                      : `ID: ${leave.employeeId}`}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{LEAVE_TYPE[leave.type] || leave.type}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(leave.startDate)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(leave.endDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${LEAVE_STATUS[leave.status]?.badge || 'badge-inactive'}`}>
                      {LEAVE_STATUS[leave.status]?.label || leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{leave.reason || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStatusChange(leave.id, 'approved')}
                          className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                          title="Approve"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(leave.id, 'rejected')}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 ml-2"
                          title="Reject"
                        >
                          <Ban className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Leave Request</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Employee *</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputClass}
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
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

              <div>
                <label className="block text-sm font-medium text-slate-300">Reason</label>
                <textarea
                  rows={3} value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className={inputClass}
                  placeholder="Reason for leave…" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={saving || !form.employeeId || !form.startDate || !form.endDate}
                className="btn-cyan flex-1 text-sm"
              >
                {saving ? 'Saving…' : 'Create Request'}
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
