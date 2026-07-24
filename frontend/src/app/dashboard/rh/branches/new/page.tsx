'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface BranchForm {
  name: string;
  address: string;
}

type FormErrors = Partial<Record<keyof BranchForm, string>>;

const INITIAL_FORM: BranchForm = {
  name: '',
  address: '',
};

export default function NewBranchPage() {
  const router = useRouter();
  const [form, setForm] = useState<BranchForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post('/rh/branches', {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
      });
      router.push('/dashboard/rh/branches');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error creating branch');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof BranchForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary transition-colors bg-surface-card placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-border focus:border-border focus:ring-primary/50'
    }`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">New Branch</h1>
        <p className="mt-1 text-sm text-text-secondary">Enter the new branch details</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
              Name <span className="text-red-500">*</span>
            </label>
            <input id="name" name="name" type="text" required
              value={form.name} onChange={handleChange}
              placeholder="Branch name"
              aria-invalid={!!errors.name}
              className={inputClass('name')} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-secondary">
              Address
            </label>
            <textarea id="address" name="address" rows={3}
              value={form.address} onChange={handleChange}
              placeholder="Optional address"
              className={inputClass('address')} />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Saving…' : 'Create Branch'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/rh/branches')}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
