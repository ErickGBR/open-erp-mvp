'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Settings page — displays user profile info, language preferences, and application details.
 * Uses the AuthContext to show the current user's name, email, and role,
 * and LanguageContext for i18n and language switching.
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-text-primary">{t('settings.title')}</h1>
      <p className="mb-8 text-text-secondary">{t('settings.subtitle')}</p>

      {/* User Profile */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('settings.profile')}</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm">
          <div className="divide-y divide-border">
            <InfoRow label={t('settings.name')} value={user?.name || '—'} />
            <InfoRow label={t('settings.email')} value={user?.email || '—'} />
            <InfoRow label={t('settings.role')} value={user?.role || '—'} />
          </div>
        </div>
      </section>

      {/* Language Preference */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('settings.language.label')}</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm p-6">
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  language === lang
                    ? 'btn-primary'
                    : 'border border-border text-text-secondary hover:border-border-light hover:text-primary bg-transparent'
                }`}
              >
                {t(`settings.language.${lang}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Application Info */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('settings.application')}</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm">
          <div className="divide-y divide-border">
            <InfoRow label={t('settings.version')} value="1.0.0" />
            <InfoRow label={t('settings.frontend')} value="Next.js 16 + React 19 + Tailwind CSS 4" />
            <InfoRow label={t('settings.backend')} value="NestJS + TypeORM + PostgreSQL" />
            <InfoRow label={t('settings.auth')} value="JWT (JSON Web Tokens)" />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Single row in an info card — label on the left, value on the right.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <dt className="text-sm font-medium text-text-secondary">{label}</dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  );
}
