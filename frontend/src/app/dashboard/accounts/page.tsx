'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  subType: string | null;
  parentId: number | null;
  parent: { id: number; code: string; name: string } | null;
  balance: number;
  description: string | null;
  isActive: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expense',
};

const TYPE_COLORS: Record<string, string> = {
  asset: 'text-emerald-400',
  liability: 'text-amber-400',
  equity: 'text-blue-400',
  income: 'text-cyan-400',
  expense: 'text-red-400',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get<Account[]>(`/accounts?${params.toString()}`);
      setAccounts(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Chart of Accounts</h1>
        <Link
          href="/dashboard/accounts/new"
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
        >
          + New Account
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts…"
          className="flex-1 rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        >
          <option value="">All Types</option>
          <option value="asset">Assets</option>
          <option value="liability">Liabilities</option>
          <option value="equity">Equity</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
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
      {!loading && !error && accounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-2">No accounts found</p>
          <Link href="/dashboard/accounts/new" className="text-cyan-400 hover:text-cyan-300 text-sm">
            Create your first account
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && accounts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Parent</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Balance</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400">{acc.code}</td>
                  <td className="px-4 py-3 text-white">{acc.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${TYPE_COLORS[acc.type] || 'text-slate-400'}`}>
                      {TYPE_LABELS[acc.type] || acc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {acc.parent ? `${acc.parent.code} — ${acc.parent.name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">
                    ${Number(acc.balance).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/accounts/${acc.id}`}
                      className="text-cyan-400 hover:text-cyan-300 mr-3 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(acc.id, acc.name)}
                      disabled={deletingId === acc.id}
                      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                    >
                      {deletingId === acc.id ? '…' : 'Delete'}
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
