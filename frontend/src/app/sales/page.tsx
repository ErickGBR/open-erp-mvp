'use client';

import Link from 'next/link';
import {
  Receipt,
  ArrowRight,
  Sparkles,
  PlusCircle,
  FileText,
  CreditCard,
  TrendingUp,
  Calculator,
  Send,
  Download,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Sales & Invoicing landing page — showcases New Sale, Invoices, and Payments
 * features with neon theme and glass cards.
 */
export default function SalesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb-cyan w-[500px] h-[500px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]" />
        <div className="orb-blue w-[400px] h-[400px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]" />
        <div className="orb-cyan w-[300px] h-[300px] top-1/2 left-2/3 animate-[orbFloat_10s_ease-in-out_infinite_2s]" />
      </div>

      <main className="relative z-10">
        <Header landing />

        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Invoicing, payments &amp; revenue tracking</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Sales &amp; Invoicing </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent gradient-sweep">
                Made Simple
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create invoices, track payments, and monitor your revenue stream. 
              From quote to payment, manage your entire sales pipeline effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?tab=register" className="btn-cyan inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#invoices" className="btn-outline text-base">
                View Features
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* ── STATS ── */}
        <section className="py-16 px-4 border-y border-cyan-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 'Instant', label: 'Invoice Creation' },
              { value: 'Multi', label: 'Payment Methods' },
              { value: 'Auto', label: 'Payment Tracking' },
              { value: 'Real-time', label: 'Revenue Reports' },
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

        {/* ── NEW SALE ── */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <PlusCircle className="w-3.5 h-3.5" />
                Create Sales
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Create Sales in Seconds
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
              <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                From product selection to invoice generation — fast and frictionless.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: PlusCircle,
                  title: 'New Sale Flow',
                  desc: 'Select customer, add products, apply discounts — generate invoices instantly.',
                  color: 'from-cyan-400 to-blue-500',
                },
                {
                  icon: Calculator,
                  title: 'Auto Calculations',
                  desc: 'Taxes, discounts, and totals are computed automatically. No manual math.',
                  color: 'from-blue-400 to-purple-500',
                },
                {
                  icon: Send,
                  title: 'Send to Customer',
                  desc: 'Email invoices directly to customers with a single click.',
                  color: 'from-cyan-400 to-teal-500',
                },
              ].map((feature) => {
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
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── INVOICES SECTION ── */}
        <section id="invoices" className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <FileText className="w-3.5 h-3.5" />
                Invoicing
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Professional Invoicing
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'Invoice Management',
                  desc: 'View, search, and filter all invoices. Track status — draft, sent, paid, or overdue.',
                  color: 'from-cyan-400 to-teal-500',
                },
                {
                  icon: Download,
                  title: 'PDF Export',
                  desc: 'Generate professional PDF invoices ready to print or email to clients.',
                  color: 'from-blue-400 to-cyan-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Revenue Overview',
                  desc: 'See total invoiced, collected, and outstanding amounts at a glance.',
                  color: 'from-cyan-400 to-blue-500',
                },
                {
                  icon: Receipt,
                  title: 'Recurring Invoices',
                  desc: 'Set up recurring invoices for subscriptions and retainer clients.',
                  color: 'from-blue-400 to-purple-500',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PAYMENTS SECTION ── */}
        <section id="payments" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                Payments
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Payment Tracking
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: CreditCard,
                  title: 'Payment Methods',
                  desc: 'Track payments by method — cash, card, transfer, or check. Stay organized.',
                },
                {
                  icon: Receipt,
                  title: 'Payment Status',
                  desc: 'Monitor which invoices are paid, pending, or overdue with visual indicators.',
                },
                {
                  icon: TrendingUp,
                  title: 'Cash Flow',
                  desc: 'View your cash flow in real-time. Know exactly what has been collected and what is due.',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500 text-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-12 glow-cyan">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Start selling today
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Create invoices, accept payments, and track your revenue — all with open-source freedom.
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
      </main>

      <Footer />
    </div>
  );
}
