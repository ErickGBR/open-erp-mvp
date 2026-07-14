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
      <h1 className="mb-1 text-2xl font-bold text-[#e2e8f0]">{t('settings.title')}</h1>
      <p className="mb-8 text-slate-400">{t('settings.subtitle')}</p>

      {/* User Profile */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">{t('settings.profile')}</h2>
        <div className="overflow-hidden rounded-xl border border-cyan-500/10 bg-[#12121e] shadow-sm ">
          <div className="divide-y divide-cyan-500/5">
            <InfoRow label={t('settings.name')} value={user?.name || '—'} />
            <InfoRow label={t('settings.email')} value={user?.email || '—'} />
            <InfoRow label={t('settings.role')} value={user?.role || '—'} />
          </div>
        </div>
      </section>

      {/* Language Preference */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">{t('settings.language.label')}</h2>
        <div className="overflow-hidden rounded-xl border border-cyan-500/10 bg-[#12121e] shadow-sm p-6">
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  language === lang
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'border border-cyan-500/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 bg-transparent'
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
        <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">{t('settings.application')}</h2>
        <div className="overflow-hidden rounded-xl border border-cyan-500/10 bg-[#12121e] shadow-sm ">
          <div className="divide-y divide-cyan-500/5">
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
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="text-sm text-[#e2e8f0]">{value}</dd>
    </div>
  );
}
