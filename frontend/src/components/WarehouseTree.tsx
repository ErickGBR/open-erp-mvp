'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChevronRight, ChevronDown, Warehouse, MapPin } from 'lucide-react';

interface LocationNode {
  id: number;
  name: string;
  code: string;
}

interface WarehouseNode {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  locations: LocationNode[];
}

function LocationRow({ location }: { location: LocationNode }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors ml-6">
      <span className="w-4 shrink-0" />
      <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
      <span className="text-sm text-text-primary">{location.name}</span>
      <span className="text-xs font-mono text-text-muted ml-1">{location.code}</span>
    </div>
  );
}

function WarehouseNode({ node }: { node: WarehouseNode }) {
  const [expanded, setExpanded] = useState(false);
  const hasLocations = node.locations && node.locations.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-3 px-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        onClick={() => hasLocations && setExpanded(!expanded)}
      >
        {hasLocations ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Warehouse className="w-5 h-5 text-primary shrink-0" />
        <span className="text-sm font-semibold text-text-primary">{node.name}</span>
        {(node.country || node.city) && (
          <span className="badge-neutral text-xs flex items-center gap-1 ml-2">
            <MapPin className="w-3 h-3" />
            {[node.city, node.country].filter(Boolean).join(', ')}
          </span>
        )}
        {hasLocations && (
          <span className="text-xs text-text-muted ml-auto">{node.locations.length} location{node.locations.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      {expanded && hasLocations && (
        <div className="ml-4 border-l border-border ml-6 pl-2">
          {node.locations.map((loc) => (
            <LocationRow key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WarehouseTree() {
  const [tree, setTree] = useState<WarehouseNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<WarehouseNode[]>('/warehouses/tree');
        if (!cancelled) setTree(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load warehouses');
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
        <Warehouse className="w-12 h-12 mx-auto mb-3 text-text-muted" />
        <p className="text-text-secondary">No warehouses found</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-1">
      {tree.map((node) => (
        <WarehouseNode key={node.id} node={node} />
      ))}
    </div>
  );
}
