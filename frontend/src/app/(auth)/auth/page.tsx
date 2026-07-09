'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthTabs from '@/components/AuthTabs';
import Footer from '@/components/Footer';

/**
 * Loading fallback for the auth page while search params resolve.
 */
function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
    </div>
  );
}

/**
 * Auth page content that reads search params for tab selection and OAuth token.
 * Wrapped in Suspense because it uses useSearchParams.
 */
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a12]">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <AuthTabs />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Combined authentication page with login/register tabs and OAuth token handling.
 * Tab selection is driven by the `?tab=login` or `?tab=register` URL search param.
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
