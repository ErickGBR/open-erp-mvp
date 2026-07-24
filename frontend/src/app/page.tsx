'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Users, Receipt, BarChart3, Sparkles, TrendingUp, Shield, Zap, Globe, Download, Terminal, Copy, Check, Container } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Feature card data for the landing page features section.
 */
interface Feature {
  icon: typeof Package;
  title: string;
  description: string;
  color: string;
}

/**
 * Build feature cards from translation keys.
 */
function useFeatures(): Feature[] {
  const { t } = useLanguage();
  return [
    {
      icon: Package,
      title: t('landing.features.inventory.title'),
      description: t('landing.features.inventory.description'),
      color: 'from-primary to-primary-dark',
    },
    {
      icon: Users,
      title: t('landing.features.hr.title'),
      description: t('landing.features.hr.description'),
      color: 'from-primary-light to-primary',
    },
    {
      icon: Receipt,
      title: t('landing.features.pos.title'),
      description: t('landing.features.pos.description'),
      color: 'from-primary to-primary-dark',
    },
    {
      icon: BarChart3,
      title: t('landing.features.accounting.title'),
      description: t('landing.features.accounting.description'),
      color: 'from-primary-light to-primary-dark',
    },
  ];
}

/**
 * Landing page — showcases Open ERP with a corporate premium theme,
 * floating orb background, features grid, and a glassmorphism CTA.
 */
