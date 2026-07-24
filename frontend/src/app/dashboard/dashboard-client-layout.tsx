'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';

/**
 * Dashboard layout with collapsible sidebar, top header bar, and main content area.
 * Redirects to /auth?tab=login if the user is not authenticated (HR-13 auth guard).
 * Vercel-inspired dark theme — dark background, indigo accents, premium effects.
 */
export default function DashboardClientLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // HR-13: Auth guard — redirect if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth?tab=login');
    }
  }, [user, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-base">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Prevent flash of content before redirect
  if (!user) {
    return null;
  }

  /**
   * Derives a page title from the current pathname for the header.
   */
  const getPageTitle = (): string | undefined => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) return undefined; // Dashboard root — no title
    const last = segments[segments.length - 1];
    if (last === 'new') return 'Add New';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-brand-base relative">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        pathname={pathname}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          userName={user.name}
          onLogout={logout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-brand-base p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
