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
  { value: 'monthly', label: 'Mensual' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'hourly', label: 'Por Hora' },
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

    if (!form.firstName.trim()) next.firstName = 'El nombre es requerido';
    if (!form.lastName.trim()) next.lastName = 'El apellido es requerido';
    if (!form.code.trim()) next.code = 'El código es requerido';

    if (form.dui && !DUI_REGEX.test(form.dui.trim())) {
      next.dui = 'Formato de DUI inválido (00000000-0)';
    }
    if (form.nit && !NIT_REGEX.test(form.nit.trim())) {
      next.nit = 'Formato de NIT inválido (0000-000000-000-0)';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Correo electrónico inválido';
    }
    if (!form.hireDate) next.hireDate = 'La fecha de contratación es requerida';
    if (!form.baseSalary || Number(form.baseSalary) <= 0) {
      next.baseSalary = 'El salario base debe ser mayor a 0';
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
      setSubmitError(err instanceof Error ? err.message : 'Error al crear empleado');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Nuevo Empleado</h1>
        <p className="mt-1 text-sm text-slate-400">Ingrese los datos del nuevo empleado</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="glass-card rounded-xl p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Información Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input id="firstName" name="firstName" type="text" required
                value={form.firstName} onChange={handleChange}
                aria-invalid={!!errors.firstName}
                className={inputClass('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input id="lastName" name="lastName" type="text" required
                value={form.lastName} onChange={handleChange}
                aria-invalid={!!errors.lastName}
                className={inputClass('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                Código <span className="text-red-500">*</span>
              </label>
              <input id="code" name="code" type="text" required
                value={form.code} onChange={handleChange}
                placeholder="EMP-001"
                aria-invalid={!!errors.code}
                className={inputClass('code')} />
              {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
            </div>
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-slate-300">
                Departamento
              </label>
              <select id="departmentId" name="departmentId"
                value={form.departmentId} onChange={handleChange}
                className={selectClass('departmentId')}>
                <option value="">Seleccionar departamento</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-300">
                Cargo
              </label>
              <input id="position" name="position" type="text"
                value={form.position} onChange={handleChange}
                className={inputClass('position')} />
            </div>
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-slate-300">
                Fecha de Contratación <span className="text-red-500">*</span>
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
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Documentos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dui" className="block text-sm font-medium text-slate-300">DUI</label>
              <input id="dui" name="dui" type="text"
                value={form.dui} onChange={handleChange}
                placeholder="00000000-0"
                aria-invalid={!!errors.dui}
                className={inputClass('dui')} />
              {errors.dui && <p className="mt-1 text-xs text-red-400">{errors.dui}</p>}
            </div>
            <div>
              <label htmlFor="nit" className="block text-sm font-medium text-slate-300">NIT</label>
              <input id="nit" name="nit" type="text"
                value={form.nit} onChange={handleChange}
                placeholder="0000-000000-000-0"
                aria-invalid={!!errors.nit}
                className={inputClass('nit')} />
              {errors.nit && <p className="mt-1 text-xs text-red-400">{errors.nit}</p>}
            </div>
            <div>
              <label htmlFor="nrc" className="block text-sm font-medium text-slate-300">NRC</label>
              <input id="nrc" name="nrc" type="text"
                value={form.nrc} onChange={handleChange}
                className={inputClass('nrc')} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Correo Electrónico</label>
              <input id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                className={inputClass('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Teléfono</label>
              <input id="phone" name="phone" type="text"
                value={form.phone} onChange={handleChange}
                className={inputClass('phone')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-300">Dirección</label>
              <textarea id="address" name="address" rows={2}
                value={form.address} onChange={handleChange}
                className={inputClass('address')} />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Información Salarial
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="salaryType" className="block text-sm font-medium text-slate-300">Tipo de Salario</label>
              <select id="salaryType" name="salaryType"
                value={form.salaryType} onChange={handleChange}
                className={selectClass('salaryType')}>
                {SALARY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="baseSalary" className="block text-sm font-medium text-slate-300">
                Salario Base <span className="text-red-500">*</span>
              </label>
              <input id="baseSalary" name="baseSalary" type="number" step="0.01" min="0" required
                value={form.baseSalary} onChange={handleChange}
                className={inputClass('baseSalary')} />
              {errors.baseSalary && <p className="mt-1 text-xs text-red-400">{errors.baseSalary}</p>}
            </div>
          </div>
        </div>

        {/* Bank */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Información Bancaria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-slate-300">Banco</label>
              <input id="bankName" name="bankName" type="text"
                value={form.bankName} onChange={handleChange}
                className={inputClass('bankName')} />
            </div>
            <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-300">Cuenta Bancaria</label>
              <input id="bankAccount" name="bankAccount" type="text"
                value={form.bankAccount} onChange={handleChange}
                className={inputClass('bankAccount')} />
            </div>
          </div>
        </div>

        {/* Social Security */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 border-b border-cyan-500/10 pb-2">
            Seguridad Social
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="isssNumber" className="block text-sm font-medium text-slate-300">Número ISSS</label>
              <input id="isssNumber" name="isssNumber" type="text"
                value={form.isssNumber} onChange={handleChange}
                className={inputClass('isssNumber')} />
            </div>
            <div>
              <label htmlFor="afpNumber" className="block text-sm font-medium text-slate-300">Número AFP</label>
              <input id="afpNumber" name="afpNumber" type="text"
                value={form.afpNumber} onChange={handleChange}
                className={inputClass('afpNumber')} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-cyan-500/10">
          <button
            type="submit"
            disabled={submitting}
            className="btn-cyan flex-1"
          >
            {submitting ? 'Guardando…' : 'Crear Empleado'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/rh/employees')}
            className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
