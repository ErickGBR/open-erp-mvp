'use client';

import Link from 'next/link';
import {
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Shield,
  Box,
  Warehouse,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Product management landing page — showcases Dashboard, Inventory, Sales, and Reports
 * features with neon theme, glass cards, and floating orbs.
 */
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb-cyan w-[500px] h-[500px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]" />
        <div className="orb-blue w-[400px] h-[400px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]" />
        <div className="orb-cyan w-[300px] h-[300px] top-1/3 left-1/2 animate-[orbFloat_10s_ease-in-out_infinite_2s]" />
      </div>

      <main className="relative z-10">
        <Header landing />

        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Streamline your inventory &amp; sales</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Powerful </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent gradient-sweep">
                Product Management
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track inventory, manage sales, and generate reports — all from one
              unified product dashboard. Stay in control of every item in your catalog.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?tab=register" className="btn-cyan inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#inventory" className="btn-outline text-base">
                Explore Features
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* ── OVERVIEW STATS ── */}
        <section className="py-16 px-4 border-y border-cyan-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 'Real-time', label: 'Stock Updates' },
              { value: 'Unlimited', label: 'Products' },
              { value: 'Automated', label: 'Reorder Alerts' },
              { value: 'Multi-ware', label: 'Location Support' },
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

        {/* ── DASHBOARD SECTION ── */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <Layers className="w-3.5 h-3.5" />
                Overview
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Product Dashboard
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
              <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                Get a bird&apos;s-eye view of your entire catalog with real-time metrics.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Box, label: 'Total Products', value: 'Manage & track', color: 'from-cyan-400 to-blue-500' },
                { icon: TrendingUp, label: 'Top Sellers', value: 'Best performers', color: 'from-blue-400 to-purple-500' },
                { icon: Warehouse, label: 'Stock Alerts', value: 'Low stock items', color: 'from-cyan-400 to-teal-500' },
                { icon: BarChart3, label: 'Revenue', value: 'Product earnings', color: 'from-blue-400 to-cyan-500' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="glass-card rounded-xl p-6 group hover:glow-cyan transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{stat.label}</h3>
                    <p className="text-sm text-slate-400">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── INVENTORY SECTION ── */}
        <section id="inventory" className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <Warehouse className="w-3.5 h-3.5" />
                Inventory
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Smart Inventory Management
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Package,
                  title: 'Stock Tracking',
                  desc: 'Monitor inventory levels in real-time. Set reorder points and receive alerts when stock runs low.',
                },
                {
                  icon: Layers,
                  title: 'Categories & Variants',
                  desc: 'Organize products by categories, brands, and variants like size, color, or material.',
                },
                {
                  icon: Shield,
                  title: 'Warehouse Management',
                  desc: 'Manage multiple warehouse locations with transfer support and automated stock adjustments.',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SALES SECTION ── */}
        <section id="sales" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <ShoppingCart className="w-3.5 h-3.5" />
                Sales from Products
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Sell Directly from Product Pages
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: ShoppingCart,
                  title: 'Quick Sales',
                  desc: 'Create invoices directly from any product page. Select quantity, apply discounts, and send to customers in seconds.',
                  color: 'from-cyan-400 to-teal-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Sales Analytics',
                  desc: 'Track which products perform best. View sales history, average order value, and conversion trends per item.',
                  color: 'from-blue-400 to-cyan-500',
                },
                {
                  icon: BarChart3,
                  title: 'Margin Analysis',
                  desc: 'See profit margins at a glance. Track cost prices, selling prices, and calculate profitability per product.',
                  color: 'from-cyan-400 to-blue-500',
                },
                {
                  icon: Package,
                  title: 'Bundle Management',
                  desc: 'Create product bundles and kits. Manage composite items while tracking individual component inventory.',
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

        {/* ── REPORTS SECTION ── */}
        <section id="reports" className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Reports &amp; Analytics
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Data-Driven Insights
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>
            <div className="glass-card rounded-2xl p-10 glow-cyan">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {[
                  { label: 'Stock Reports', desc: 'Inventory valuation, movement history, and turnover rates.' },
                  { label: 'Sales Reports', desc: 'Revenue summaries, top products, and category performance.' },
                  { label: 'Custom Reports', desc: 'Build personalized reports with filters and date ranges.' },
                ].map((report) => (
                  <div key={report.label} className="group">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">{report.label}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{report.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-12 glow-cyan">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to manage your products?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Start tracking inventory, creating sales, and generating reports — all free and open-source.
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
