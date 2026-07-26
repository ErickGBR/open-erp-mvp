'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react';

interface AccountNode {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
  children: AccountNode[];
}

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'text-success',
  LIABILITY: 'text-warning',
  EQUITY: 'text-info',
  INCOME: 'text-primary-light',
  EXPENSE: 'text-danger',
};

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'Asset',
  LIABILITY: 'Liability',
  EQUITY: 'Equity',
  INCOME: 'Income',
  EXPENSE: 'Expense',
};

function TreeNode({ node, depth = 0 }: { node: AccountNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const colorClass = TYPE_COLORS[node.type] || 'text-text-secondary';

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer ${
          depth > 0 ? 'ml-6' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="font-mono text-xs text-text-secondary w-20 shrink-0">{node.code}</span>
        <span className="text-sm text-text-primary flex-1 truncate">{node.name}</span>
        <span className={`text-xs font-medium ${colorClass}`}>{TYPE_LABELS[node.type] || node.type}</span>
        <span className="text-sm font-mono text-text-primary w-24 text-right">
          ${Number(node.balance).toFixed(2)}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountTree() {
  const [tree, setTree] = useState<AccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<AccountNode[]>('/accounts/tree');
        if (!cancelled) setTree(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-danger-light border border-danger/30 p-3 text-sm text-danger" role="alert">
        {error}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-text-muted" />
        <p className="text-text-secondary">No accounts found</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4 px-2 py-2 text-xs font-medium text-text-muted border-b border-border mb-1">
        <span className="w-4 shrink-0" />
        <span className="w-20 shrink-0">Code</span>
        <span className="flex-1">Name</span>
        <span className="w-16">Type</span>
        <span className="w-24 text-right">Balance</span>
      </div>
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}
