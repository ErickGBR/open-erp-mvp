'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { unwrapList, formatDate } from '@/lib/rh-utils';
import { CalendarRange, Plus, Search } from 'lucide-react';

interface Assignment {
  id: number;
  employeeId: number;
  branchId: number;
  shiftId: number;
  dayOfWeek: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  employee?: { id: number; firstName: string; lastName: string; code: string };
  branch?: { id: number; name: string };
  shift?: { id: number; name: string; startTime: string; endTime: string };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (search) params.set('search', search);
      const result = await api.get<{ data: Assignment[]; total: number }>(`/rh/assignments?${params.toString()}`);
      setAssignments(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleDelete = async (id: number, label: string) => {
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/assignments/${id}`);
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting assignment');
    } finally {
      setDeletingId(null);
    }
  };

  const employeeName = (a: Assignment) =>
    a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : `ID ${a.employeeId}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Shift Assignments</h1>
        <Link
          href="/dashboard/rh/assignments/new"
          className="btn-cyan text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Assignment
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name…"
            className="w-full rounded-lg bg-white/5 border border-cyan-500/15 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
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

      {!loading && !error && assignments.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <CalendarRange className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No assignments found</p>
          <Link
            href="/dashboard/rh/assignments/new"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Create first assignment
          </Link>
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Branch</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Shift</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Day of Week</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Start Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">End Date</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white whitespace-nowrap">
                    {a.employee && <span className="text-xs text-cyan-400 font-mono mr-1.5">{a.employee.code}</span>}
                    {employeeName(a)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{a.branch?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {a.shift ? `${a.shift.name} (${a.shift.startTime} - ${a.shift.endTime})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{DAY_NAMES[a.dayOfWeek] || a.dayOfWeek}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(a.startDate)}</td>
                  <td className="px-4 py-3 text-slate-300">{a.endDate ? formatDate(a.endDate) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                    }`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/rh/assignments/${a.id}`}
                      className="text-cyan-400 hover:text-cyan-300 mr-3 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id, `${employeeName(a)} - ${DAY_NAMES[a.dayOfWeek]}`)}
                      disabled={deletingId === a.id}
                      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                    >
                      {deletingId === a.id ? '…' : 'Delete'}
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
