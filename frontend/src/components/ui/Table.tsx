'use client';

import { ReactNode } from 'react';

/**
 * Column definition for the Table component.
 */
export interface TableColumn<T> {
  /** Column header text */
  header: string;
  /** Accessor key or render function */
  accessor: keyof T | ((row: T) => ReactNode);
  /** Optional CSS class for the column */
  className?: string;
  /** Whether the column is sortable */
  sortable?: boolean;
}

/**
 * Props for the Table component.
 */
export interface TableProps<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Data rows */
  data: T[];
  /** Unique key accessor */
  keyExtractor: (row: T) => string | number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional wrapper class */
  className?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
}

/**
 * Clean corporate table with gray header, hover rows, and consistent spacing.
 * Inspired by Vercel and Stripe table styles.
 */
export default function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg
            className="h-6 w-6 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-surface-card">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-surface-card' : 'hover:bg-surface-card'
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={`whitespace-nowrap px-4 py-3 text-sm text-text-primary ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}