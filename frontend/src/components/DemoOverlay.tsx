'use client';

import { useEffect, useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

export interface DemoStep {
  icon: string;
  text: string;
}

export interface DemoOverlayProps {
  title: string;
  description: string;
  steps?: DemoStep[];
  sectionKey: string;
}

const DISMISS_PREFIX = 'demo_dismissed_';

export default function DemoOverlay({ title, description, steps, sectionKey }: DemoOverlayProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_PREFIX + sectionKey);
    if (!stored) setDismissed(false);
  }, [sectionKey]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_PREFIX + sectionKey, 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="card relative border-l-4 border-l-primary animate-slide-down mb-6">
      {/* Header with title and Demo badge */}
      <div className="flex items-start justify-between gap-2 pr-8 mb-1">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <span className="badge-info text-xs flex items-center gap-1 shrink-0 mt-0.5">
          <Lightbulb className="w-3 h-3" /> Demo
        </span>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-3">{description}</p>

        {steps && steps.length > 0 && (
          <ul className="space-y-2 mb-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="shrink-0 mt-0.5">{step.icon}</span>
                <span>{step.text}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleDismiss}
            className="btn-primary text-sm"
          >
            Got it!
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Close X */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss demo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
