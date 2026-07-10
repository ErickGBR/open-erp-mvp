'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  Settings,
  ShoppingCart,
  BookOpen,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

/**
 * A single navigation item that may have children (dropdown).
 */
interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}

/**
 * A child navigation item within a dropdown.
 */
interface NavChild {
  label: string;
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
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    label: 'Products',
    icon: Package,
    children: [
      { label: 'All Products', href: '/dashboard/products' },
      { label: 'Add Product', href: '/dashboard/products/new' },
    ],
  },
  {
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'All Customers', href: '/dashboard/customers' },
      { label: 'Add Customer', href: '/dashboard/customers/new' },
    ],
  },
  {
    label: 'Sales',
    icon: Receipt,
    children: [
      { label: 'All Sales', href: '/dashboard/sales' },
      { label: 'New Sale', href: '/dashboard/sales/new' },
      { label: 'Point of Sale', href: '/dashboard/pos' },
    ],
  },
  {
    label: 'Accounting',
    icon: BookOpen,
    children: [
      { label: 'Chart of Accounts', href: '/dashboard/accounts' },
    ],
  },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

/**
 * Sidebar navigation component with collapsible sections, dropdown submenus,
 * and active item highlighting based on the current pathname.
 * Styled with neon cyan/blue dark theme.
 */
export default function Sidebar({ open, onToggle: _onToggle, pathname }: SidebarProps) {
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  /**
   * Toggles the expanded state of a dropdown section.
   */
  const toggleExpand = (label: string) => {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
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
    return false;
  };

  /**
   * Checks if a child link matches the current pathname.
   */
  const isChildActive = (href: string): boolean => pathname === href;

  return (
    <aside
      className={`flex flex-col bg-[#0a0a12] border-r border-cyan-500/10 text-[#e2e8f0] transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-cyan-500/10 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span
            className={`bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-lg font-bold transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            Open ERP
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const expanded = expandedLabels.has(item.label);
          const hasChildren = !!item.children?.length;

          // Render a link item
          if (!hasChildren && item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
                }`}
                title={!open ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          // Render a dropdown item
          if (hasChildren && item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
                  }`}
                  title={!open ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`flex-1 text-left transition-opacity duration-300 ${
                      open ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}
                  >
                    {item.label}
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
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          isChildActive(child.href)
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
                        }`}
                      >
                        {child.label}
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
