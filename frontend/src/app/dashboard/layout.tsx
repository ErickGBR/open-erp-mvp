import { ReactNode } from 'react';
import DashboardClientLayout from './dashboard-client-layout';

/**
 * Dashboard layout wrapper.
 * 
 * For static export builds, renders a simple pass-through layout
 * to avoid client-component conflicts with generateStaticParams
 * in child pages.
 */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  if (isStaticExport) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    );
  }
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
