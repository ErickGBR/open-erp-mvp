'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Package,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  User,
  Lock,
  Mail,
  Globe,
} from 'lucide-react';

/** Shape returned by GET /api/setup/status. */
interface SetupStatus {
  setupComplete: boolean;
  hasRootUser: boolean;
}

/** Shape returned by POST /api/setup/init. */
interface SetupResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

/** Validation errors per field. */
type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

/**
 * Steps in the wizard flow.
 */
const STEPS = ['Welcome', 'Admin Account', 'Organization', 'Confirm'];

/**
 * Setup Wizard — first-run experience for creating the root user and
 * initializing the ERP instance.
 *
 * Standalone page: NO header/footer. 4-step wizard with glass card centered.
 * On completion it stores the token and redirects to /dashboard.
 */
export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 2 — Admin account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3 — Organization
  const [orgName, setOrgName] = useState('');
  const [usageMode, setUsageMode] = useState('internal');

  // Validation
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // ── Check setup status on mount ──────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const status = await api.get<SetupStatus>('/setup/status');
        if (status.setupComplete) {
          router.replace('/auth');
          return;
        }
      } catch {
        // API unavailable — keep showing wizard
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [router]);

  // ── Validation helpers ───────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Navigation ───────────────────────────────────────────────────
  const canGoNext = (): boolean => {
    if (step === 1) return validateStep2();
    return true;
  };

  const nextStep = () => {
    if (canGoNext()) {
      setError('');
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  // ── Submission ───────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await api.post<SetupResponse>('/setup/init', {
        name: name.trim(),
        email: email.trim(),
        password,
        orgName: orgName.trim() || undefined,
        usageMode,
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-12">
      {/* Background orbs */}
      <div className="orb-primary -left-40 -top-40 h-96 w-96 animate-pulse" />
      <div className="orb-blue -bottom-40 -right-40 h-80 w-80 animate-pulse" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo + title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg ">
            <Package className="h-7 w-7 text-text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Open ERP Setup</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Let&apos;s get your ERP instance ready in minutes
          </p>
        </div>

        {/* Progress steps */}
        {step > 0 && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    i < step
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-text-primary'
                      : i === step
                        ? 'border border-primary text-primary'
                        : 'border border-slate-600 text-text-muted'
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-8 transition-colors ${
                      i < step ? 'bg-primary' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Glass card */}
        <div className="card p-8 shadow-md">
          {/* ── Step 0: Welcome ──────────────────────────────────── */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-text-primary">
                Welcome to Open ERP!
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-text-secondary">
                You&apos;re just a few steps away from running your own
                ERP instance. We&apos;ll help you set up the admin account
                and configure your organization.
              </p>
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary inline-flex items-center gap-2"
              >
                Start Setup
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Step 1: Admin Account ────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-text-primary">
                Create Admin Account
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                This will be the root user with full system access.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="setup-name"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="setup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-danger">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="setup-email"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="setup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="admin@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="setup-password"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="setup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="setup-confirm-password"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="setup-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-danger">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Step 2: Organization ─────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-text-primary">
                Organization
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                Tell us about your organization (optional).
              </p>

              <div className="space-y-5">
                {/* Organization Name */}
                <div>
                  <label
                    htmlFor="setup-org"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Organization Name
                    <span className="ml-1 text-text-muted">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="setup-org"
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                {/* Usage Mode */}
                <div>
                  <label
                    htmlFor="setup-usage"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Usage Mode
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <select
                      id="setup-usage"
                      value={usageMode}
                      onChange={(e) => setUsageMode(e.target.value)}
                      className="w-full appearance-none bg-surface-card border border-border rounded-lg px-4 py-2.5 pl-10 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                    >
                      <option value="internal">Internal Use</option>
                      <option value="multi-tenant">Multi-Tenant</option>
                      <option value="demo">Demo / Evaluation</option>
                    </select>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirmation ─────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-text-primary">
                Confirm Setup
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                Review your configuration before finishing.
              </p>

              {error && (
                <div
                  className="mb-5 rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="mb-6 space-y-3 rounded-lg border border-border bg-surface-card p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Admin
                  </p>
                  <p className="mt-0.5 text-sm text-text-primary">{name}</p>
                  <p className="text-sm text-text-secondary">{email}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Organization
                  </p>
                  <p className="mt-0.5 text-sm text-text-primary">
                    {orgName.trim() || 'Not specified'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Mode: {usageMode === 'internal' ? 'Internal Use' : usageMode === 'multi-tenant' ? 'Multi-Tenant' : 'Demo / Evaluation'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-outline inline-flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Setting up&hellip;
                    </span>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
