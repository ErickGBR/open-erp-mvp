'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Package, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
 * Build navigation items dynamically from translation keys.
 */
function useNavItems(): NavItem[] {
  const { t } = useLanguage();
  return [
    {
      label: t('header.nav.products'),
      children: [
        { label: t('header.subProducts.0'), href: '/products' },
        { label: t('header.subProducts.1'), href: '/products#inventory' },
        { label: t('header.subProducts.2'), href: '/products#sales' },
        { label: t('header.subProducts.3'), href: '/products#reports' },
      ],
    },
    {
      label: t('header.nav.customers'),
      children: [
        { label: t('header.subCustomers.0'), href: '/customers' },
        { label: t('header.subCustomers.1'), href: '/customers#analytics' },
        { label: t('header.subCustomers.2'), href: '/customers#support' },
      ],
    },
    {
      label: t('header.nav.sales'),
      children: [
        { label: t('header.subSales.0'), href: '/sales' },
        { label: t('header.subSales.1'), href: '/sales#invoices' },
        { label: t('header.subSales.2'), href: '/sales#payments' },
      ],
    },
    {
      label: t('header.nav.about'),
      children: [
        { label: t('header.subAbout.0'), href: '/about' },
        { label: t('header.subAbout.1'), href: '/blog' },
        { label: t('header.subAbout.2'), href: '/about#contact' },
      ],
    },
  ];
}

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
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navItems = useNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Package className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
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
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary rounded-lg transition-colors hover:text-primary hover:bg-surface-hover"
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
                    className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-border bg-surface-card/95 backdrop-blur-xl shadow-2xl shadow-primary/5 py-2 animate-[fadeIn_0.15s_ease-out]"
                    role="menu"
                  >
                    {item.children?.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-text-secondary transition-colors hover:text-primary hover:bg-surface-hover"
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

        {/* Desktop auth buttons — always visible */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth?tab=login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-white hover:bg-surface-hover"
          >
            {t('header.login')}
          </Link>
          <Link
            href="/auth"
            className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg "
          >
            {t('header.signIn')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-surface-hover md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu with accordion submenus */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
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
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-primary"
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
                          className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            <hr className="my-2 border-border" />
            <Link
              href="/auth?tab=login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-white"
            >
              {t('header.login')}
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-gradient-to-r from-primary to-primary-dark px-3 py-2 text-sm font-semibold text-white text-center"
            >
              {t('header.signIn')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
