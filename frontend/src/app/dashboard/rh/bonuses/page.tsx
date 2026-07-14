'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Gift, Plus, Edit2, Trash2, X } from 'lucide-react';
import { BONUS_TYPE, formatCurrency, formatDate, unwrapList } from '@/lib/rh-utils';

/**
 * Bonus record from the API.
 */
interface BonusRecord {
  id: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string; code: string } | null;
  type: string;
  amount: number;
  date: string;
  description: string | null;
}

interface EmployeeOption {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
}

interface BonusForm {
  employeeId: string;
  type: string;
  amount: string;
  date: string;
  description: string;
}

const BONUS_TYPES = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'performance', label: 'Performance' },
  { value: 'commission', label: 'Commission' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'holiday', label: 'Christmas Bonus' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM: BonusForm = {
  employeeId: '',
  type: 'productivity',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
};

/**
 * Bonuses page.
 */
export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BonusForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBonuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<BonusRecord[] | { data: BonusRecord[] }>('/rh/bonuses');
      setBonuses(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading bonuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBonuses(); }, [fetchBonuses]);

  useEffect(() => {
    api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active')
      .then((result) => setEmployees(unwrapList(result)))
      .catch(() => {});
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (bonus: BonusRecord) => {
    setEditId(bonus.id);
    setForm({
      employeeId: String(bonus.employeeId),
      type: bonus.type,
      amount: String(bonus.amount),
      date: bonus.date.split('T')[0],
      description: bonus.description ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.amount || !form.date) return;
    setSaving(true);
    try {
      const body = {
        employeeId: Number(form.employeeId),
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        description: form.description.trim() || undefined,
      };

      if (editId) {
        await api.patch(`/rh/bonuses/${editId}`, body);
      } else {
        await api.post('/rh/bonuses', body);
      }

      setShowModal(false);
      await fetchBonuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving bonus');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    const confirmed = await confirmDelete(`Bonus: ${label}`);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/bonuses/${id}`);
      await fetchBonuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting bonus');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Bonuses</h1>
        <button onClick={openNew} className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Bonus
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : bonuses.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No bonuses found</p>
          <button onClick={openNew} className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">
            Create bonus
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Type</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Description</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.map((b) => (
                <tr key={b.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">
                    {b.employee ? `${b.employee.firstName} ${b.employee.lastName}` : `ID: ${b.employeeId}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-full px-2 py-0.5">
                      {BONUS_TYPE[b.type] || b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">{formatCurrency(b.amount)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(b.date)}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{b.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="text-cyan-400 hover:text-cyan-300 mr-3 text-xs">
                      <Edit2 className="w-3 h-3 inline" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, `${b.employee?.firstName ?? ''} ${b.employee?.lastName ?? ''} - ${BONUS_TYPE[b.type]}`)}
                      disabled={deletingId === b.id}
                      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3 inline" /> {deletingId === b.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editId ? 'Edit Bonus' : 'New Bonus'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Employee *</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className={inputClass}
                  disabled={!!editId}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputClass}
                >
                  {BONUS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Amount *</label>
                  <input
                    type="number" step="0.01" min="0" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Date *</label>
                  <input
                    type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.employeeId || !form.amount || !form.date}
                className="btn-cyan flex-1 text-sm"
              >
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
