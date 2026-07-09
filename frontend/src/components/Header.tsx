'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Package } from 'lucide-react';

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** When true, shows landing page navigation links (Features, Pricing, About) */
  landing?: boolean;
}

/**
 * Application header with logo, optional landing nav links, auth buttons,
 * and a mobile hamburger menu. Styled with the neon cyan/blue dark theme.
 */
export default function Header({ landing = false }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-[#0a0a12]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a12]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Package className="h-6 w-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Open ERP
          </span>
        </Link>

        {/* Desktop nav links — only on landing pages */}
        {landing && (
          <nav className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
              >
                {link.label}
              </Link>
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
            className="btn-cyan px-4 py-2 text-sm"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-cyan-500/10 md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {landing &&
              navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-cyan-400"
                >
                  {link.label}
                </Link>
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
              className="block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white text-center hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
