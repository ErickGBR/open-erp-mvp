'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Building2, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { unwrapList } from '@/lib/rh-utils';

/**
 * Department data from the API.
 */
interface Department {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Departments page — inline create/edit/delete.
 */
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // New department form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Department[] | { data: Department[] }>('/rh/departments');
      setDepartments(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar departamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const startEdit = (dep: Department) => {
    setEditingId(dep.id);
    setEditName(dep.name);
    setEditDescription(dep.description ?? '');
    setShowNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/rh/departments/${id}`, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      cancelEdit();
      await fetchDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar departamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.post('/rh/departments', {
        name: newName.trim(),
        description: newDescription.trim() || null,
      });
      setShowNew(false);
      setNewName('');
      setNewDescription('');
      await fetchDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear departamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/departments/${id}`);
      await fetchDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar departamento');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = 'block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Departamentos</h1>
        <button
          onClick={() => { setShowNew(!showNew); setEditingId(null); }}
          className="btn-cyan text-sm flex items-center gap-1.5"
        >
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? 'Cancelar' : 'Nuevo Departamento'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* New department inline form */}
      {showNew && (
        <div className="glass-card rounded-xl p-4 mb-6 border-cyan-500/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Nuevo Departamento</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del departamento" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-slate-400 mb-1">Descripción</label>
              <input
                type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descripción opcional" className={inputClass} />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Crear'}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="rounded-lg border border-cyan-500/20 px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : departments.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No hay departamentos registrados</p>
          <button
            onClick={() => setShowNew(true)}
            className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
          >
            Crear primer departamento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {departments.map((dep) => (
            <div key={dep.id} className="glass-card rounded-xl p-4">
              {editingId === dep.id ? (
                /* Inline edit mode */
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                    <input
                      type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className={`${inputClass} ${!editName.trim() ? 'border-red-500/50' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                    <input
                      type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                      className={inputClass} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => saveEdit(dep.id)}
                      disabled={saving || !editName.trim()}
                      className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-2 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg border border-cyan-500/20 px-2.5 py-2 text-slate-400 hover:text-white transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{dep.name}</h3>
                      {dep.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{dep.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => startEdit(dep)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(dep.id, dep.name)}
                      disabled={deletingId === dep.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> {deletingId === dep.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
