'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Register page redirect — forwards to the combined auth page with the register tab selected.
 */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth?tab=register');
  }, [router]);

  return null;
}
