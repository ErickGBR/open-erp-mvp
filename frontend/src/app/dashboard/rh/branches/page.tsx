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

  const inputClass = 'block w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-border focus:ring-primary/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Branches</h1>
        <Link href="/dashboard/rh/branches/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          New Branch
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search branches…" className={`${inputClass} pl-9`} />
      </div>

      {error && (
        <div className="rounded-lg bg-danger-light border border-danger/30 p-3 text-sm text-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : branches.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">No branches found</p>
          <Link href="/dashboard/rh/branches/new" className="text-primary hover:text-primary-dark text-sm mt-2 inline-block">
            Create first branch
          </Link>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-secondary uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-text-primary font-medium">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                      {branch.address || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        branch.isActive
                          ? 'inline-block rounded-full bg-emerald-500/15 text-success border border-success/20 px-2.5 py-0.5 text-xs font-medium'
                          : 'inline-block rounded-full bg-slate-500/15 text-text-secondary border border-slate-500/20 px-2.5 py-0.5 text-xs font-medium'
                      }>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/rh/branches/${branch.id}`}
                          className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          disabled={deletingId === branch.id}
                          className="text-xs text-danger hover:text-danger disabled:text-text-muted disabled:cursor-not-allowed flex items-center gap-1"
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
            <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
              <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
