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

  const inputClass = 'mt-1 block w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:border-border focus:ring-primary/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Leave</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
      ) : leaves.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">No leave requests found</p>
          <button onClick={openNew} className="text-primary hover:text-primary-dark text-sm mt-2">
            Create request
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Start</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">End</th>
                <th className="px-4 py-3 text-center font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Reason</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary">
                    {leave.employee
                      ? `${leave.employee.firstName} ${leave.employee.lastName}`
                      : `ID: ${leave.employeeId}`}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{LEAVE_TYPE[leave.type] || leave.type}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(leave.startDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(leave.endDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${LEAVE_STATUS[leave.status]?.badge || 'badge-inactive'}`}>
                      {LEAVE_STATUS[leave.status]?.label || leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{leave.reason || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStatusChange(leave.id, 'approved')}
                          className="text-success hover:text-emerald-300 text-xs flex items-center gap-1"
                          title="Approve"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(leave.id, 'rejected')}
                          className="text-danger hover:text-danger text-xs flex items-center gap-1 ml-2"
                          title="Reject"
                        >
                          <Ban className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} aria-hidden="true" />
          <div className="relative z-10 card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">New Leave Request</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="leave-employee" className="block text-sm font-medium text-text-secondary">Employee *</label>
                <select
                  id="leave-employee"
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
                <label htmlFor="leave-type" className="block text-sm font-medium text-text-secondary">Type *</label>
                <select
                  id="leave-type"
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
                  <label htmlFor="leave-start-date" className="block text-sm font-medium text-text-secondary">Start Date *</label>
                  <input
                    id="leave-start-date"
                    type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label htmlFor="leave-end-date" className="block text-sm font-medium text-text-secondary">End Date *</label>
                  <input
                    id="leave-end-date"
                    type="date" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="leave-reason" className="block text-sm font-medium text-text-secondary">Reason</label>
                <textarea
                  id="leave-reason"
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
                className="btn-primary flex-1 text-sm"
              >
                {saving ? 'Saving…' : 'Create Request'}
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
