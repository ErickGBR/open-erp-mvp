'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrapList } from '@/lib/rh-utils';

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

const INITIAL_FORM: AssignmentForm = {
  employeeId: '',
  branchId: '',
  shiftId: '',
  dayOfWeek: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export default function NewAssignmentPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [form, setForm] = useState<AssignmentForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active'),
      api.get<BranchOption[] | { data: BranchOption[] }>('/rh/branches'),
      api.get<ShiftOption[] | { data: ShiftOption[] }>('/rh/shifts'),
    ]).then(([emps, brs, shs]) => {
      setEmployees(unwrapList(emps));
      setBranches(unwrapList(brs));
      setShifts(unwrapList(shs));
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
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
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post('/rh/assignments', {
        employeeId: Number(form.employeeId),
        branchId: Number(form.branchId),
        shiftId: Number(form.shiftId),
        dayOfWeek: Number(form.dayOfWeek),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
      router.push('/dashboard/rh/assignments');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error creating assignment');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">New Shift Assignment</h1>
        <p className="mt-1 text-sm text-text-secondary">Assign a shift to an employee for a specific day of the week</p>
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
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Saving…' : 'Create Assignment'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/rh/assignments')}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
