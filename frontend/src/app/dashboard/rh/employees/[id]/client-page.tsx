'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { unwrapList } from '@/lib/rh-utils';

/**
 * Full employee data from the API.
 */
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
  dui: string | null;
  nit: string | null;
  nrc: string | null;
  qrToken: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  hireDate: string;
  position: string | null;
  salaryType: string;
  baseSalary: number | null;
  bankName: string | null;
  bankAccount: string | null;
  isssNumber: string | null;
  afpNumber: string | null;
  departmentId: number | null;
  department: { id: number; name: string } | null;
  status: string;
}

interface DepartmentOption {
  id: number;
  name: string;
}

interface EmployeeForm {
  firstName: string;
  lastName: string;
  code: string;
  dui: string;
  nit: string;
  nrc: string;
  email: string;
  phone: string;
  address: string;
  hireDate: string;
  position: string;
  salaryType: string;
  baseSalary: string;
  bankName: string;
  bankAccount: string;
  isssNumber: string;
  afpNumber: string;
  departmentId: string;
  status: string;
}

type FormErrors = Partial<Record<keyof EmployeeForm, string>>;

const SALARY_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'hourly', label: 'Per Hour' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const DUI_REGEX = /^\d{8}-\d$/;
const NIT_REGEX = /^\d{4}-\d{6}-\d{3}-\d$/;

/**
 * Edit Employee page — loads employee by ID and shows pre-populated form.
 */
