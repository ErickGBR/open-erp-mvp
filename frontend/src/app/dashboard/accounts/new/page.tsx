'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId: number | null;
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [parents, setParents] = useState<Account[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('asset');
  const [subType, setSubType] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Account[]>('/accounts').then(setParents).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/accounts', {
        code,
        name,
        type,
        subType: subType || undefined,
        parentId: parentId || undefined,
        description: description || undefined,
      });
      router.push('/dashboard/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Account</h1>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-300">Code *</label>
          <input
            id="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 1.01.001"
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name *</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cash and Banks"
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-300">Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="parent" className="block text-sm font-medium text-slate-300">Parent Account</label>
          <select
            id="parent"
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="">— None (Top Level) —</option>
            {parents.filter(p => p.type === type).map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-cyan flex-1"
          >
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/accounts')}
            className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
