'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

/** @interface {@link CustomerForm} — editable form fields */
interface CustomerForm {
  name: string;
  company: string;
  document: string;
  email: string;
  phone: string;
  address: string;
}

/** Field validation errors keyed by field name */
type FormErrors = Partial<Record<keyof CustomerForm, string>>;

/**
 * Edit Customer page — fetches customer data by [id] and renders a pre-filled form.
 * On PATCH success, redirects to the customers list.
 * Handles loading, not-found, and error states.
 */
export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState<CustomerForm | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Fetch customer by ID and populate the form */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const customer = await api.get<{
          id: number;
          name: string;
          company: string | null;
          document: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
        }>(`/customers/${params.id}`);

        if (cancelled) return;
        setForm({
          name: customer.name,
          company: customer.company ?? '',
          document: customer.document ?? '',
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          address: customer.address ?? '',
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Failed to load customer');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  /** Update a single form field and clear its error */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [],
  );

  /** Validate form fields — returns true if valid */
  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!form?.name.trim()) {
      next.name = 'Name is required';
    }
    if (form?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  /** Submit the form — PATCH /customers/:id */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form || !validate()) return;

      setSubmitting(true);
      setSubmitError(null);
      try {
        await api.patch(`/customers/${params.id}`, {
          name: form.name.trim(),
          company: form.company.trim() || null,
          document: form.document.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        });
        router.push('/dashboard/customers');
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to update customer');
      } finally {
        setSubmitting(false);
      }
    },
    [form, validate, params.id, router],
  );

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-400">Loading customer…</span>
      </div>
    );
  }

  /* ── Not found state ───────────────────────────────────────── */
  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-[#e2e8f0]">Customer not found</h2>
        <p className="mt-1 text-sm text-slate-400">
          The customer you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/customers"
          className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to customers
        </Link>
      </div>
    );
  }

  /* ── Error loading (no form data) ──────────────────────────── */
  if (!form) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-red-400">{submitError || 'Failed to load customer data.'}</p>
        <Link
          href="/dashboard/customers"
          className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to customers
        </Link>
      </div>
    );
  }

  /* ── Edit form ─────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Edit Customer</h1>
          <p className="mt-1 text-sm text-slate-400">Update customer information.</p>
        </div>
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to customers
        </Link>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300"
        >
          {submitError}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-2xl rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name (required) */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-[#e2e8f0] shadow-sm transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
              }`}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-300">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm transition-colors placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Document */}
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-slate-300">
              Document
            </label>
            <input
              type="text"
              id="document"
              name="document"
              value={form.document}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm transition-colors placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-[#e2e8f0] shadow-sm transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
              }`}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm transition-colors placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Address (full width) */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-300">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm transition-colors placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-cyan-500/5 pt-6">
          <Link
            href="/dashboard/customers"
            className="rounded-lg border border-cyan-500/15 bg-[#12121e] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/[0.02]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
