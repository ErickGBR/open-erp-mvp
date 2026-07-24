'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Props for the DashboardHeader component.
 */
export interface DashboardHeaderProps {
  /** Callback to toggle the sidebar open/closed */
  onMenuClick: () => void;
  /** Optional page title displayed in the center */
  title?: string;
  /** Display name of the current user (used for avatar initial) */
  userName: string;
  /** Callback executed when the user clicks Logout */
  onLogout: () => void;
}

/**
 * Dashboard top header bar with search, notifications, company selector,
 * and user avatar dropdown.
 * Corporate Premium style — white background, clean, Stripe/Vercel inspired.
 */
export default function DashboardHeader({
  onMenuClick,
  title,
  userName,
  onLogout,
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();
  const initial = userName.charAt(0).toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="flex h-16 items-center border-b border-border bg-white px-4 lg:px-6">
      {/* Left: hamburger menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
        aria-label={t('dashboardHeader.toggleSidebar')}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="ml-3 text-base font-semibold text-text-primary">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* ── Search bar ─────────────────────────────────────── */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center rounded-lg border border-border bg-white px-3 py-1.5 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="mr-2 h-4 w-4 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                placeholder="Search..."
                className="w-48 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                aria-label="Search"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── Notifications ──────────────────────────────────── */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* ── Company selector ───────────────────────────────── */}
        <div className="relative" ref={companyDropdownRef}>
          <button
            type="button"
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
            aria-expanded={companyDropdownOpen}
            aria-label="Select company"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Empresa</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {companyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 origin-top-right animate-slide-down rounded-lg border border-border bg-white py-1 shadow-lg">
              <div className="border-b border-border px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Companies</p>
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-card"
                onClick={() => setCompanyDropdownOpen(false)}
              >
                <Building2 className="h-4 w-4 text-primary" />
                Mi Empresa
              </button>
            </div>
          )}
        </div>

        {/* ── User avatar + dropdown ─────────────────────────── */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-card"
            aria-label="User menu"
            aria-expanded={userDropdownOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="hidden text-sm font-medium text-text-primary md:inline">
              {userName}
            </span>
            <ChevronDown className={`hidden h-3.5 w-3.5 text-text-muted transition-transform duration-200 md:block ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right animate-slide-down rounded-lg border border-border bg-white py-1 shadow-lg">
              <div className="border-b border-border px-4 py-2">
                <p className="text-sm font-medium text-text-primary">{userName}</p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
              >
                <User className="h-4 w-4" />
                {t('dashboardHeader.profile')}
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
              >
                <Settings className="h-4 w-4" />
                {t('dashboardHeader.settings')}
              </Link>
              <div className="border-t border-border" />
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger-light"
              >
                <LogOut className="h-4 w-4" />
                {t('dashboardHeader.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}