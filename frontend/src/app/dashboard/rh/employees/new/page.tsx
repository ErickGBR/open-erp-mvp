'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrapList } from '@/lib/rh-utils';

/**
 * Department option from the API.
 */
interface DepartmentOption {
  id: number;
  name: string;
}

/**
 * Form data for creating an employee.
 */
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
}

type FormErrors = Partial<Record<keyof EmployeeForm, string>>;

const INITIAL_FORM: EmployeeForm = {
  firstName: '',
  lastName: '',
  code: '',
  dui: '',
  nit: '',
  nrc: '',
  email: '',
  phone: '',
  address: '',
  hireDate: new Date().toISOString().split('T')[0],
  position: '',
  salaryType: 'monthly',
  baseSalary: '',
  bankName: '',
  bankAccount: '',
  isssNumber: '',
  afpNumber: '',
  departmentId: '',
};

const SALARY_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'hourly', label: 'Per Hour' },
];

/**
 * DUI format: 00000000-0
 */
const DUI_REGEX = /^\d{8}-\d$/;

/**
 * NIT format: 0000-000000-000-0
 */
const NIT_REGEX = /^\d{4}-\d{6}-\d{3}-\d$/;

/**
 * New Employee form page.
 */
export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState<EmployeeForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DepartmentOption[] | { data: DepartmentOption[] }>('/rh/departments')
      .then((result) => setDepartments(unwrapList(result)))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
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
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post('/rh/employees', {
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
      });
      router.push('/dashboard/rh/employees');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error creating employee');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof EmployeeForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary transition-colors bg-surface-card placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
        : 'border-border focus:border-border focus:ring-primary/50'
    }`;

  const selectClass = (field: keyof EmployeeForm) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors bg-surface-card focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 text-danger focus:border-red-500 focus:ring-red-500/50'
        : 'border-border text-text-secondary focus:border-border focus:ring-primary/50'
    }`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">New Employee</h1>
        <p className="mt-1 text-sm text-text-secondary">Enter the new employee details</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary">
                First Name <span className="text-red-500">*</span>
              </label>
              <input id="firstName" name="firstName" type="text" required
                value={form.firstName} onChange={handleChange}
                aria-invalid={!!errors.firstName}
                className={inputClass('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input id="lastName" name="lastName" type="text" required
                value={form.lastName} onChange={handleChange}
                aria-invalid={!!errors.lastName}
                className={inputClass('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-text-secondary">
                Code <span className="text-red-500">*</span>
              </label>
              <input id="code" name="code" type="text" required
                value={form.code} onChange={handleChange}
                placeholder="EMP-001"
                aria-invalid={!!errors.code}
                className={inputClass('code')} />
              {errors.code && <p className="mt-1 text-xs text-danger">{errors.code}</p>}
            </div>
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-text-secondary">
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
              <label htmlFor="position" className="block text-sm font-medium text-text-secondary">
                Position
              </label>
              <input id="position" name="position" type="text"
                value={form.position} onChange={handleChange}
                className={inputClass('position')} />
            </div>
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-text-secondary">
                Hire Date <span className="text-red-500">*</span>
              </label>
              <input id="hireDate" name="hireDate" type="date" required
                value={form.hireDate} onChange={handleChange}
                className={inputClass('hireDate')} />
              {errors.hireDate && <p className="mt-1 text-xs text-danger">{errors.hireDate}</p>}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dui" className="block text-sm font-medium text-text-secondary">DUI</label>
              <input id="dui" name="dui" type="text"
                value={form.dui} onChange={handleChange}
                placeholder="00000000-0"
                aria-invalid={!!errors.dui}
                className={inputClass('dui')} />
              {errors.dui && <p className="mt-1 text-xs text-danger">{errors.dui}</p>}
            </div>
            <div>
              <label htmlFor="nit" className="block text-sm font-medium text-text-secondary">NIT</label>
              <input id="nit" name="nit" type="text"
                value={form.nit} onChange={handleChange}
                placeholder="0000-000000-000-0"
                aria-invalid={!!errors.nit}
                className={inputClass('nit')} />
              {errors.nit && <p className="mt-1 text-xs text-danger">{errors.nit}</p>}
            </div>
            <div>
              <label htmlFor="nrc" className="block text-sm font-medium text-text-secondary">NRC</label>
              <input id="nrc" name="nrc" type="text"
                value={form.nrc} onChange={handleChange}
                className={inputClass('nrc')} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
              <input id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                className={inputClass('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Phone</label>
              <input id="phone" name="phone" type="text"
                value={form.phone} onChange={handleChange}
                className={inputClass('phone')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-text-secondary">Address</label>
              <textarea id="address" name="address" rows={2}
                value={form.address} onChange={handleChange}
                className={inputClass('address')} />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Salary Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label htmlFor="salaryType" className="block text-sm font-medium text-text-secondary">Salary Type</label>
              <select id="salaryType" name="salaryType"
                value={form.salaryType} onChange={handleChange}
                className={selectClass('salaryType')}>
                {SALARY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="baseSalary" className="block text-sm font-medium text-text-secondary">
                Base Salary <span className="text-red-500">*</span>
              </label>
              <input id="baseSalary" name="baseSalary" type="number" step="0.01" min="0" required
                value={form.baseSalary} onChange={handleChange}
                className={inputClass('baseSalary')} />
              {errors.baseSalary && <p className="mt-1 text-xs text-danger">{errors.baseSalary}</p>}
            </div>
          </div>
        </div>

        {/* Bank */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Bank Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-text-secondary">Bank</label>
              <input id="bankName" name="bankName" type="text"
                value={form.bankName} onChange={handleChange}
                className={inputClass('bankName')} />
            </div>
            <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-text-secondary">Bank Account</label>
              <input id="bankAccount" name="bankAccount" type="text"
                value={form.bankAccount} onChange={handleChange}
                className={inputClass('bankAccount')} />
            </div>
          </div>
        </div>

        {/* Social Security */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 border-b border-border pb-2">
            Social Security
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="isssNumber" className="block text-sm font-medium text-text-secondary">ISSS Number</label>
              <input id="isssNumber" name="isssNumber" type="text"
                value={form.isssNumber} onChange={handleChange}
                className={inputClass('isssNumber')} />
            </div>
            <div>
              <label htmlFor="afpNumber" className="block text-sm font-medium text-text-secondary">AFP Number</label>
              <input id="afpNumber" name="afpNumber" type="text"
                value={form.afpNumber} onChange={handleChange}
                className={inputClass('afpNumber')} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Saving…' : 'Create Employee'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/rh/employees')}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
