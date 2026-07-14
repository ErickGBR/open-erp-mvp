export type Language = 'en' | 'es';
export type TranslationKey = string;

const DEFAULT_LANG: Language = 'en';

export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  
  const lang = navigator.language || navigator.languages?.[0] || '';
  
  if (lang.startsWith('es')) return 'es';
  
  return DEFAULT_LANG;
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  
  const stored = localStorage.getItem('language');
  if (stored === 'en' || stored === 'es') return stored;
  
  return detectBrowserLanguage();
}
