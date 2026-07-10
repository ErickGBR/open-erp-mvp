'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  subType: string | null;
  parentId: number | null;
  description: string | null;
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [parents, setParents] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('asset');
  const [parentId, setParentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Account>(`/accounts/${id}`),
      api.get<Account[]>('/accounts'),
    ]).then(([account, allAccounts]) => {
      setCode(account.code);
      setName(account.name);
      setType(account.type);
      setParentId(account.parentId);
      setDescription(account.description ?? '');
      setParents(allAccounts.filter(a => a.id !== id));
      setLoading(false);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.patch(`/accounts/${id}`, {
        code, name, type,
        parentId: parentId || undefined,
        description: description || undefined,
      });
      router.push('/dashboard/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Account</h1>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300">Code</label>
          <input type="text" required value={code} onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30">
            {ACCOUNT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Parent Account</label>
          <select value={parentId ?? ''} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30">
            <option value="">— None (Top Level) —</option>
            {parents.filter(p => p.type === type).map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-cyan flex-1">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard/accounts')}
            className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
