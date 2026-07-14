'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { confirmDelete } from '@/lib/confirm';
import { Banknote, Plus, X, Eye, DollarSign } from 'lucide-react';
import { LOAN_STATUS, LOAN_TYPE, formatCurrency, formatDate, unwrapList } from '@/lib/rh-utils';

/**
 * Loan record from the API.
 */
interface LoanRecord {
  id: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string; code: string } | null;
  type: string;
  totalAmount: number;
  remainingAmount: number;
  installmentAmount: number;
  status: string;
  startDate: string;
  reason: string | null;
}

/**
 * Loan payment record.
 */
interface LoanPayment {
  id: number;
  amount: number;
  paymentDate: string;
  notes: string | null;
}

interface EmployeeOption {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
}

interface LoanForm {
  employeeId: string;
  type: string;
  totalAmount: string;
  installmentAmount: string;
  startDate: string;
  reason: string;
}

const LOAN_TYPES = [
  { value: 'loan', label: 'Loan' },
  { value: 'advance', label: 'Advance' },
];

const INITIAL_FORM: LoanForm = {
  employeeId: '',
  type: 'loan',
  totalAmount: '',
  installmentAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  reason: '',
};

/**
 * Loans & Advances page.
 */
export default function LoansPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LoanForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Payments modal
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [paymentsLoanId, setPaymentsLoanId] = useState<number | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Record payment modal
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentLoanId, setPaymentLoanId] = useState<number | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<LoanRecord[] | { data: LoanRecord[] }>('/rh/loans');
      setLoans(unwrapList(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading loans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  useEffect(() => {
    api.get<EmployeeOption[] | { data: EmployeeOption[] }>('/rh/employees?status=active')
      .then((result) => setEmployees(unwrapList(result)))
      .catch(() => {});
  }, []);

  const openNew = () => {
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.employeeId || !form.totalAmount || !form.installmentAmount || !form.startDate) return;
    setSaving(true);
    try {
      await api.post('/rh/loans', {
        employeeId: Number(form.employeeId),
        type: form.type,
        totalAmount: Number(form.totalAmount),
        installmentAmount: Number(form.installmentAmount),
        startDate: form.startDate,
        reason: form.reason.trim() || undefined,
      });
      setShowModal(false);
      await fetchLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating loan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await api.delete(`/rh/loans/${id}`);
      await fetchLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting loan');
    } finally {
      setDeletingId(null);
    }
  };

  const viewPayments = async (loanId: number) => {
    setPaymentsLoanId(loanId);
    setPaymentsLoading(true);
    try {
      const result = await api.get<LoanPayment[] | { data: LoanPayment[] }>(`/rh/loans/${loanId}/payments`);
      setPayments(unwrapList(result));
      setShowPayments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const openPaymentForm = (loanId: number) => {
    setPaymentLoanId(loanId);
    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentForm(true);
  };

  const recordPayment = async () => {
    if (!paymentLoanId || !paymentAmount || Number(paymentAmount) <= 0) return;
    setPaymentSaving(true);
    try {
      await api.post(`/rh/loans/${paymentLoanId}/payments`, {
        amount: Number(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        notes: paymentNotes.trim() || undefined,
      });
      setShowPaymentForm(false);
      setShowPayments(false); // Close payments modal to refresh
      await fetchLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording payment');
    } finally {
      setPaymentSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-cyan-500/15 bg-[#1a1a2e] px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Loans and Advances</h1>
        <button onClick={openNew} className="btn-cyan text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Loan
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : loans.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Banknote className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No loans found</p>
          <button onClick={openNew} className="text-cyan-400 hover:text-cyan-300 text-sm mt-2">
            Create loan
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Type</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Total</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Balance</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Installment</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">
                    {loan.employee
                      ? `${loan.employee.firstName} ${loan.employee.lastName}`
                      : `ID: ${loan.employeeId}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${loan.type === 'advance' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      {LOAN_TYPE[loan.type] || loan.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">{formatCurrency(loan.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-amber-400 font-mono">{formatCurrency(loan.remainingAmount)}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">{formatCurrency(loan.installmentAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${LOAN_STATUS[loan.status]?.badge || 'badge-inactive'}`}>
                      {LOAN_STATUS[loan.status]?.label || loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewPayments(loan.id)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                        title="View payments"
                      >
                        <Eye className="w-3 h-3" /> Payments
                      </button>
                      {loan.status === 'active' && (
                        <button
                          onClick={() => openPaymentForm(loan.id)}
                          className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                          title="Record payment"
                        >
                          <DollarSign className="w-3 h-3" /> Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(loan.id, `${loan.employee?.firstName ?? ''} ${loan.employee?.lastName ?? ''} - ${formatCurrency(loan.totalAmount)}`)}
                        disabled={deletingId === loan.id}
                        className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                      >
                        {deletingId === loan.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Loan / Advance</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Employee *</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputClass}
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Total Amount *</label>
                  <input
                    type="number" step="0.01" min="0" value={form.totalAmount}
                    onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Installment *</label>
                  <input
                    type="number" step="0.01" min="0" value={form.installmentAmount}
                    onChange={(e) => setForm({ ...form, installmentAmount: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Start Date *</label>
                <input
                  type="date" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Reason</label>
                <textarea
                  rows={2} value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={saving || !form.employeeId || !form.totalAmount || !form.installmentAmount || !form.startDate}
                className="btn-cyan flex-1 text-sm"
              >
                {saving ? 'Saving…' : 'Create'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPayments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Payment History {paymentsLoanId ? `#${paymentsLoanId}` : ''}
              </h2>
              <button onClick={() => setShowPayments(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No payments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-500/10">
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Date</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-400">Amount</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-cyan-500/5">
                        <td className="px-3 py-2 text-slate-300">{formatDate(p.paymentDate)}</td>
                        <td className="px-3 py-2 text-right text-white font-mono">{formatCurrency(p.amount)}</td>
                        <td className="px-3 py-2 text-slate-400">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowPayments(false)}
                className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Record Payment</h2>
              <button onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Amount *</label>
                <input
                  type="number" step="0.01" min="0" value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Notes</label>
                <textarea
                  rows={2} value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={recordPayment}
                disabled={paymentSaving || !paymentAmount || Number(paymentAmount) <= 0}
                className="btn-cyan flex-1 text-sm"
              >
                {paymentSaving ? 'Saving…' : 'Record Payment'}
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="rounded-lg border border-cyan-500/20 px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
