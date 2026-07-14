'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, User, Settings, LogOut } from 'lucide-react';
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
 * Dashboard top header bar with hamburger menu, optional page title,
 * and a user avatar dropdown containing Profile, Settings, and Logout.
 * Styled with the neon cyan/blue dark theme.
 */
export default function DashboardHeader({
  onMenuClick,
  title,
  userName,
  onLogout,
}: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { t } = useLanguage();
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center border-b border-cyan-500/10 bg-[#0a0a12] px-4 lg:px-8">
      {/* Left: hamburger menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-cyan-400"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center: page title */}
      {title && (
        <h1 className="ml-4 text-lg font-semibold text-[#e2e8f0]">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: user avatar + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          aria-label="User menu"
          aria-expanded={dropdownOpen}
        >
          {initial}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-cyan-500/20 bg-[#12121e] py-1 shadow-xl backdrop-blur-xl">
            <div className="border-b border-cyan-500/10 px-4 py-2">
              <p className="text-sm font-medium text-[#e2e8f0]">{userName}</p>
            </div>

            <Link
              href="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-400"
            >
              <User className="h-4 w-4" />
              {t('dashboardHeader.profile')}
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-400"
            >
              <Settings className="h-4 w-4" />
              {t('dashboardHeader.settings')}
            </Link>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              {t('dashboardHeader.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
