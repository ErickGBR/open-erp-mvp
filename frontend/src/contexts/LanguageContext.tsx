'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Language } from '@/lib/i18n';
import { getInitialLanguage } from '@/lib/i18n';

// Import all message files statically so they are bundled
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

/**
 * Type for the nested messages structure.
 * Enables dot-notation access like `t('landing.hero.title')`.
 */
type Messages = Record<string, unknown>;

/**
 * Registry of available languages and their message bundles.
 */
const MESSAGES: Record<Language, Messages> = {
  en: enMessages as Messages,
  es: esMessages as Messages,
};

/**
 * Shape of the language context value.
 */
interface LanguageContextValue {
  /** Currently active language code */
  language: Language;
  /** Switch the active language */
  setLanguage: (lang: Language) => void;
  /** Translate a dot-notation key to the localized string */
  t: (key: string, fallback?: string) => string;
  /** All available languages */
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Language provider that wraps the app and provides translation (t) function,
 * current language state, and a setter that persists to localStorage and backend.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage());

  /**
   * Persist language preference to backend API when changed by the user.
   */
  const syncToBackend = useCallback(async (lang: Language) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      await fetch(`${apiUrl}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: lang }),
      });
    } catch {
      // Silently fail — offline or no session is acceptable
    }
  }, []);

  /**
   * Set language, persist to localStorage, and sync to backend.
   */
  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    syncToBackend(lang);
  }, [syncToBackend]);

  /**
   * Update html lang attribute whenever language changes.
   */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Deeply resolve a dot-notation key to a string value within a nested object.
   * Falls back to the fallback param, then the key itself.
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.');
      let value: unknown = MESSAGES[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return fallback ?? key;
        }
      }

      if (typeof value === 'string') return value;
      return fallback ?? key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: ['en', 'es'] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context.
 * Throws if used outside of LanguageProvider.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
