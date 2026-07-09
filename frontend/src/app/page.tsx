'use client';

import Link from 'next/link';
import { Package, Users, Receipt, BarChart3, ArrowRight, Sparkles, TrendingUp, Shield, Zap, Globe } from 'lucide-react';
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
  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb-cyan w-[500px] h-[500px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]" />
        <div className="orb-blue w-[400px] h-[400px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]" />
        <div className="orb-cyan w-[300px] h-[300px] top-1/2 left-1/3 animate-[orbFloat_10s_ease-in-out_infinite_2s]" />
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
              <Link href="/auth?tab=register" className="btn-cyan inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
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
              <Link
                href="/auth?tab=register"
                className="btn-cyan inline-flex items-center gap-2 text-base"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
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
      </main>

      <Footer />
    </div>
  );
}
