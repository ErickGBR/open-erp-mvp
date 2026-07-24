'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

type FormErrors = Partial<Record<keyof ShiftForm, string>>;

export default function NewShiftPage() {
  const router = useRouter();
  const [form, setForm] = useState<ShiftForm>({
    name: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.startTime) next.startTime = 'Start time is required';
    if (!form.endTime) next.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      next.endTime = 'End time must be after start time';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post('/rh/shifts', {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: form.isActive,
      });
      router.push('/dashboard/rh/shifts');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error creating shift');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof ShiftForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary transition-colors bg-surface-card placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-border focus:border-border focus:ring-primary/50'
    }`;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">New Shift</h1>
        <p className="mt-1 text-sm text-text-secondary">Create a new work shift</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="name" name="name" type="text" required
            value={form.name} onChange={handleChange}
            placeholder="Morning Shift"
            aria-invalid={!!errors.name}
            className={inputClass('name')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-text-secondary">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input id="startTime" name="startTime" type="time" required
              value={form.startTime} onChange={handleChange}
              aria-invalid={!!errors.startTime}
              className={inputClass('startTime')} />
            {errors.startTime && <p className="mt-1 text-xs text-danger">{errors.startTime}</p>}
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-text-secondary">
              End Time <span className="text-red-500">*</span>
            </label>
            <input id="endTime" name="endTime" type="time" required
              value={form.endTime} onChange={handleChange}
              aria-invalid={!!errors.endTime}
              className={inputClass('endTime')} />
            {errors.endTime && <p className="mt-1 text-xs text-danger">{errors.endTime}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="isActive" name="isActive" type="checkbox"
            checked={form.isActive} onChange={handleChange}
            className="h-4 w-4 rounded border-border bg-surface-card text-primary focus:ring-primary/50" />
          <label htmlFor="isActive" className="text-sm text-text-secondary">
            Active shift
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Saving…' : 'Create Shift'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/rh/shifts')}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
