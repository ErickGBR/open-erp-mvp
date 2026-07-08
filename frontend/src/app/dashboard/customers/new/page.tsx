'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

/**
 * Customer form state, mirroring the Customer API shape without the server-only fields.
 */
interface CustomerForm {
  name: string;
  company: string;
  document: string;
  email: string;
  phone: string;
  address: string;
}

/** Initial blank form values */
const INITIAL_FORM: CustomerForm = {
  name: '',
  company: '',
  document: '',
  email: '',
  phone: '',
  address: '',
};

/** Field validation errors keyed by field name */
type FormErrors = Partial<Record<keyof CustomerForm, string>>;

/**
 * New Customer page — renders a form that POSTs to /customers.
 * On success, redirects to the customers list.
 */
export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Update a single form field and clear its error */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [],
  );

  /** Validate form fields — returns true if valid */
  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) {
      next.name = 'Name is required';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  /** Submit the form — POST /customers */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setSubmitting(true);
      setSubmitError(null);
      try {
        await api.post('/customers', {
          name: form.name.trim(),
          company: form.company.trim() || null,
          document: form.document.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        });
        router.push('/dashboard/customers');
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to create customer');
      } finally {
        setSubmitting(false);
      }
    },
    [form, validate, router],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new customer to your directory.</p>
        </div>
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to customers
        </Link>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name (required) */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Acme Inc."
            />
          </div>

          {/* Document */}
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">
              Document
            </label>
            <input
              type="text"
              id="document"
              name="document"
              value={form.document}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="CNPJ / CPF"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address (full width) */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Link
            href="/dashboard/customers"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
