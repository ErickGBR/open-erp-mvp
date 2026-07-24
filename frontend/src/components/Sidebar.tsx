'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  Settings,
  BookOpen,
  Warehouse,
  Building2,
  ChevronDown,
  Users2,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * A single navigation item with a translation key and optional children.
 */
interface NavItem {
  /** Dot-notation key into the sidebar messages */
  tKey: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}

/**
 * A child navigation item within a dropdown.
 */
interface NavChild {
  tKey: string;
  href: string;
}

/**
 * Props for the Sidebar component.
 */
export interface SidebarProps {
  /** Whether the sidebar is expanded (w-64) or collapsed (w-16) */
  open: boolean;
  /** Callback to toggle open/closed state */
  onToggle: () => void;
  /** Current pathname to highlight the active item */
  pathname: string;
}

const NAV_ITEMS: NavItem[] = [
  { tKey: 'sidebar.dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    tKey: 'sidebar.products',
    icon: Package,
    children: [
      { tKey: 'sidebar.productsAll', href: '/dashboard/products' },
      { tKey: 'sidebar.productsAdd', href: '/dashboard/products/new' },
    ],
  },
  {
    tKey: 'sidebar.customers',
    icon: Users,
    children: [
      { tKey: 'sidebar.customersAll', href: '/dashboard/customers' },
      { tKey: 'sidebar.customersAdd', href: '/dashboard/customers/new' },
    ],
  },
  {
    tKey: 'sidebar.sales',
    icon: Receipt,
    children: [
      { tKey: 'sidebar.salesAll', href: '/dashboard/sales' },
      { tKey: 'sidebar.salesNew', href: '/dashboard/sales/new' },
      { tKey: 'sidebar.pos', href: '/dashboard/pos' },
    ],
  },
  {
    tKey: 'sidebar.warehouses',
    icon: Warehouse,
    children: [
      { tKey: 'sidebar.warehousesAll', href: '/dashboard/warehouses' },
      { tKey: 'sidebar.warehousesAdd', href: '/dashboard/warehouses/new' },
    ],
  },
  {
    tKey: 'sidebar.accounts',
    icon: BookOpen,
    children: [
      { tKey: 'sidebar.chartOfAccounts', href: '/dashboard/accounts' },
    ],
  },
  {
    tKey: 'sidebar.rh.title',
    icon: Users2,
    children: [
      { tKey: 'sidebar.rh.dashboard', href: '/dashboard/rh' },
      { tKey: 'sidebar.rh.employees', href: '/dashboard/rh/employees' },
      { tKey: 'sidebar.rh.departments', href: '/dashboard/rh/departments' },
      { tKey: 'sidebar.rh.branches', href: '/dashboard/rh/branches' },
      { tKey: 'sidebar.rh.shifts', href: '/dashboard/rh/shifts' },
      { tKey: 'sidebar.rh.assignments', href: '/dashboard/rh/assignments' },
      { tKey: 'sidebar.rh.attendance', href: '/dashboard/rh/attendance' },
      { tKey: 'sidebar.rh.leaves', href: '/dashboard/rh/leaves' },
      { tKey: 'sidebar.rh.bonuses', href: '/dashboard/rh/bonuses' },
      { tKey: 'sidebar.rh.loans', href: '/dashboard/rh/loans' },
      { tKey: 'sidebar.rh.payroll', href: '/dashboard/rh/payroll' },
    ],
  },
  { tKey: 'sidebar.company', icon: Building2, href: '/dashboard/company' },
  { tKey: 'sidebar.settings', icon: Settings, href: '/dashboard/settings' },
];

/**
 * Sidebar navigation — Vercel-inspired dark theme.
 * Dark background, indigo accent, subtle border glow on active items.
 */
export default function Sidebar({ open, onToggle: _onToggle, pathname }: SidebarProps) {
  const { t } = useLanguage();
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(() => {
    // Auto-expand RH dropdown when on any RH page
    const initial = new Set<string>();
    if (pathname.startsWith('/dashboard/rh')) {
      initial.add('sidebar.rh.title');
    }
    return initial;
  });

  /**
   * Toggles the expanded state of a dropdown section.
   */
  const toggleExpand = (key: string) => {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  /**
   * Checks whether a nav item or its children match the current pathname.
   */
  const isActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    // Also active if any RH child path matches (for wildcard routes like [id])
    if (item.tKey === 'sidebar.rh.title' && pathname.startsWith('/dashboard/rh')) return true;
    return false;
  };

  /**
   * Checks if a child link matches the current pathname (prefix match for dynamic routes).
   */
  const isChildActive = (href: string): boolean => {
    // Exact match
    if (pathname === href) return true;
    // Wildcard: match /dashboard/rh/employees/123 against /dashboard/rh/employees
    if (href.endsWith('/employees') && pathname.startsWith('/dashboard/rh/employees/')) return true;
    if (href.endsWith('/payroll') && pathname.startsWith('/dashboard/rh/payroll/')) return true;
    return false;
  };

  return (
    <aside
      className={`flex flex-col bg-brand-surface border-r border-border text-text-primary transition-all duration-300 z-10 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span
            className={`text-white text-lg font-bold transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            Open ERP
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const expanded = expandedLabels.has(item.tKey);
          const hasChildren = !!item.children?.length;
          const translatedLabel = t(item.tKey);

          // Render a link item
          if (!hasChildren && item.href) {
            return (
              <Link
                key={item.tKey}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-glow text-primary border-l-[3px] border-primary ml-0 pl-[9px]'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary ml-0'
                }`}
                title={!open ? translatedLabel : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {translatedLabel}
                </span>
              </Link>
            );
          }

          // Render a dropdown item
          if (hasChildren && item.children) {
            return (
              <div key={item.tKey}>
                <button
                  onClick={() => toggleExpand(item.tKey)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary-glow text-primary border-l-[3px] border-primary ml-0 pl-[9px]'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary ml-0'
                  }`}
                  title={!open ? translatedLabel : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`flex-1 text-left transition-opacity duration-300 ${
                      open ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}
                  >
                    {translatedLabel}
                  </span>
                  {open && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Dropdown children */}
                {open && expanded && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.tKey}
                        href={child.href}
                        className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          isChildActive(child.href)
                            ? 'bg-primary-glow text-primary font-medium'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`}
                      >
                        {t(child.tKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
}