export default function LandingPage() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const FEATURES = useFeatures();

  // Parallax scroll effect — updates orb positions and light sweep
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };


  return (
    <div className="min-h-screen bg-surface overflow-hidden">

      {/* Animated background orbs — Vercel-inspired depth effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb"
          style={{
            width: '500px', height: '500px',
            top: '-200px', right: '-150px',
            transform: `translateY(${scrollY * 0.15}px)`,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)',
          }}
        />
        <div
          className="orb"
          style={{
            width: '400px', height: '400px',
            bottom: '-150px', left: '-100px',
            transform: `translateY(${scrollY * -0.1}px)`,
            animationDelay: '-7s',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)',
          }}
        />
        <div
          className="orb"
          style={{
            width: '300px', height: '300px',
            top: '50%', left: '33%',
            transform: `translateY(${scrollY * 0.05}px)`,
            animationDelay: '-14s',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
          }}
        />
        {/* Subtle gradient sweep */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(99,102,241,1) ${50 + scrollY * 0.05}%, transparent 100%)`,
            transform: `translateY(${scrollY * -0.3}px)`,
          }}
        />
      </div>

      <main className="relative z-10">
        <Header landing />

        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface-hover text-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>{t('landing.badge')}</span>
            </div>

            {/* Main heading with gradient sweep */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-text-primary">{t('landing.hero.welcome')}</span>
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent gradient-sweep">
                {t('landing.hero.title')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#download" className="btn-primary inline-flex items-center gap-2 text-base">
                <Download className="w-5 h-5" />
                {t('landing.hero.download')}
              </a>
              <a href="#features" className="btn-outline text-base">
                {t('landing.hero.learnMore')}
              </a>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* MARQUEE BANNER */}
        <div className="relative py-8 overflow-hidden border-y border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-transparent to-[#0a0a12] z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {/* First row */}
            <div className="flex items-center gap-12 mx-8">
              {[0,1,2,3,4,5,6,7,8,9].map((i) => (
                <span key={i} className="text-sm text-text-muted font-medium tracking-wider uppercase">
                  <span className="text-primary mr-2">◆</span>
                  {t(`landing.marquee.${i}`)}
                </span>
              ))}
            </div>
            {/* Duplicated for continuous effect */}
            <div className="flex items-center gap-12 mx-8">
              {[0,1,2,3,4,5,6,7,8,9].map((i) => (
                <span key={`${i}-dup`} className="text-sm text-text-muted font-medium tracking-wider uppercase">
                  <span className="text-primary mr-2">◆</span>
                  {t(`landing.marquee.${i}`)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.features.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
              <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
                {t('landing.features.subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card p-6 group hover:shadow-md transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SHOWCASE BANNER SECTION */}
        <section className="py-24 px-4 relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5 blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.banners.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
            </div>

            {/* Banner Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Banner 1 */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('landing.banners.analytics.title')}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t('landing.banners.analytics.desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 2 */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('landing.banners.secure.title')}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t('landing.banners.secure.desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 3 */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('landing.banners.fast.title')}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t('landing.banners.fast.desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 4 */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('landing.banners.opensource.title')}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t('landing.banners.opensource.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APP SCREENSHOTS SECTION — Carrusel Dinámico */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary-light/5 via-primary/5 to-primary-light/5 blur-[120px]" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.screenshots.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
              <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
                {t('landing.screenshots.subtitle')}
              </p>
            </div>

            {/* Carrusel */}
            <CarouselScreenshots />
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-4 relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-surface-hover blur-[120px]" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="card rounded-2xl p-12 shadow-md">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.cta.title')}
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
                {t('landing.cta.subtitle')}
              </p>
              <a
                href="#download"
                className="btn-primary inline-flex items-center gap-2 text-base"
              >
                <Download className="w-5 h-5" />
                {t('landing.cta.button')}
              </a>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section className="py-16 px-4 border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '100%', label: t('landing.stats.free') },
              { value: '24/7', label: t('landing.stats.accessible') },
              { value: '0$', label: t('landing.stats.opensource') },
              { value: '∞', label: t('landing.stats.extensible') },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted font-medium tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DOWNLOAD & INSTALL SECTION */}
        <section id="download" className="py-24 px-4 relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5 blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface-hover text-primary text-sm mb-6">
                <Download className="w-4 h-4" />
                <span>{t('landing.install.badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.install.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
              <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
                {t('landing.install.subtitle')}
              </p>
            </div>

            {/* Two columns grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Docker Column */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                    <Container className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {t('landing.install.docker.title')}{' '}
                      <span className="text-[10px] align-top px-2 py-0.5 rounded-full bg-surface-hover text-primary border border-border">
                        {t('landing.install.docker.recommended')}
                      </span>
                    </h3>
                    <p className="text-sm text-text-secondary">{t('landing.install.docker.desc')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">{t('landing.install.requirements')}</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Docker
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Docker Compose
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Git
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <pre className="bg-[#0a0e1a] border border-border rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-text-secondary font-mono">
                      {`git clone https://github.com/ErickGBR/open-erp-mvp.git\ncd open-erp-mvp\ndocker compose up --build -d`}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/ErickGBR/open-erp-mvp.git\ncd open-erp-mvp\ndocker compose up --build -d`, 'docker')}
                    className="absolute top-3 right-3 btn-outline p-2"
                    aria-label="Copy Docker installation command"
                  >
                    {copied === 'docker' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ubuntu Column */}
              <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{t('landing.install.ubuntu.title')}</h3>
                    <p className="text-sm text-text-secondary">{t('landing.install.ubuntu.desc')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">{t('landing.install.requirements')}</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Ubuntu 22.04+
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      sudo access
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      curl
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      openssl
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <pre className="bg-[#0a0e1a] border border-border rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-text-secondary font-mono">
                      {`sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ErickGBR/open-erp-mvp/main/install.sh)"`}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(`sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ErickGBR/open-erp-mvp/main/install.sh)"`, 'ubuntu')}
                    className="absolute top-3 right-3 btn-outline p-2"
                    aria-label="Copy Ubuntu installation command"
                  >
                    {copied === 'ubuntu' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="card p-8 shadow-md group hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('landing.install.quickStart')}</h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: 1, title: t('landing.install.steps.clone.title'), desc: t('landing.install.steps.clone.desc'), code: 'git clone https://github.com/ErickGBR/open-erp-mvp.git' },
                  { step: 2, title: t('landing.install.steps.configure.title'), desc: t('landing.install.steps.configure.desc'), code: 'cp .env.example .env' },
                  { step: 3, title: t('landing.install.steps.run.title'), desc: t('landing.install.steps.run.desc'), code: 'docker compose up --build -d' },
                  { step: 4, title: t('landing.install.steps.open.title'), desc: t('landing.install.steps.open.desc'), code: 'http://localhost:3000' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-white">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-text-secondary mb-2">{item.desc}</p>
                      <code className="text-xs text-primary font-mono bg-[#0a0e1a] px-2 py-1 rounded border border-border block truncate">
                        {item.code}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * CarouselScreenshots — carrusel interactivo con sweep effect
 * ────────────────────────────────────────────────────────────── */

/**
 * Componente que usa el hook useLanguage dentro del contexto del provider.
 */
function CarouselScreenshots() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [autoplay, setAutoplay] = useState(true);

  const SCREENSHOTS = [
    { src: '/screenshots/landing-hero.png',      label: t('landing.screenshots.slides.hero') },
    { src: '/screenshots/login-page.png',         label: t('landing.screenshots.slides.login') },
    { src: '/screenshots/dashboard-overview.png', label: t('landing.screenshots.slides.dashboard') },
    { src: '/screenshots/dashboard-products.png', label: t('landing.screenshots.slides.products') },
    { src: '/screenshots/dashboard-warehouses.png', label: t('landing.screenshots.slides.warehouses') },
    { src: '/screenshots/dashboard-customers.png', label: t('landing.screenshots.slides.customers') },
    { src: '/screenshots/dashboard-sales.png',    label: t('landing.screenshots.slides.sales') },
    { src: '/screenshots/dashboard-pos.png',      label: t('landing.screenshots.slides.pos') },
    { src: '/screenshots/dashboard-rh.png',       label: t('landing.screenshots.slides.hr') },
    { src: '/screenshots/dashboard-rh-employees.png', label: t('landing.screenshots.slides.employees') },
    { src: '/screenshots/dashboard-rh-payroll.png',  label: t('landing.screenshots.slides.payroll') },
    { src: '/screenshots/dashboard-accounts.png', label: t('landing.screenshots.slides.accounts') },
    { src: '/screenshots/dashboard-company.png',  label: t('landing.screenshots.slides.company') },
    { src: '/screenshots/dashboard-settings.png', label: t('landing.screenshots.slides.settings') },
  ];

  const total = SCREENSHOTS.length;

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    setDirection(idx > current ? 'right' : 'left');
    setSweeping(true);
    setTimeout(() => {
      setCurrent(idx);
      setSweeping(false);
    }, 300);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % total), [current, goTo, total]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, goTo, total]);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [autoplay, next]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { prev(); setAutoplay(false); }
      if (e.key === 'ArrowRight') { next(); setAutoplay(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  const sweepClass = sweeping
    ? (direction === 'right' ? 'animate-[carouselSweepRight_0.3s_ease-in-out]' : 'animate-[carouselSweepLeft_0.3s_ease-in-out]')
    : '';

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      {/* Viewport */}
      <div className="relative overflow-hidden rounded-2xl card shadow-md aspect-video max-w-4xl mx-auto">
        {/* Sweep overlay */}
        {sweeping && (
          <div
            className={`absolute inset-0 z-20 bg-gradient-to-r from-primary/30 via-primary-light/20 to-primary/30 ${sweepClass}`}
          />
        )}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SCREENSHOTS[current].src}
          alt={SCREENSHOTS[current].label}
          className="w-full h-full object-cover object-top transition-all duration-500"
          style={{
            filter: sweeping ? 'brightness(1.2) saturate(1.3)' : 'brightness(1) saturate(1)',
          }}
        />

        {/* Label overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a12]/80 via-[#0a0a12]/40 to-transparent p-6 pt-12">
          <p className="text-white font-semibold text-lg">{SCREENSHOTS[current].label}</p>
          <p className="text-text-secondary text-sm">
            {current + 1} / {total}
          </p>
        </div>

        {/* Prev / Next buttons */}
        <button
          onClick={() => { prev(); setAutoplay(false); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
          aria-label="Previous screenshot"
          style={{ opacity: '0.7' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => { next(); setAutoplay(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary/40 transition-all duration-200"
          aria-label="Next screenshot"
          style={{ opacity: '0.7' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4 flex-wrap">
        {SCREENSHOTS.map((shot, idx) => (
          <button
            key={shot.label}
            onClick={() => { goTo(idx); setAutoplay(false); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === current
                ? 'bg-primary w-6 shadow-[0_0_8px_rgba(0,200,255,0.6)]'
                : 'bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to ${shot.label}`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
        {SCREENSHOTS.map((shot, idx) => (
          <button
            key={shot.label}
            onClick={() => { goTo(idx); setAutoplay(false); }}
            className={`flex-shrink-0 w-16 h-10 rounded-md overflow-hidden border-2 transition-all duration-200 ${
              idx === current
                ? 'border-primary shadow-[0_0_10px_rgba(37,99,235,0.4)] opacity-100'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
