'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Clock, Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import { unwrapList } from '@/lib/rh-utils';

/**
 * Attendance record from the API.
 */
interface AttendanceRecord {
  id: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string; code: string } | null;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  regularHours: number | null;
  overtimeHours: number | null;
  breakMinutes: number | null;
  notes: string | null;
}

/**
 * Employee option for the dropdown.
 */
interface EmployeeOption {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
}

/**
 * Attendance form data.
 */
interface AttendanceForm {
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  notes: string;
}

const INITIAL_FORM: AttendanceForm = {
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  clockIn: '08:00',
  clockOut: '17:00',
  breakMinutes: '60',
  notes: '',
};

/**
 * Attendance page — date filter, table, and modal CRUD.
 */
export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AttendanceForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('startDate', dateFilter);
      const result = await api.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(`/rh/attendance?${params.toString()}`);
      setRecords(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading attendance');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active')
      .then((result) => setEmployees(unwrapList(result)))
      .catch(() => {});
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (record: AttendanceRecord) => {
    setEditId(record.id);
    setForm({
      employeeId: String(record.employeeId),
      date: record.date.split('T')[0],
      clockIn: extractTime(record.clockIn, '08:00'),
      clockOut: extractTime(record.clockOut, '17:00'),
      breakMinutes: String(record.breakMinutes ?? 60),
      notes: record.notes ?? '',
    });
    setShowModal(true);
  };

  /** Combine date + time into an ISO datetime string. */
  const toISO = (date: string, time: string): string | undefined => {
    if (!time) return undefined;
    return `${date}T${time}:00`;
  };

  /** Extract HH:MM from an ISO datetime string. */
  const extractTime = (iso: string | null | undefined, fallback = '08:00'): string => {
    if (!iso) return fallback;
    const m = iso.match(/T(\d{2}:\d{2})/);
    return m ? m[1] : fallback;
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.date) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        employeeId: Number(form.employeeId),
        date: form.date,
        clockIn: toISO(form.date, form.clockIn),
        clockOut: toISO(form.date, form.clockOut),
        breakMinutes: Number(form.breakMinutes) || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editId) {
        await api.patch(`/rh/attendance/${editId}`, body);
      } else {
        await api.post('/rh/attendance', body);
      }

      setShowModal(false);
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    const confirmed = await confirmDelete(`Record for ${label}`);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/attendance/${id}`);
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting record');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (val: string | null) => {
    if (!val) return '—';
    return extractTime(val);
  };

  const formatEmployeeName = (rec: AttendanceRecord) => {
    if (!rec.employee) return `ID: ${rec.employeeId}`;
    return `${rec.employee.firstName} ${rec.employee.lastName}`;
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:border-border focus:ring-primary/50';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Attendance</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Record
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Date</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg bg-surface-hover border border-border pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
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
      ) : records.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">No attendance records for this date</p>
          <button onClick={openNew} className="text-primary hover:text-primary-dark text-sm mt-2">
            Create record
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Check-in</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Check-out</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Reg. Hours</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Overtime</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Notes</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary">{formatEmployeeName(rec)}</td>
                  <td className="px-4 py-3 text-primary font-mono">{formatTime(rec.clockIn)}</td>
                  <td className="px-4 py-3 text-primary font-mono">{formatTime(rec.clockOut)}</td>
                  <td className="px-4 py-3 text-right text-text-primary">{rec.regularHours?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-warning">{rec.overtimeHours?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{rec.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(rec)} className="text-primary hover:text-primary-dark mr-3 text-xs">
                      <Edit2 className="w-3 h-3 inline" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id, formatEmployeeName(rec))}
                      disabled={deletingId === rec.id}
                      className="text-danger hover:text-danger text-xs disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3 inline" /> {deletingId === rec.id ? '…' : 'Delete'}
                    </button>
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
          {/* Overlay backdrop — sibling of card to prevent pointer-event conflicts */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          {/* Modal card — relative z-10 to stack above overlay */}
          <div className="relative z-10 card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {editId ? 'Edit Record' : 'New Record'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="att-employee" className="block text-sm font-medium text-text-secondary">Employee *</label>
                <select
                  id="att-employee"
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className={inputClass}
                  disabled={!!editId}
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
                <label htmlFor="att-date" className="block text-sm font-medium text-text-secondary">Date *</label>
                <input
                  id="att-date"
                  type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="att-clock-in" className="block text-sm font-medium text-text-secondary">Check-in</label>
                  <input
                    id="att-clock-in"
                    type="time" value={form.clockIn}
                    onChange={(e) => setForm({ ...form, clockIn: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label htmlFor="att-clock-out" className="block text-sm font-medium text-text-secondary">Check-out</label>
                  <input
                    id="att-clock-out"
                    type="time" value={form.clockOut}
                    onChange={(e) => setForm({ ...form, clockOut: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="att-break" className="block text-sm font-medium text-text-secondary">Break Minutes</label>
                <input
                  id="att-break"
                  type="number" value={form.breakMinutes}
                  onChange={(e) => setForm({ ...form, breakMinutes: e.target.value })}
                  className={inputClass} />
              </div>

              <div>
                <label htmlFor="att-notes" className="block text-sm font-medium text-text-secondary">Notes</label>
                <textarea
                  id="att-notes"
                  rows={2} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.employeeId || !form.date}
                className="btn-primary flex-1 text-sm"
              >
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
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
