'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MapPin, Plus, Trash2, Warehouse } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────

interface LocationType {
  id: number;
  name: string;
  section: string | null;
  description: string | null;
}

interface WarehouseResponse {
  id: number;
  name: string;
  description: string | null;
  country: string | null;
  city: string | null;
  locality: string | null;
  address: string | null;
  isActive: boolean;
  locations: LocationType[];
  createdAt: string;
  updatedAt: string;
}

interface WarehouseForm {
  name: string;
  description: string;
  country: string;
  city: string;
  locality: string;
  address: string;
}

type FormErrors = Partial<Record<keyof WarehouseForm, string>>;

// ── Component ────────────────────────────────────────────────────────────

/**
 * Edit Warehouse page — fetches warehouse data by [id] and renders a
 * pre-filled form with location management. On PATCH success, redirects
 * to the warehouse list. Handles loading, not-found, error, and submit states.
 */
export default function ClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState<WarehouseForm | null>(null);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New location form state
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationSection, setNewLocationSection] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);

  /** Fetch warehouse by ID and populate the form */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const wh = await api.get<WarehouseResponse>(`/warehouses/${params.id}`);
        if (cancelled) return;

        setForm({
          name: wh.name,
          description: wh.description ?? '',
          country: wh.country ?? '',
          city: wh.city ?? '',
          locality: wh.locality ?? '',
          address: wh.address ?? '',
        });
        setLocations(wh.locations ?? []);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Failed to load warehouse');
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

  /** Update a single form field and clear its validation error */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [],
  );

  /** Validate form — returns true if valid */
  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!form?.name.trim()) {
      next.name = 'Name is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  /** Submit warehouse fields — PATCH /warehouses/:id */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form || !validate()) return;

      setSubmitting(true);
      setSubmitError(null);

      try {
        await api.patch(`/warehouses/${params.id}`, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          country: form.country.trim() || null,
          city: form.city.trim() || null,
          locality: form.locality.trim() || null,
          address: form.address.trim() || null,
        });
        router.push('/dashboard/warehouses');
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to update warehouse');
      } finally {
        setSubmitting(false);
      }
    },
    [form, validate, params.id, router],
  );

  /** Add a new location to this warehouse */
  const handleAddLocation = useCallback(async () => {
    const name = newLocationName.trim();
    if (!name) return;

    setAddingLocation(true);
    try {
      const loc = await api.post<LocationType>('/warehouse-locations', {
        warehouseId: Number(params.id),
        name,
        section: newLocationSection.trim() || null,
      });
      setLocations((prev) => [...prev, loc]);
      setNewLocationName('');
      setNewLocationSection('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setAddingLocation(false);
    }
  }, [newLocationName, newLocationSection, params.id]);

  /** Delete a location from this warehouse */
  const handleDeleteLocation = useCallback(async (locId: number) => {
    try {
      await api.delete(`/warehouse-locations/${locId}`);
      setLocations((prev) => prev.filter((l) => l.id !== locId));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to delete location');
    }
  }, []);

  // ── Shared helpers ─────────────────────────────────────────────────────

  /** Class for text / textarea inputs */
  const inputClass = (field: keyof WarehouseForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-text-primary shadow-sm transition-colors bg-surface-card placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-border focus:border-border focus:ring-primary/50'
    }`;

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-text-secondary">Loading warehouse…</span>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center shadow-sm">
        <Warehouse className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <h2 className="text-lg font-semibold text-text-primary">Warehouse not found</h2>
        <p className="mt-1 text-sm text-text-secondary">
          The warehouse you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/warehouses"
          className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to warehouses
        </Link>
      </div>
    );
  }

  // ── Error loading (no form data) ───────────────────────────────────────

  if (!form) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-danger">{submitError || 'Failed to load warehouse data.'}</p>
        <Link
          href="/dashboard/warehouses"
          className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to warehouses
        </Link>
      </div>
    );
  }

  // ── Edit form ──────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Warehouse</h1>
          <p className="mt-1 text-sm text-text-secondary">Update warehouse information and manage locations.</p>
        </div>
        <Link
          href="/dashboard/warehouses"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to warehouses
        </Link>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {submitError}
        </div>
      )}

      {/* Main form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-2xl rounded-xl border border-border bg-surface-card p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name (required) */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
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
              className={inputClass('name')}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-danger">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              className={inputClass('description')}
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-secondary">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass('country')}
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text-secondary">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className={inputClass('city')}
            />
          </div>

          {/* Locality */}
          <div>
            <label htmlFor="locality" className="block text-sm font-medium text-text-secondary">
              Locality
            </label>
            <input
              type="text"
              id="locality"
              name="locality"
              value={form.locality}
              onChange={handleChange}
              className={inputClass('locality')}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-secondary">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={inputClass('address')}
            />
          </div>
        </div>

        {/* ── Locations section ─────────────────────────────────────────── */}
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">
            Locations
            <span className="ml-2 text-xs font-normal text-text-muted">({locations.length})</span>
          </h2>

          {/* Existing locations */}
          {locations.length === 0 ? (
            <p className="mb-4 text-xs text-text-muted">No locations yet. Add one below.</p>
          ) : (
            <div className="mb-4 space-y-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-text-primary">{loc.name}</span>
                    {loc.section && (
                      <span className="rounded bg-surface-hover px-1.5 py-0.5 text-xs text-text-secondary">
                        {loc.section}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="shrink-0 text-xs text-danger hover:text-danger"
                    aria-label={`Delete location ${loc.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new location */}
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border bg-surface-card/50 p-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="new-location-name" className="block text-xs font-medium text-text-secondary">
                Location name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="new-location-name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="e.g. Rack A1"
                className="mt-1 block w-full rounded border border-border bg-surface-card px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="new-location-section" className="block text-xs font-medium text-text-secondary">
                Section
              </label>
              <input
                type="text"
                id="new-location-section"
                value={newLocationSection}
                onChange={(e) => setNewLocationSection(e.target.value)}
                placeholder="e.g. Aisle 1"
                className="mt-1 block w-full rounded border border-border bg-surface-card px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <button
              type="button"
              disabled={addingLocation || !newLocationName.trim()}
              onClick={handleAddLocation}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {addingLocation ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/dashboard/warehouses"
            className="rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-white/[0.02]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-lg  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Update Warehouse'}
          </button>
        </div>
      </form>
    </div>
  );
}
