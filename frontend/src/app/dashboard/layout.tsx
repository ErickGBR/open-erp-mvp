import { ReactNode } from 'react';
import DashboardClientLayout from './dashboard-client-layout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
