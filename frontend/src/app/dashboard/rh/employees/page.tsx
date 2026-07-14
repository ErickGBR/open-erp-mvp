'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Plus, Search, Users } from 'lucide-react';
import { EMPLOYEE_STATUS, formatCurrency, unwrapList } from '@/lib/rh-utils';

/**
 * Employee data from the API.
 * NOTE: The backend now excludes PII fields (DUI, NIT, bankAccount, etc.)
 * on list endpoints. Only the individual GET returns them for editing.
 */
interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  department: { id: number; name: string } | null;
  position: string | null;
  baseSalary: number | null;
  status: string;
}

/**
 * Employees list page.
 */
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const result = await api.get<Employee[] | { data: Employee[] }>(`/rh/employees?${params.toString()}`);
      setEmployees(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/employees/${id}`);
      await fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar empleado');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Empleados</h1>
        <Link
          href="/dashboard/rh/employees/new"
          className="btn-cyan text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && employees.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No hay empleados registrados</p>
          <Link
            href="/dashboard/rh/employees/new"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Crear primer empleado
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && employees.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Código</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Departamento</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Cargo</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Salario</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 text-xs">{emp.code}</td>
                  <td className="px-4 py-3 text-white">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{emp.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{emp.position || '—'}</td>
                  <td className="px-4 py-3 text-right text-white font-mono">
                    {formatCurrency(emp.baseSalary)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${EMPLOYEE_STATUS[emp.status]?.badge || 'badge-inactive'}`}>
                      {EMPLOYEE_STATUS[emp.status]?.label || emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/rh/employees/${emp.id}`}
                      className="text-cyan-400 hover:text-cyan-300 mr-3 text-xs"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                      disabled={deletingId === emp.id}
                      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                    >
                      {deletingId === emp.id ? '…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


