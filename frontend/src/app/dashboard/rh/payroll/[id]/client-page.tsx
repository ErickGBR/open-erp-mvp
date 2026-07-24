'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ClipboardList, ArrowLeft, Calculator, CheckCircle, Send, CreditCard, Download } from 'lucide-react';
import { PAYROLL_STATUS, formatCurrency, formatDate, unwrapList } from '@/lib/rh-utils';

/**
 * Payroll period detail from the API.
 */
interface PayrollPeriodDetail {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
  grossPay: number | null;
  totalDeductions: number | null;
  netPay: number | null;
  employeeCount: number | null;
}

/**
 * Employee payroll details.
 */
interface PayrollEntry {
  id: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string; code: string } | null;
  baseSalary: number | null;
  regularHours: number | null;
  overtimeHours: number | null;
  overtimePay: number | null;
  bonuses: number | null;
  grossPay: number | null;
  isss: number | null;
  afp: number | null;
  isr: number | null;
  loanDeduction: number | null;
  totalDeductions: number | null;
  netPay: number | null;
}

/**
 * Payroll period detail page.
 */
export default function ClientPage() {
  const params = useParams<{ id: string }>();
  const periodId = Number(params.id);

  const [period, setPeriod] = useState<PayrollPeriodDetail | null>(null);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [periodData, entriesData] = await Promise.all([
        api.get<PayrollPeriodDetail>(`/rh/payroll/periods/${periodId}`),
        api.get<PayrollEntry[] | { data: PayrollEntry[] }>(`/rh/payroll/periods/${periodId}/details`),
      ]);
      setPeriod(periodData);
      setEntries(unwrapList(entriesData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading payroll details');
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleAction = async (action: string, endpoint: string) => {
    setActionLoading(action);
    setError(null);
    try {
      await api.post(endpoint, {});
      await fetchDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error executing ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate totals
  const totals = entries.reduce(
    (acc, e) => ({
      baseSalary: acc.baseSalary + (e.baseSalary ?? 0),
      regularHours: acc.regularHours + (e.regularHours ?? 0),
      overtimeHours: acc.overtimeHours + (e.overtimeHours ?? 0),
      bonuses: acc.bonuses + (e.bonuses ?? 0),
      grossPay: acc.grossPay + (e.grossPay ?? 0),
      isss: acc.isss + (e.isss ?? 0),
      afp: acc.afp + (e.afp ?? 0),
      isr: acc.isr + (e.isr ?? 0),
      loanDeduction: acc.loanDeduction + (e.loanDeduction ?? 0),
      totalDeductions: acc.totalDeductions + (e.totalDeductions ?? 0),
      netPay: acc.netPay + (e.netPay ?? 0),
    }),
    {
      baseSalary: 0, regularHours: 0, overtimeHours: 0, bonuses: 0,
      grossPay: 0, isss: 0, afp: 0, isr: 0, loanDeduction: 0,
      totalDeductions: 0, netPay: 0,
    },
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-text-secondary">Loading payroll…</span>
      </div>
    );
  }

  if (error && !period) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-sm text-danger">{error}</p>
        <Link href="/dashboard/rh/payroll" className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark">
          &larr; Back to payroll
        </Link>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-lg font-semibold text-text-primary">Payroll not found</p>
        <p className="mt-1 text-sm text-text-secondary">This payroll period does not exist or was deleted.</p>
        <Link href="/dashboard/rh/payroll" className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-dark">
          &larr; Back to payroll
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/rh/payroll"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to payroll
      </Link>

      {/* Period Info Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{period.periodName}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {formatDate(period.startDate)} — {formatDate(period.endDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${PAYROLL_STATUS[period.status]?.badge || 'badge-inactive'}`}>
              {PAYROLL_STATUS[period.status]?.label || period.status}
            </span>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          <SummaryBox label="Employees" value={String(period.employeeCount ?? entries.length)} />
          <SummaryBox label="Gross Salary" value={formatCurrency(period.grossPay ?? totals.grossPay)} color="text-text-primary" />
          <SummaryBox label="Deductions" value={formatCurrency(period.totalDeductions ?? totals.totalDeductions)} color="text-danger" />
          <SummaryBox label="Net Pay" value={formatCurrency(period.netPay ?? totals.netPay)} color="text-success" />
        </div>

        {/* Action buttons based on status */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
          {period.status === 'draft' && (
            <ActionButton
              icon={<Calculator className="w-4 h-4" />}
              label="Calculate Payroll"
              loading={actionLoading === 'calculate'}
              onClick={() => handleAction('calculate', `/rh/payroll/periods/${periodId}/calculate`)}
            />
          )}
          {period.status === 'calculated' && (
            <ActionButton
              icon={<CheckCircle className="w-4 h-4" />}
              label="Approve Payroll"
              loading={actionLoading === 'approve'}
              onClick={() => handleAction('approve', `/rh/payroll/periods/${periodId}/approve`)}
            />
          )}
          {period.status === 'approved' && (
            <>
              <ActionButton
                icon={<CreditCard className="w-4 h-4" />}
                label="Mark as Paid"
                loading={actionLoading === 'pay'}
                onClick={() => handleAction('pay', `/rh/payroll/periods/${periodId}/pay`)}
              />
              <ActionButton
                icon={<Send className="w-4 h-4" />}
                label="Send Emails"
                loading={actionLoading === 'send-emails'}
                onClick={() => handleAction('send-emails', `/rh/payroll/periods/${periodId}/send-emails`)}
                variant="outline"
              />
            </>
          )}
          {(period.status === 'paid' || period.status === 'approved' || period.status === 'calculated') && (
            <button
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export (Soon)
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Employee Payroll Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="px-3 py-3 text-left font-medium text-text-secondary">Employee</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">Base Salary</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">Reg. Hrs</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">Overtime</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">Bonuses</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary text-primary">Gross</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">ISSS</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">AFP</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">ISR</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary">Loan</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary text-danger">Deductions</th>
              <th className="px-3 py-3 text-right font-medium text-text-secondary text-success">Net</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-12 text-center text-text-secondary">
                  No employees in this period
                  {period.status === 'draft' && (
                    <p className="mt-2 text-xs text-text-muted">
                      Use &quot;Calculate Payroll&quot; to generate the details
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-3 py-3 text-text-primary whitespace-nowrap">
                    {entry.employee
                      ? `${entry.employee.firstName} ${entry.employee.lastName}`
                      : `ID: ${entry.employeeId}`}
                  </td>
                  <td className="px-3 py-3 text-right text-text-primary font-mono">{formatCurrency(entry.baseSalary)}</td>
                  <td className="px-3 py-3 text-right text-text-secondary">{entry.regularHours?.toFixed(1) ?? '—'}</td>
                  <td className="px-3 py-3 text-right text-warning">{entry.overtimeHours?.toFixed(1) ?? '—'}</td>
                  <td className="px-3 py-3 text-right text-text-primary font-mono">{formatCurrency(entry.bonuses)}</td>
                  <td className="px-3 py-3 text-right text-primary font-mono font-semibold">{formatCurrency(entry.grossPay)}</td>
                  <td className="px-3 py-3 text-right text-danger/80 font-mono">{formatCurrency(entry.isss)}</td>
                  <td className="px-3 py-3 text-right text-danger/80 font-mono">{formatCurrency(entry.afp)}</td>
                  <td className="px-3 py-3 text-right text-danger/80 font-mono">{formatCurrency(entry.isr)}</td>
                  <td className="px-3 py-3 text-right text-danger/80 font-mono">{formatCurrency(entry.loanDeduction)}</td>
                  <td className="px-3 py-3 text-right text-danger font-mono font-semibold">{formatCurrency(entry.totalDeductions)}</td>
                  <td className="px-3 py-3 text-right text-success font-mono font-semibold">{formatCurrency(entry.netPay)}</td>
                </tr>
              ))
            )}

            {/* Totals row */}
            {entries.length > 0 && (
              <tr className="bg-surface-hover border-t-2 border-border">
                <td className="px-3 py-3 text-sm font-semibold text-primary">TOTALS</td>
                <td className="px-3 py-3 text-right text-text-primary font-mono font-semibold">{formatCurrency(totals.baseSalary)}</td>
                <td className="px-3 py-3 text-right text-text-secondary font-semibold">{totals.regularHours.toFixed(1)}</td>
                <td className="px-3 py-3 text-right text-warning font-semibold">{totals.overtimeHours.toFixed(1)}</td>
                <td className="px-3 py-3 text-right text-text-primary font-mono font-semibold">{formatCurrency(totals.bonuses)}</td>
                <td className="px-3 py-3 text-right text-primary font-mono font-bold">{formatCurrency(totals.grossPay)}</td>
                <td className="px-3 py-3 text-right text-danger/80 font-mono font-semibold">{formatCurrency(totals.isss)}</td>
                <td className="px-3 py-3 text-right text-danger/80 font-mono font-semibold">{formatCurrency(totals.afp)}</td>
                <td className="px-3 py-3 text-right text-danger/80 font-mono font-semibold">{formatCurrency(totals.isr)}</td>
                <td className="px-3 py-3 text-right text-danger/80 font-mono font-semibold">{formatCurrency(totals.loanDeduction)}</td>
                <td className="px-3 py-3 text-right text-danger font-mono font-bold">{formatCurrency(totals.totalDeductions)}</td>
                <td className="px-3 py-3 text-right text-success font-mono font-bold">{formatCurrency(totals.netPay)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Small summary box used in the period info header.
 */
function SummaryBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

/**
 * Action button for status transitions.
 */
function ActionButton({
  icon,
  label,
  loading,
  onClick,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  loading: boolean;
  onClick: () => void;
  variant?: 'solid' | 'outline';
}) {
  const base = 'rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2';

  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${base} border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover`}
      >
        {loading ? <Spinner /> : icon}
        {loading ? 'Processing…' : label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm hover:shadow-lg `}
    >
      {loading ? <Spinner /> : icon}
      {loading ? 'Processing…' : label}
    </button>
  );
}

function Spinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}
