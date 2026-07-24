'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

/**
 * Google SVG icon component used in OAuth buttons.
 */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/**
 * Microsoft SVG icon component used in OAuth buttons.
 */
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  );
}

/**
 * Login-only auth component with title, OAuth buttons, and email/password form.
 * Registration has been removed — /api/setup/init handles root user creation.
 * Styled with neon cyan/blue glassmorphism theme.
 */
export default function AuthTabs() {
  const router = useRouter();
  const { login } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  /**
   * Handles login form submission via AuthContext.
   */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Title */}
      <h2 className="mb-6 text-center text-xl font-bold text-text-primary">
        Sign in to Open ERP
      </h2>

      {/* Glass card */}
      <div className="card p-8 shadow-md">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/google`}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-hover px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-surface-hover hover:border-primary/40"
          >
            <GoogleIcon />
            Continue with Google
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/microsoft`}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-hover px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-surface-hover hover:border-primary/40"
          >
            <MicrosoftIcon />
            Continue with Microsoft 365
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-muted">or continue with email</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {loginError && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-danger" role="alert">
              {loginError}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-white placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 mt-1"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2.5 text-sm text-white placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 mt-1"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loginSubmitting}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loginSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in&hellip;
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 rounded-lg border border-border bg-surface-hover p-3 text-center">
          <p className="text-xs font-medium text-primary mb-1">Demo Credentials</p>
          <p className="text-xs text-text-secondary">
            demo@openerp.com / <span className="font-mono text-text-secondary">Demo123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
