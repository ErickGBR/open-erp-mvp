'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Package, ChevronDown } from 'lucide-react';

/**
 * A navigation item for the header dropdown menus.
 */
interface NavItem {
  /** Display label for the menu item */
  label: string;
  /** Optional direct href (not used for items with children) */
  href?: string;
  /** Sub-menu items shown inside the dropdown panel */
  children?: { label: string; href: string }[];
}

/**
 * Navigation items with dropdown children.
 */
const navItems: NavItem[] = [
  {
    label: 'Products',
    children: [
      { label: 'Dashboard', href: '/products' },
      { label: 'Inventory', href: '/products#inventory' },
      { label: 'Sales', href: '/products#sales' },
      { label: 'Reports', href: '/products#reports' },
    ],
  },
  {
    label: 'Customers',
    children: [
      { label: 'All Customers', href: '/customers' },
      { label: 'Analytics', href: '/customers#analytics' },
      { label: 'Support', href: '/customers#support' },
    ],
  },
  {
    label: 'Sales',
    children: [
      { label: 'New Sale', href: '/sales' },
      { label: 'Invoices', href: '/sales#invoices' },
      { label: 'Payments', href: '/sales#payments' },
    ],
  },
  {
    label: 'About',
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/about#contact' },
    ],
  },
];

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** When true, shows the dropdown navigation links (Products, Customers, Sales, About) */
  landing?: boolean;
}

/**
 * Application header with logo, hover dropdown navigation, auth buttons,
 * and a mobile hamburger menu with accordion submenus.
 * Styled with the neon cyan/blue dark theme and glassmorphism panels.
 */
export default function Header({ landing = false }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-[#0a0a12]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a12]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Package className="h-6 w-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Open ERP
          </span>
        </Link>

        {/* Desktop navigation with dropdowns — only on landing pages */}
        {landing && (
          <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg transition-colors hover:text-cyan-400 hover:bg-white/5"
                  aria-expanded={openDropdown === item.label}
                  aria-haspopup="true"
                >
                  {item.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel with glassmorphism */}
                {openDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-cyan-500/10 bg-[#12121e]/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/5 py-2 animate-[fadeIn_0.15s_ease-out]"
                    role="menu"
                  >
                    {item.children?.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-cyan-400 hover:bg-cyan-500/5"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth?tab=login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white hover:bg-white/5"
          >
            Log In
          </Link>
          <Link
            href="/auth?tab=register"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu with accordion submenus */}
      {mobileOpen && (
        <div className="border-t border-cyan-500/10 md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {landing &&
              navItems.map((item) => (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === item.label ? null : item.label,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-cyan-400"
                    aria-expanded={mobileExpanded === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileExpanded === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="ml-4 space-y-1 pb-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-cyan-400"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            <hr className="my-2 border-cyan-500/10" />
            <Link
              href="/auth?tab=login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/auth?tab=register"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
