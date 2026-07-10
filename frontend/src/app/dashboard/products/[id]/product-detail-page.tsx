'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  sku: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  cost: string;
  sku: string;
  stock: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  cost?: string;
  stock?: string;
}

/**
 * Edit Product form page — fetches existing product via GET /products/:id,
 * pre-fills the form, and submits a PATCH to update it.
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    cost: '',
    sku: '',
    stock: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  /** Fetch the existing product on mount. */
  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const product = await api.get<Product>(`/products/${productId}`);
        if (cancelled) return;
        setForm({
          name: product.name,
          description: product.description ?? '',
          price: String(product.price),
          cost: String(product.cost),
          sku: product.sku ?? '',
          stock: String(product.stock),
          isActive: product.isActive,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setApiError(err instanceof Error ? err.message : 'Failed to load product');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [productId]);

  /** Update a single form field and clear its validation error. */
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  /** Validate form fields before submission. */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 0) {
      newErrors.price = 'Price must be a number ≥ 0.';
    }

    if (form.cost) {
      const cost = parseFloat(form.cost);
      if (isNaN(cost) || cost < 0) {
        newErrors.cost = 'Cost must be a number ≥ 0.';
      }
    }

    if (form.stock) {
      const stock = parseInt(form.stock, 10);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = 'Stock must be an integer ≥ 0.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.patch(`/products/${productId}`, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        cost: form.cost ? parseFloat(form.cost) : 0,
        sku: form.sku.trim() || null,
        stock: form.stock ? parseInt(form.stock, 10) : 0,
        isActive: form.isActive,
      });
      router.push('/dashboard/products');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <BackLink />

        <div className="mx-auto max-w-lg">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-cyan-500/10" />
          <div className="space-y-5 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="mb-1 h-4 w-20 animate-pulse rounded bg-cyan-500/10" />
                <div className="h-9 w-full animate-pulse rounded bg-cyan-500/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 404 state ────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div>
        <BackLink />

        <div className="mx-auto max-w-lg rounded-xl border border-cyan-500/10 bg-[#12121e] p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">Product not found.</p>
          <Link
            href="/dashboard/products"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink />

      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-[#e2e8f0]">Edit Product</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-cyan-500/10 bg-[#12121e] p-6 shadow-sm"
          noValidate
        >
          {/* Global API error */}
          {apiError && (
            <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400" role="alert">
              {apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
              }`}
              placeholder="Product name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-300"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Optional description"
            />
          </div>

          {/* Price & Cost row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-300">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                  errors.price
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-slate-300">
                Cost
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => updateField('cost', e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                  errors.cost
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
                }`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-xs text-red-400">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* SKU & Stock row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-slate-300">
                SKU
              </label>
              <input
                id="sku"
                type="text"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-cyan-500/15 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                placeholder="e.g. PROD-001"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-300">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-[#1a1a2e] text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                  errors.stock
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-400">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Active / Inactive toggle */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-cyan-500/15 text-cyan-400 focus:ring-cyan-500/50"
              />
              <span className="text-sm font-medium text-slate-300">Product is active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </span>
              ) : (
                'Save Changes'
              )}
            </button>

            <Link
              href="/dashboard/products"
              className="rounded-lg border border-cyan-500/15 px-4 py-2.5 text-sm font-medium text-slate-300 shadow-sm hover:bg-white/[0.02]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Shared back-link used above the form on the edit page.
 */
function BackLink() {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Link
        href="/dashboard/products"
        className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
      >
        &larr; Back to Products
      </Link>
    </div>
  );
}
