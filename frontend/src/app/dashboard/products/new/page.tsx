'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface FormData {
  name: string;
  description: string;
  price: string;
  cost: string;
  sku: string;
  barcode: string;
  unitOfMeasure: string;
  imageUrl: string;
  stock: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  cost?: string;
  stock?: string;
}

const UNITS: Record<string, string> = {
  unit: 'Unidad', dozen: 'Docena', kg: 'Kg', lb: 'Lb',
  m: 'Metro', cm: 'Cm', l: 'Litro', ml: 'Ml', box: 'Caja', pack: 'Paquete',
};

/**
 * New Product form page — creates a product via POST /products.
 * Validates required fields inline and shows API errors as an alert.
 */
export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    unitOfMeasure: 'unit',
    imageUrl: '',
    stock: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Update a single form field and clear its validation error. */
  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      await api.post('/products', {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        cost: form.cost ? parseFloat(form.cost) : 0,
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        unitOfMeasure: form.unitOfMeasure || null,
        imageUrl: form.imageUrl.trim() || null,
        stock: form.stock ? parseInt(form.stock, 10) : 0,
      });
      router.push('/dashboard/products');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to Products
        </Link>
      </div>

      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">New Product</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-surface-card p-6 shadow-sm"
          noValidate
        >
          {/* Global API error */}
          {apiError && (
            <div className="rounded-lg bg-danger-light p-3 text-sm text-danger" role="alert">
              {apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-surface-card text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-border focus:border-border focus:ring-primary/50'
              }`}
              placeholder="Product name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-secondary"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Optional description"
            />
          </div>

          {/* Price & Cost row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-secondary">
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
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-surface-card text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                  errors.price
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-border focus:border-border focus:ring-primary/50'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-danger">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-text-secondary">
                Cost
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => updateField('cost', e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-surface-card text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                  errors.cost
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-border focus:border-border focus:ring-primary/50'
                }`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-xs text-danger">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* SKU & Barcode row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-text-secondary">
                SKU
              </label>
              <input
                id="sku"
                type="text"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="e.g. PROD-001"
              />
            </div>

            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-text-secondary">
                Barcode
              </label>
              <input
                id="barcode"
                type="text"
                value={form.barcode}
                onChange={(e) => updateField('barcode', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="e.g. 12345670"
              />
            </div>
          </div>

          {/* Unit of Measure & Stock row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-text-secondary">
                Unit of Measure
              </label>
              <select
                id="unitOfMeasure"
                value={form.unitOfMeasure}
                onChange={(e) => updateField('unitOfMeasure', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-card text-text-primary shadow-sm focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {Object.entries(UNITS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-text-secondary">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm bg-surface-card text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                  errors.stock
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-border focus:border-border focus:ring-primary/50'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-danger">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating…
                </span>
              ) : (
                'Create Product'
              )}
            </button>

            <Link
              href="/dashboard/products"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary shadow-sm hover:bg-white/[0.02]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
