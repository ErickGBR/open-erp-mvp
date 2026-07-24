'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { unwrapList } from '@/lib/rh-utils';

interface AssignmentData {
  id: number;
  employeeId: number;
  branchId: number;
  shiftId: number;
  dayOfWeek: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  employee?: { id: number; firstName: string; lastName: string; code: string };
  branch?: { id: number; name: string };
  shift?: { id: number; name: string; startTime: string; endTime: string };
}

interface EmployeeOption {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
}

interface BranchOption {
  id: number;
  name: string;
}

interface ShiftOption {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface AssignmentForm {
  employeeId: string;
  branchId: string;
  shiftId: string;
  dayOfWeek: string;
  startDate: string;
  endDate: string;
  isActive: string;
}

type FormErrors = Partial<Record<keyof AssignmentForm, string>>;

const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function ClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assignmentId = Number(params.id);

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [form, setForm] = useState<AssignmentForm | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [assignment, emps, brs, shs] = await Promise.all([
          api.get<AssignmentData>(`/rh/assignments/${assignmentId}`),
          api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active'),
          api.get<BranchOption[] | { data: BranchOption[] }>('/rh/branches'),
          api.get<ShiftOption[] | { data: ShiftOption[] }>('/rh/shifts'),
        ]);
        if (cancelled) return;

        setForm({
          employeeId: assignment.employeeId.toString(),
          branchId: assignment.branchId.toString(),
          shiftId: assignment.shiftId.toString(),
          dayOfWeek: assignment.dayOfWeek.toString(),
          startDate: assignment.startDate ? assignment.startDate.split('T')[0] : '',
          endDate: assignment.endDate ? assignment.endDate.split('T')[0] : '',
          isActive: assignment.isActive ? 'true' : 'false',
        });
        setEmployees(unwrapList(emps));
        setBranches(unwrapList(brs));
        setShifts(unwrapList(shs));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Error loading assignment');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [assignmentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    if (!form) return false;
    const next: FormErrors = {};
    if (!form.employeeId) next.employeeId = 'Employee is required';
    if (!form.branchId) next.branchId = 'Branch is required';
    if (!form.shiftId) next.shiftId = 'Shift is required';
    if (!form.dayOfWeek) next.dayOfWeek = 'Day of week is required';
    if (!form.startDate) next.startDate = 'Start date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.patch(`/rh/assignments/${assignmentId}`, {
        employeeId: Number(form.employeeId),
        branchId: Number(form.branchId),
        shiftId: Number(form.shiftId),
        dayOfWeek: Number(form.dayOfWeek),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        isActive: form.isActive === 'true',
      });
      router.push('/dashboard/rh/assignments');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error updating assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDelete(`Assignment #${assignmentId}`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/rh/assignments/${assignmentId}`);
      router.push('/dashboard/rh/assignments');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error deleting assignment');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = (field: keyof AssignmentForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary transition-colors bg-surface-card placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-border focus:border-border focus:ring-primary/50'
    }`;

  const selectClass = (field: keyof AssignmentForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors bg-surface-card focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 text-danger focus:border-red-500 focus:ring-red-500/50'
        : 'border-border text-text-secondary focus:border-border focus:ring-primary/50'
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-text-secondary">Loading assignment…</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <p className="text-lg font-semibold text-text-primary">Assignment not found</p>
        <p className="mt-1 text-sm text-text-secondary">The assignment you are looking for does not exist or was deleted.</p>
        <Link href="/dashboard/rh/assignments" className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark">
          &larr; Back to assignments
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <p className="text-sm text-danger">{submitError || 'Error loading assignment data.'}</p>
        <Link href="/dashboard/rh/assignments" className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark">
          &larr; Back to assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Shift Assignment</h1>
          <p className="mt-1 text-sm text-text-secondary">Assignment #{assignmentId}</p>
        </div>
        <Link href="/dashboard/rh/assignments" className="text-sm font-medium text-primary hover:text-primary-dark">
          &larr; Back
        </Link>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Assignment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="employeeId" className="block text-sm font-medium text-text-secondary">
                Employee <span className="text-red-500">*</span>
              </label>
              <select id="employeeId" name="employeeId"
                value={form.employeeId} onChange={handleChange}
                className={selectClass('employeeId')}>
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.code})</option>
                ))}
              </select>
              {errors.employeeId && <p className="mt-1 text-xs text-danger">{errors.employeeId}</p>}
            </div>
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-text-secondary">
                Branch <span className="text-red-500">*</span>
              </label>
              <select id="branchId" name="branchId"
                value={form.branchId} onChange={handleChange}
                className={selectClass('branchId')}>
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.branchId && <p className="mt-1 text-xs text-danger">{errors.branchId}</p>}
            </div>
            <div>
              <label htmlFor="shiftId" className="block text-sm font-medium text-text-secondary">
                Shift <span className="text-red-500">*</span>
              </label>
              <select id="shiftId" name="shiftId"
                value={form.shiftId} onChange={handleChange}
                className={selectClass('shiftId')}>
                <option value="">Select shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
              {errors.shiftId && <p className="mt-1 text-xs text-danger">{errors.shiftId}</p>}
            </div>
            <div>
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-text-secondary">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select id="dayOfWeek" name="dayOfWeek"
                value={form.dayOfWeek} onChange={handleChange}
                className={selectClass('dayOfWeek')}>
                <option value="">Select day</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              {errors.dayOfWeek && <p className="mt-1 text-xs text-danger">{errors.dayOfWeek}</p>}
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input id="startDate" name="startDate" type="date" required
                value={form.startDate} onChange={handleChange}
                className={inputClass('startDate')} />
              {errors.startDate && <p className="mt-1 text-xs text-danger">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary">
                End Date
              </label>
              <input id="endDate" name="endDate" type="date"
                value={form.endDate} onChange={handleChange}
                className={inputClass('endDate')} />
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-text-secondary">
                Status
              </label>
              <select id="isActive" name="isActive"
                value={form.isActive} onChange={handleChange}
                className={selectClass('isActive')}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete Assignment'}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/rh/assignments')}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg  disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
