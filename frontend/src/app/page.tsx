'use client';

import { useState, useEffect } from 'react';
import { Package, Users, Receipt, BarChart3, Sparkles, TrendingUp, Shield, Zap, Globe, Download, Terminal, Copy, Check, Container } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Feature card data for the landing page features section.
 */
interface Feature {
  icon: typeof Package;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: Package,
    title: 'Products',
    description: 'Manage your inventory with ease. Track stock levels, set reorder points, and organize products by categories.',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Users,
    title: 'Customers',
    description: 'Keep a complete record of your customers. View purchase history, manage contacts, and build stronger relationships.',
    color: 'from-blue-400 to-purple-500',
  },
  {
    icon: Receipt,
    title: 'Sales',
    description: 'Create invoices, track payments, and monitor your sales pipeline. Stay on top of every transaction.',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Reports',
    description: 'Get actionable insights with customizable reports. Visualize your data and make informed decisions.',
    color: 'from-blue-400 to-cyan-500',
  },
];

/**
 * Landing page — showcases Open ERP with a neon cyan/blue dark theme,
 * floating orb background, features grid, and a glassmorphism CTA.
 */
export default function LandingPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect — actualiza posición de orbes y barrido luminoso
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
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">

      {/* Floating orbs background con parallax scroll */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb-cyan w-[500px] h-[500px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="orb-blue w-[400px] h-[400px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        />
        <div
          className="orb-cyan w-[300px] h-[300px] top-1/2 left-1/3 animate-[orbFloat_10s_ease-in-out_infinite_2s]"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />
        {/* Barrido luminoso que sigue el scroll */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(34,211,238,1) ${50 + scrollY * 0.05}%, transparent 100%)`,
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Open-source ERP platform</span>
            </div>

            {/* Main heading with gradient sweep */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent gradient-sweep">
                Open ERP
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Streamline your business operations with a modern, extensible platform
              built for growth. Open-source, secure, and designed for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#download" className="btn-cyan inline-flex items-center gap-2 text-base">
                <Download className="w-5 h-5" />
                Download Now
              </a>
              <a href="#features" className="btn-outline text-base">
                Learn More
              </a>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* MARQUEE BANNER */}
        <div className="relative py-8 overflow-hidden border-y border-cyan-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-transparent to-[#0a0a12] z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Primera fila */}
            <div className="flex items-center gap-12 mx-8">
              {['Inventory', 'Invoices', 'Customers', 'Reports', 'Analytics', 'Orders', 'Products', 'Payments', 'Dashboard', 'Sales'].map((item) => (
                <span key={item} className="text-sm text-slate-500 font-medium tracking-wider uppercase">
                  <span className="text-cyan-400 mr-2">◆</span>
                  {item}
                </span>
              ))}
            </div>
            {/* Duplicado para efecto continuo */}
            <div className="flex items-center gap-12 mx-8">
              {['Inventory', 'Invoices', 'Customers', 'Reports', 'Analytics', 'Orders', 'Products', 'Payments', 'Dashboard', 'Sales'].map((item) => (
                <span key={item + '-dup'} className="text-sm text-slate-500 font-medium tracking-wider uppercase">
                  <span className="text-cyan-400 mr-2">◆</span>
                  {item}
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
                Everything you need to run your business
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
              <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                From products to reports, Open ERP has you covered with a clean, intuitive interface.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="glass-card rounded-xl p-6 group hover:glow-cyan transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
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
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for modern businesses
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>

            {/* Banner Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Banner 1 */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Monitor your business performance with live dashboards, custom reports, and
                      actionable insights that help you make data-driven decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 2 */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Secure & Reliable</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Enterprise-grade security with JWT authentication, encrypted data storage,
                      and role-based access control to keep your data safe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 3 */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Optimized performance with server-side rendering, automatic caching, and
                      a modern tech stack that ensures fast load times.
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner 4 */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Open Source</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Fully open-source under MIT license. Self-host or use our cloud.
                      Customize, extend, and contribute to the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-4 relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-12 glow-cyan">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Join thousands of businesses using Open ERP to streamline their operations.
                It&apos;s free, open-source, and built for you.
              </p>
              <a
                href="#download"
                className="btn-cyan inline-flex items-center gap-2 text-base"
              >
                <Download className="w-5 h-5" />
                Download Open ERP
              </a>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section className="py-16 px-4 border-y border-cyan-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '100%', label: 'Open Source' },
              { value: '24/7', label: 'Accessible' },
              { value: '0$', label: 'Free to Start' },
              { value: '∞', label: 'Extensible' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-medium tracking-wider uppercase">
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
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-6">
                <Download className="w-4 h-4" />
                <span>Installation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Get Started with Open ERP
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
              <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                Choose your installation method
              </p>
            </div>

            {/* Two columns grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Docker Column */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Container className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Docker{' '}
                      <span className="text-[10px] align-top px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Recommended
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400">Quick &amp; consistent setup</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Requirements</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Docker
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Docker Compose
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Git
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <pre className="bg-[#0a0e1a] border border-cyan-500/10 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-slate-300 font-mono">
                      {`git clone https://github.com/ErickGBR/run-mvp.git\ncd run-mvp\ndocker compose up --build -d`}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/ErickGBR/run-mvp.git\ncd run-mvp\ndocker compose up --build -d`, 'docker')}
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
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Ubuntu Server Installer</h3>
                    <p className="text-sm text-slate-400">Linux server setup</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Requirements</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Ubuntu 22.04+
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      sudo access
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      curl
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      openssl
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <pre className="bg-[#0a0e1a] border border-cyan-500/10 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-slate-300 font-mono">
                      {`sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ErickGBR/run-mvp/main/install.sh)"`}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(`sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ErickGBR/run-mvp/main/install.sh)"`, 'ubuntu')}
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
            <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Quick Start Guide</h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: 1, title: 'Clone Repository', desc: 'Get the source code', code: 'git clone https://github.com/ErickGBR/run-mvp.git' },
                  { step: 2, title: 'Configure', desc: 'Set up environment', code: 'cp .env.example .env' },
                  { step: 3, title: 'Run', desc: 'Start Docker containers', code: 'docker compose up --build -d' },
                  { step: 4, title: 'Open', desc: 'Access your ERP instance', code: 'http://localhost:3000' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-white">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 mb-2">{item.desc}</p>
                      <code className="text-xs text-cyan-400 font-mono bg-[#0a0e1a] px-2 py-1 rounded border border-cyan-500/10 block truncate">
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
