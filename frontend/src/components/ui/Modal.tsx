'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Maximum width class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Additional classes */
  className?: string;
}

const MAX_WIDTHS: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Modal dialog with overlay, centered card, close button, and optional footer.
 * Corporate style — clean overlay, white card, subtle shadow.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}: ModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className={`
          relative z-10 w-full ${MAX_WIDTHS[maxWidth]} mx-4
          animate-slide-up
          rounded-xl bg-white shadow-xl border border-border
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-card hover:text-text-primary"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}