export default function ClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const employeeId = Number(params.id);

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState<EmployeeForm | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [employee, deps] = await Promise.all([
          api.get<EmployeeData>(`/rh/employees/${employeeId}`),
          api.get<DepartmentOption[] | { data: DepartmentOption[] }>('/rh/departments'),
        ]);
        if (cancelled) return;

        setForm({
          firstName: employee.firstName,
          lastName: employee.lastName,
          code: employee.code,
          dui: employee.dui ?? '',
          nit: employee.nit ?? '',
          nrc: employee.nrc ?? '',
          email: employee.email ?? '',
          phone: employee.phone ?? '',
          address: employee.address ?? '',
          hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
          position: employee.position ?? '',
          salaryType: employee.salaryType || 'monthly',
          baseSalary: employee.baseSalary?.toString() ?? '',
          bankName: employee.bankName ?? '',
          bankAccount: employee.bankAccount ?? '',
          isssNumber: employee.isssNumber ?? '',
          afpNumber: employee.afpNumber ?? '',
          departmentId: employee.departmentId?.toString() ?? '',
          status: employee.status || 'active',
        });
        setDepartments(unwrapList(deps));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Error loading employee');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    if (!form) return false;
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!form.code.trim()) next.code = 'Code is required';
    if (form.dui && !DUI_REGEX.test(form.dui.trim())) {
      next.dui = 'Invalid DUI format (00000000-0)';
    }
    if (form.nit && !NIT_REGEX.test(form.nit.trim())) {
      next.nit = 'Invalid NIT format (0000-000000-000-0)';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Invalid email';
    }
    if (!form.hireDate) next.hireDate = 'Hire date is required';
    if (!form.baseSalary || Number(form.baseSalary) <= 0) {
      next.baseSalary = 'Base salary must be greater than 0';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.patch(`/rh/employees/${employeeId}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        code: form.code.trim(),
        dui: form.dui.trim() || undefined,
        nit: form.nit.trim() || undefined,
        nrc: form.nrc.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        hireDate: form.hireDate,
        position: form.position.trim() || undefined,
        salaryType: form.salaryType,
        baseSalary: Number(form.baseSalary),
        bankName: form.bankName.trim() || undefined,
        bankAccount: form.bankAccount.trim() || undefined,
        isssNumber: form.isssNumber.trim() || undefined,
        afpNumber: form.afpNumber.trim() || undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        status: form.status,
      });
      router.push('/dashboard/rh/employees');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error updating employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;
    const name = `${form.firstName} ${form.lastName}`;
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;

    setDeletingId(employeeId);
    try {
      await api.delete(`/rh/employees/${employeeId}`);
      router.push('/dashboard/rh/employees');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error deleting employee');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = (field: keyof EmployeeForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-[#e2e8f0] transition-colors bg-[#1a1a2e] placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/50'
    }`;

  const selectClass = (field: keyof EmployeeForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors bg-[#1a1a2e] focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 text-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-cyan-500/15 text-slate-300 focus:border-cyan-500/40 focus:ring-cyan-500/50'
    }`;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-400">Loading employee…</span>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-[#e2e8f0]">Employee not found</p>
        <p className="mt-1 text-sm text-slate-400">The employee you are looking for does not exist or was deleted.</p>
        <Link href="/dashboard/rh/employees" className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back to employees
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-[#12121e] px-6 py-16 text-center">
        <p className="text-sm text-red-400">{submitError || 'Error loading employee data.'}</p>
        <Link href="/dashboard/rh/employees" className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back to employees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Edit Employee</h1>
          <p className="mt-1 text-sm text-slate-400">
            {form.firstName} {form.lastName} — {form.code}
          </p>
        </div>
        <Link href="/dashboard/rh/employees" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
          &larr; Back
        </Link>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="glass-card rounded-xl p-6 space-y-6">
        {/* Status */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Status</h2>
          <div className="max-w-xs">
            <select name="status" value={form.status} onChange={handleChange} className={selectClass('status')}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <input id="firstName" name="firstName" type="text" required
                value={form.firstName} onChange={handleChange}
                className={inputClass('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input id="lastName" name="lastName" type="text" required
                value={form.lastName} onChange={handleChange}
                className={inputClass('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                Code <span className="text-red-500">*</span>
              </label>
              <input id="code" name="code" type="text" required
                value={form.code} onChange={handleChange}
                className={inputClass('code')} />
              {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
            </div>
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-slate-300">
                Department
              </label>
              <select id="departmentId" name="departmentId"
                value={form.departmentId} onChange={handleChange}
                className={selectClass('departmentId')}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-300">Position</label>
              <input id="position" name="position" type="text"
                value={form.position} onChange={handleChange}
                className={inputClass('position')} />
            </div>
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-slate-300">
                Hire Date <span className="text-red-500">*</span>
              </label>
              <input id="hireDate" name="hireDate" type="date" required
                value={form.hireDate} onChange={handleChange}
                className={inputClass('hireDate')} />
              {errors.hireDate && <p className="mt-1 text-xs text-red-400">{errors.hireDate}</p>}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dui" className="block text-sm font-medium text-slate-300">DUI</label>
              <input id="dui" name="dui" type="text" value={form.dui} onChange={handleChange}
                placeholder="00000000-0" className={inputClass('dui')} />
              {errors.dui && <p className="mt-1 text-xs text-red-400">{errors.dui}</p>}
            </div>
            <div>
              <label htmlFor="nit" className="block text-sm font-medium text-slate-300">NIT</label>
              <input id="nit" name="nit" type="text" value={form.nit} onChange={handleChange}
                placeholder="0000-000000-000-0" className={inputClass('nit')} />
              {errors.nit && <p className="mt-1 text-xs text-red-400">{errors.nit}</p>}
            </div>
            <div>
              <label htmlFor="nrc" className="block text-sm font-medium text-slate-300">NRC</label>
              <input id="nrc" name="nrc" type="text" value={form.nrc} onChange={handleChange}
                className={inputClass('nrc')} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone</label>
              <input id="phone" name="phone" type="text" value={form.phone} onChange={handleChange} className={inputClass('phone')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-300">Address</label>
              <textarea id="address" name="address" rows={2} value={form.address} onChange={handleChange} className={inputClass('address')} />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Salary Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="salaryType" className="block text-sm font-medium text-slate-300">Salary Type</label>
              <select id="salaryType" name="salaryType" value={form.salaryType} onChange={handleChange} className={selectClass('salaryType')}>
                {SALARY_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="baseSalary" className="block text-sm font-medium text-slate-300">Base Salary <span className="text-red-500">*</span></label>
              <input id="baseSalary" name="baseSalary" type="number" step="0.01" min="0" required
                value={form.baseSalary} onChange={handleChange} className={inputClass('baseSalary')} />
              {errors.baseSalary && <p className="mt-1 text-xs text-red-400">{errors.baseSalary}</p>}
            </div>
          </div>
        </div>

        {/* Bank */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Bank Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-slate-300">Bank</label>
              <input id="bankName" name="bankName" type="text" value={form.bankName} onChange={handleChange} className={inputClass('bankName')} />
            </div>
            <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-300">Bank Account</label>
              <input id="bankAccount" name="bankAccount" type="text" value={form.bankAccount} onChange={handleChange} className={inputClass('bankAccount')} />
            </div>
          </div>
        </div>

        {/* Social Security */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">Social Security</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="isssNumber" className="block text-sm font-medium text-slate-300">ISSS Number</label>
              <input id="isssNumber" name="isssNumber" type="text" value={form.isssNumber} onChange={handleChange} className={inputClass('isssNumber')} />
            </div>
            <div>
              <label htmlFor="afpNumber" className="block text-sm font-medium text-slate-300">AFP Number</label>
              <input id="afpNumber" name="afpNumber" type="text" value={form.afpNumber} onChange={handleChange} className={inputClass('afpNumber')} />
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">QR Code</h2>
          <div className="flex items-center gap-6">
            <div className="bg-white rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/rh/qr/${employeeId}`}
                alt={`QR for ${form.firstName} ${form.lastName}`}
                className="w-40 h-40"
              />
            </div>
            <div className="space-y-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/rh/qr/${employeeId}`}
                download={`qr-${form.code}.png`}
                className="btn-cyan text-sm inline-flex items-center gap-1.5"
              >
                Download QR
              </a>
              <br />
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.get(`/rh/qr/${employeeId}/regenerate`);
                    window.location.reload();
                  } catch (err) {
                    setSubmitError(err instanceof Error ? err.message : 'Error regenerating QR');
                  }
                }}
                className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm text-amber-400 hover:bg-amber-900/20 transition-colors"
              >
                Regenerate Token
              </button>
              <p className="text-xs text-slate-500 max-w-xs">
                Scan this QR at the attendance kiosk to clock in/out.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/10">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletingId === employeeId}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {deletingId === employeeId ? 'Deleting…' : 'Delete Employee'}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/rh/employees')}
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
