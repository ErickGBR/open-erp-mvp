'use client';

import Link from 'next/link';
import {
  Users,
  ArrowRight,
  Sparkles,
  UserPlus,
  BarChart3,
  HeadphonesIcon,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Star,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Customer management landing page — showcases All Customers, Analytics,
 * and Support features with neon theme and glass cards.
 */
export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb" style={{ width: '500px', height: '500px', top: '-200px', right: '-150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)' }} />
        <div className="orb" style={{ width: '400px', height: '400px', bottom: '-150px', left: '-100px', animationDelay: '-7s', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)' }} />
        <div className="orb" style={{ width: '300px', height: '300px', top: '50%', left: '25%', animationDelay: '-14s', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)' }} />
      </div>

      <main className="relative z-10">
        <Header landing />

        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface-hover text-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Build stronger customer relationships</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Customer </span>
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent gradient-sweep">
                Relationship Management
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Manage contacts, track interactions, and gain insights into your customer base.
              Everything you need to nurture relationships and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="btn-primary inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#analytics" className="btn-outline text-base">
                View Insights
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* ── STATS ── */}
        <section className="py-16 px-4 border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 'Unlimited', label: 'Contacts' },
              { value: '360°', label: 'Customer View' },
              { value: 'Purchase', label: 'History' },
              { value: 'Smart', label: 'Segmentation' },
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

        {/* ── ALL CUSTOMERS ── */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-hover text-primary text-xs mb-4">
                <Users className="w-3.5 h-3.5" />
                Customer Management
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Complete Customer Profiles
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
              <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
                Store everything you need to know about your customers in one place.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: UserPlus,
                  title: 'Add & Import',
                  desc: 'Add customers individually or import via CSV. Keep all contact info organized.',
                  color: 'from-primary to-primary-dark',
                },
                {
                  icon: Star,
                  title: 'Purchase History',
                  desc: 'View every transaction, invoice, and interaction with each customer.',
                  color: 'from-primary-light to-primary',
                },
                {
                  icon: UserCheck,
                  title: 'Segments & Groups',
                  desc: 'Organize customers into segments for targeted communication and analysis.',
                  color: 'from-primary to-primary-dark',
                },
              ].map((feature) => {
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
                    <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ANALYTICS SECTION ── */}
        <section id="analytics" className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5 blur-[120px]" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-hover text-primary text-xs mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Customer Insights &amp; Analytics
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: 'Spending Patterns',
                  desc: 'Identify your highest-value customers and track spending trends over time.',
                  color: 'from-primary to-primary-dark',
                },
                {
                  icon: BarChart3,
                  title: 'Retention Metrics',
                  desc: 'Monitor customer retention, churn rates, and repeat purchase behavior.',
                  color: 'from-primary-light to-primary-dark',
                },
                {
                  icon: Users,
                  title: 'Demographics',
                  desc: 'Understand your customer base with demographic breakdowns and segment analysis.',
                  color: 'from-primary to-primary-dark',
                },
                {
                  icon: Star,
                  title: 'Top Customers',
                  desc: 'Easily identify and reward your best customers with loyalty insights.',
                  color: 'from-primary-light to-primary',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card p-8 shadow-md group hover:shadow-md transition-all duration-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SUPPORT SECTION ── */}
        <section id="support" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-hover text-primary text-xs mb-4">
                <HeadphonesIcon className="w-3.5 h-3.5" />
                Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Customer Support Tools
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto shadow-md" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageCircle,
                  title: 'Interaction Log',
                  desc: 'Keep a complete log of all customer communications and support tickets.',
                },
                {
                  icon: HeadphonesIcon,
                  title: 'Ticket System',
                  desc: 'Track support requests from creation to resolution with status updates.',
                },
                {
                  icon: Star,
                  title: 'Feedback & Surveys',
                  desc: 'Collect and analyze customer feedback to improve your products and service.',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card p-8 shadow-md group hover:shadow-md transition-all duration-500 text-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-surface-hover blur-[120px]" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="card rounded-2xl p-12 shadow-md">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Build better customer relationships
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
                Start managing your customers with powerful tools. Free, open-source, and ready to use.
              </p>
              <Link
                href="/auth"
                className="btn-primary inline-flex items-center gap-2 text-base"
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
