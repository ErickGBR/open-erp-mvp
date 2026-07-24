'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Footer component for the landing page — Vercel-inspired dark theme.
 */
export default function Footer() {
  const { t } = useLanguage();
  const linkSections = [
    {
      title: t('header.nav.products'),
      links: [
        { label: t('header.subProducts.0'), href: '/products' },
        { label: t('header.subProducts.1'), href: '/products#inventory' },
        { label: t('header.subProducts.2'), href: '/products#sales' },
        { label: t('header.subProducts.3'), href: '/products#reports' },
      ],
    },
    {
      title: t('header.nav.customers'),
      links: [
        { label: t('header.subCustomers.0'), href: '/customers' },
        { label: t('header.subCustomers.1'), href: '/customers#analytics' },
        { label: t('header.subCustomers.2'), href: '/customers#support' },
      ],
    },
    {
      title: t('header.nav.sales'),
      links: [
        { label: t('header.subSales.0'), href: '/sales' },
        { label: t('header.subSales.1'), href: '/sales#invoices' },
        { label: t('header.subSales.2'), href: '/sales#payments' },
      ],
    },
    {
      title: t('header.nav.about'),
      links: [
        { label: t('header.subAbout.0'), href: '/about' },
        { label: t('header.subAbout.1'), href: '/blog' },
        { label: t('header.subAbout.2'), href: '/about#contact' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo + description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Open ERP
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              {t('footer.description')}
            </p>
          </div>

          {/* Link sections */}
          {linkSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text-secondary">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-xs text-text-muted uppercase tracking-widest mb-4">
            {t('footer.builtWith')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Docker', color: 'from-blue-400 to-blue-600' },
              { name: 'NestJS', color: 'from-red-400 to-red-600' },
              { name: 'Next.js', color: 'from-white to-gray-300' },
              { name: 'React', color: 'from-primary to-primary-light' },
              { name: 'Tailwind', color: 'from-teal-400 to-cyan-500' },
              { name: 'DeepSeek', color: 'from-yellow-400 to-orange-500' },
              { name: 'VS Code', color: 'from-blue-400 to-indigo-500' },
              { name: 'PostgreSQL', color: 'from-blue-500 to-indigo-600' },
              { name: 'TypeScript', color: 'from-blue-400 to-blue-600' },
              { name: 'TypeORM', color: 'from-orange-400 to-red-500' },
            ].map((tech) => (
              <span
                key={tech.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  bg-surface-hover border border-border text-text-muted
                  hover:bg-primary-glow hover:border-primary/20 hover:text-text-primary transition-all duration-300"
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${tech.color}`} />
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
            <p className="text-center text-sm text-text-muted">
              &copy; 2026 Open ERP. {t('footer.builtWith')}{' '}
              <span className="text-primary mx-1">❤</span>{' '}
              by{' '}
              <a 
                href="https://github.com/ErickGBR" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-text-secondary hover:text-primary transition-colors"
              >
                Erick Burgos
              </a>
              {' '}|{' '}
              <a 
                href="https://github.com/ErickGBR/run-mvp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary transition-colors"
              >
                {t('footer.sourceCode')}
              </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
