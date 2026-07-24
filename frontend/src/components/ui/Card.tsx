'use client';

import { ReactNode } from 'react';

/**
 * Props for the Card component.
 */
export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card has hover effects */
  hover?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDINGS: Record<string, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Base Card component with white background, rounded corners, border, and subtle shadow.
 * Inspired by Stripe Dashboard card style.
 */
export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const base = 'bg-white rounded-xl border border-border shadow-sm';
  const hoverClass = hover
    ? 'transition-shadow duration-200 hover:shadow-md hover:border-primary/30'
    : '';
  const padClass = PADDINGS[padding];

  return (
    <div className={`${base} ${hoverClass} ${padClass} ${className}`}>
      {children}
    </div>
  );
}