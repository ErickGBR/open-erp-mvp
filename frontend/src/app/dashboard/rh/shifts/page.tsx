'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { unwrapList } from '@/lib/rh-utils';
import { Plus, Clock } from 'lucide-react';

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Shift[] | { data: Shift[] }>('/rh/shifts');
      setShifts(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/shifts/${id}`);
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting shift');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (t: string) => {
    if (!t) return '—';
    const parts = t.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Shifts</h1>
        <Link
          href="/dashboard/rh/shifts/new"
          className="btn-cyan text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Shift
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      )}

      {!loading && !error && shifts.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No shifts found</p>
          <Link
            href="/dashboard/rh/shifts/new"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Create first shift
          </Link>
        </div>
      )}

      {!loading && shifts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Start Time</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">End Time</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{shift.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-cyan-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(shift.startTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-cyan-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(shift.endTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      shift.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                    }`}>
                      {shift.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/rh/shifts/${shift.id}`}
                      className="text-cyan-400 hover:text-cyan-300 mr-3 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(shift.id, shift.name)}
                      disabled={deletingId === shift.id}
                      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                    >
                      {deletingId === shift.id ? '…' : 'Delete'}
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
