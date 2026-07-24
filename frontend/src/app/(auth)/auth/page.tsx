'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthTabs from '@/components/AuthTabs';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

/** Shape returned by GET /api/setup/status. */
interface SetupStatus {
  setupComplete: boolean;
  hasRootUser: boolean;
}

/**
 * Loading fallback for the auth page while search params resolve.
 */
function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * Auth page content that reads search params for OAuth token and checks
 * setup status. Redirects to /setup if the ERP has not been initialized.
 */
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    // 1. Handle OAuth callback token
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.replace('/dashboard');
      return;
    }

    // 2. Check setup status — redirect to /setup if not initialized
    const checkSetup = async () => {
      try {
        const status = await api.get<SetupStatus>('/setup/status');
        if (!status.setupComplete) {
          router.replace('/setup');
          return;
        }
      } catch {
        // API unavailable — show login anyway (likely dev mode)
      } finally {
        setCheckingSetup(false);
      }
    };
    checkSetup();
  }, [searchParams, router]);

  // Show loader while checking setup
  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <AuthTabs />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Combined authentication page with login-only form and OAuth token handling.
 * Checks /api/setup/status on mount and redirects to /setup if the
 * ERP has not been initialized (no root user).
 * OAuth callback passes `?token=JWT` which is detected and stored automatically.
 * Wraps the content in Suspense because it uses useSearchParams.
 */
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}
