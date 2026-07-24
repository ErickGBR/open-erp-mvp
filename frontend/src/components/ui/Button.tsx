'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button variant options.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

/**
 * Button size options.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Optional icon to show before text */
  icon?: ReactNode;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-navy text-white hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-navy/30 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-primary text-white hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed',
  outline:
    'bg-transparent text-navy border border-border hover:bg-surface-card hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-navy/30 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-danger text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-danger/30 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-card hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

/**
 * Reusable Button component with multiple variants and sizes.
 * Corporate style — clean, minimal, accessible.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-lg
        transition-all duration-150
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}