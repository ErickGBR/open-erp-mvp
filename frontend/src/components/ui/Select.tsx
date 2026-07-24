'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

/**
 * Option for the Select component.
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Props for the Select component.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Helper text displayed below */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Available options */
  options: SelectOption[];
  /** Placeholder option */
  placeholder?: string;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Clean, accessible Select dropdown component.
 * Corporate style consistent with Input.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm
            text-text-primary
            transition-colors duration-150 appearance-none
            ${error ? 'border-danger' : 'border-border hover:border-slate-300'}
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:cursor-not-allowed disabled:bg-surface-card disabled:opacity-60
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute mt-[-2.25rem] mr-3 flex justify-end">
          <svg
            className="h-4 w-4 text-text-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;