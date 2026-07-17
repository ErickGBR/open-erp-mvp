'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';

interface BranchData {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

interface BranchForm {
  name: string;
  address: string;
  isActive: boolean;
}

type FormErrors = Partial<Record<keyof BranchForm, string>>;

export default function ClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const branchId = Number(params.id);

  const [form, setForm] = useState<BranchForm | null>(null);
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
        const branch = await api.get<BranchData>(`/rh/branches/${branchId}`);
        if (cancelled) return;

        setForm({
          name: branch.name,
          address: branch.address ?? '',
          isActive: branch.isActive,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Error loading branch');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [branchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value } : prev));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    if (!form) return false;
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.patch(`/rh/branches/${branchId}`, {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        isActive: form.isActive,
      });
      router.push('/dashboard/rh/branches');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error updating branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;
    const confirmed = await confirmDelete(form.name);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/rh/branches/${branchId}`);
      router.push('/dashboard/rh/branches');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error deleting branch');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = (field: keyof BranchForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-[#e2e8f0] transition-colors bg-[#1a1a2e] placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-400">Loading branch…</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-[#e2e8f0]">Branch not found</p>
        <p className="mt-1 text-sm text-slate-400">The branch you are looking for does not exist or was deleted.</p>
        <Link href="/dashboard/rh/branches" className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back to branches
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center">
        <p className="text-sm text-red-400">{submitError || 'Error loading branch data.'}</p>
        <Link href="/dashboard/rh/branches" className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back to branches
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Edit Branch</h1>
          <p className="mt-1 text-sm text-slate-400">{form.name}</p>
        </div>
        <Link href="/dashboard/rh/branches" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back
        </Link>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="glass-card rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input id="name" name="name" type="text" required
              value={form.name} onChange={handleChange}
              aria-invalid={!!errors.name}
              className={inputClass('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-300">
              Address
            </label>
            <textarea id="address" name="address" rows={3}
              value={form.address} onChange={handleChange}
              className={inputClass('address')} />
          </div>
          <div className="flex items-center gap-2">
            <input id="isActive" name="isActive" type="checkbox"
              checked={form.isActive} onChange={handleChange}
              className="rounded border-cyan-500/30 bg-[#1a1a2e] text-cyan-500 focus:ring-cyan-500/50" />
            <label htmlFor="isActive" className="text-sm text-slate-300">
              Active
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/10">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete Branch'}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/rh/branches')}
              className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
