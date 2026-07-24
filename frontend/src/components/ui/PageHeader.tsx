'use client';

import { ReactNode } from 'react';

/**
 * Breadcrumb item for PageHeader.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Props for the PageHeader component.
 */
export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons or elements rendered on the right */
  actions?: ReactNode;
  /** Additional wrapper class */
  className?: string;
}

/**
 * Page header with title, breadcrumbs, subtitle, and action buttons.
 * Corporate style — clean hierarchy, generous spacing.
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {crumb.href && !isLast ? (
                  <a href={crumb.href} className="hover:text-text-primary transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className={isLast ? 'text-text-primary font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}