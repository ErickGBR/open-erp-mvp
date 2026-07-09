'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page redirect — forwards to the combined auth page with the login tab selected.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth?tab=login');
  }, [router]);

  return null;
}
