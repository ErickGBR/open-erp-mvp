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
      <h1 className="text-2xl font-bold text-text-primary mb-6">New Account</h1>

      {error && (
        <div className="rounded-lg bg-danger-light border border-danger/30 p-3 text-sm text-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-text-secondary">Code *</label>
          <input
            id="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 1.01.001"
            className="mt-1 w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Name *</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cash and Banks"
            className="mt-1 w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="parent" className="block text-sm font-medium text-text-secondary">Parent Account</label>
          <select
            id="parent"
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">— None (Top Level) —</option>
            {parents.filter(p => p.type === type).map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/accounts')}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
