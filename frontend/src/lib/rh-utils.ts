/**
 * Shared utilities for RH (Human Resources) pages.
 * Consolidates formatting functions, status mappings, and API response helpers
 * to eliminate duplication across employees, payroll, leaves, loans, bonuses, and attendance.
 */

// ──────────────────────────────────────────────
// API Response Helpers
// ──────────────────────────────────────────────

/**
 * Paginated response from the backend.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Unwraps an API response that may be either a flat array or a paginated
 * `{ data: T[], ... }` object. Handles backward compatibility.
 */
export function unwrapList<T>(response: T[] | PaginatedResponse<T> | unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && 'data' in response) {
    const paginated = response as PaginatedResponse<T>;
    return Array.isArray(paginated.data) ? paginated.data : [];
  }
  return [];
}

// ──────────────────────────────────────────────
// Formatting Helpers
// ──────────────────────────────────────────────

/**
 * Format a number as USD currency using El Salvador locale.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Format an ISO date string to a locale date string (es-SV).
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV');
}

/**
 * Format an ISO date string to a short locale date string (es-SV).
 */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ──────────────────────────────────────────────
// Status Mappings — label + badge class
// ──────────────────────────────────────────────

export const EMPLOYEE_STATUS: Record<string, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'badge-active' },
  inactive: { label: 'Inactive', badge: 'badge-inactive' },
  suspended: { label: 'Suspended', badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' },
};

export const PAYROLL_STATUS: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Draft', badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20' },
  calculated: { label: 'Calculated', badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
  approved: { label: 'Approved', badge: 'badge-active' },
  paid: { label: 'Paid', badge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' },
};

export const LEAVE_STATUS: Record<string, { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' },
  approved: { label: 'Approved', badge: 'badge-active' },
  rejected: { label: 'Rejected', badge: 'badge-cancelled' },
};

export const LOAN_STATUS: Record<string, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' },
  completed: { label: 'Paid', badge: 'badge-active' },
  defaulted: { label: 'Defaulted', badge: 'badge-cancelled' },
};

// ──────────────────────────────────────────────
// Type Label Mappings
// ──────────────────────────────────────────────

export const LEAVE_TYPE: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal Leave',
  maternity: 'Maternity',
  paternity: 'Paternity',
  bereavement: 'Bereavement',
  other: 'Other',
};

export const BONUS_TYPE: Record<string, string> = {
  productivity: 'Productivity',
  performance: 'Performance',
  commission: 'Commission',
  attendance: 'Attendance',
  holiday: 'Holiday Bonus',
  other: 'Other',
};

export const LOAN_TYPE: Record<string, string> = {
  loan: 'Loan',
  advance: 'Advance',
};
