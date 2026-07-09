'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * Tab configuration for the auth tabs component.
 */
interface TabConfig {
  id: 'login' | 'register';
  label: string;
  icon: typeof LogIn;
}

const TABS: TabConfig[] = [
  { id: 'login', label: 'Sign In', icon: LogIn },
  { id: 'register', label: 'Sign Up', icon: UserPlus },
];

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
 * Combined login/register component with pill-style tabs, OAuth buttons,
 * and email/password forms. Tab selection is driven by the `?tab=` URL search param.
 * Styled with neon cyan/blue glassmorphism theme.
 */
export default function AuthTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  /**
   * Switches the active tab by updating the URL search param.
   */
  const switchTab = (tab: 'login' | 'register') => {
    router.push(`/auth?tab=${tab}`);
  };

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

  /**
   * Handles register form submission via AuthContext.
   */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSubmitting(true);
    try {
      await register(registerName, registerEmail, registerPassword);
      router.push('/dashboard');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Pill-style Tabs */}
      <div className="flex justify-center gap-2 mb-6" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => switchTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Glass card */}
      <div className="glass-card rounded-xl p-8 glow-cyan-sm">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <a
            href="http://localhost:3001/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-cyan-500/10 hover:border-cyan-500/40"
          >
            <GoogleIcon />
            Continue with Google
          </a>
          <button
            type="button"
            onClick={() => {
              Swal.fire({
                icon: 'info',
                title: 'Coming Soon',
                text: 'Microsoft 365 login will be available soon. Stay tuned!',
                confirmButtonColor: '#22d3ee',
                background: '#12121e',
                color: '#e2e8f0',
                iconColor: '#22d3ee',
              });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-cyan-500/10 hover:border-cyan-500/40"
          >
            <MicrosoftIcon />
            Continue with Microsoft 365
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-cyan-500/20" />
          <span className="text-xs text-slate-500">or continue with email</span>
          <div className="flex-1 border-t border-cyan-500/20" />
        </div>

        {/* Tab panels */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5" role="tabpanel">
            {loginError && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300" role="alert">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 mt-1"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 mt-1"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="btn-cyan w-full flex items-center justify-center"
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
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5" role="tabpanel">
            {registerError && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300" role="alert">
                {registerError}
              </div>
            )}

            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-slate-300">
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 mt-1"
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="auth-reg-email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="auth-reg-email"
                type="email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 mt-1"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="auth-reg-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="auth-reg-password"
                type="password"
                required
                minLength={6}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-cyan-500/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 mt-1"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={registerSubmitting}
              className="btn-cyan w-full flex items-center justify-center"
            >
              {registerSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account&hellip;
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
