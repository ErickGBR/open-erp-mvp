'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { unwrapList } from '@/lib/rh-utils';
import { MapPin, Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Branch {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

interface PaginatedBranches {
  data: Branch[];
  total: number;
  page: number;
  limit: number;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = Math.ceil(total / limit);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search.trim()) params.set('search', search.trim());
      const result = await api.get<PaginatedBranches>(`/rh/branches?${params}`);
      setBranches(unwrapList(result));
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading branches');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/branches/${id}`);
      await fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting branch');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = 'block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Branches</h1>
        <Link href="/dashboard/rh/branches/new" className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          New Branch
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search branches…" className={`${inputClass} pl-9`} />
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
      ) : branches.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No branches found</p>
          <Link href="/dashboard/rh/branches/new" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
            Create first branch
          </Link>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/10 text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-white font-medium">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {branch.address || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        branch.isActive
                          ? 'inline-block rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium'
                          : 'inline-block rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 text-xs font-medium'
                      }>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/rh/branches/${branch.id}`}
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          disabled={deletingId === branch.id}
                          className="text-xs text-red-400 hover:text-red-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> {deletingId === branch.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
              <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-cyan-500/15 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-cyan-500/15 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
