'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Client-side providers wrapper. Must be imported by the root server layout.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
