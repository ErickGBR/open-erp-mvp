'use client';

import { ReactNode } from 'react';

/**
 * A single tab definition.
 */
export interface Tab {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional badge count */
  count?: number;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Props for the Tabs component.
 */
export interface TabsProps {
  /** Available tabs */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Additional wrapper class */
  className?: string;
  /** Variant */
  variant?: 'underline' | 'pills';
}

/**
 * Tab navigation component with underline or pill style.
 * Corporate style — clean, minimal, accessible.
 */
export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'underline',
}: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
              className={`
                inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
                }
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-card text-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant (default)
  return (
    <div className={`border-b border-border ${className}`} role="tablist">
      <div className="flex -mb-px space-x-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
              className={`
                inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'
                }
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-card text-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}