'use client';

import { ReactNode } from 'react';

/**
 * Badge variant options.
 */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Props for the Badge component.
 */
export interface BadgeProps {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional dot indicator */
  dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  neutral: 'bg-neutral-light text-neutral',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-neutral',
};

/**
 * Badge component for status labels, tags, and indicators.
 * Clean corporate style with soft background colors.
 */
export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
        text-xs font-semibold
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}