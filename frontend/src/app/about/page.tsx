'use client';

import Link from 'next/link';
import {
  Package,
  ArrowRight,
  Sparkles,
  Heart,
  Target,
  Eye,
  Code2,
  GitBranch,
  Mail,
  MapPin,
  Globe,
  Quote,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * About page — Vercel-inspired dark theme with indigo accents.
 */
export default function AboutPage() {
  const techStack = [
    { name: 'Docker', color: 'from-blue-400 to-blue-600' },
    { name: 'NestJS', color: 'from-red-400 to-red-600' },
    { name: 'Next.js', color: 'from-white to-gray-300' },
    { name: 'React', color: 'from-primary to-primary-light' },
    { name: 'Tailwind', color: 'from-teal-400 to-cyan-500' },
    { name: 'DeepSeek', color: 'from-yellow-400 to-orange-500' },
    { name: 'PostgreSQL', color: 'from-blue-500 to-indigo-600' },
    { name: 'TypeScript', color: 'from-blue-400 to-blue-600' },
    { name: 'TypeORM', color: 'from-orange-400 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-brand-base overflow-hidden">
      <main className="relative z-10">
        <Header landing />

        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary-glow text-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Open-source ERP for everyone</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-text-primary">About </span>
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent gradient-sweep">
                Open ERP
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Built with passion, powered by open source. Learn about our mission,
              our values, and the technology that makes Open ERP possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="btn-primary inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about#contact"
                className="btn-outline inline-flex items-center gap-2 text-base"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-base to-transparent" />
        </section>

        {/* ── MISSION ── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Our Mission
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                We believe powerful business tools should be accessible to everyone.
                Open ERP is our contribution to that vision.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Our Purpose',
                  desc: 'Democratize enterprise-grade ERP software by making it free and open source for businesses of all sizes.',
                },
                {
                  icon: Eye,
                  title: 'Our Vision',
                  desc: 'A world where every small and medium business has access to the same powerful tools as large enterprises.',
                },
                {
                  icon: Heart,
                  title: 'Our Values',
                  desc: 'Transparency, community-driven development, and a relentless focus on user experience.',
                },
              ].map((item) => (
                <div key={item.title} className="card-glow p-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH ── */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Built With
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Modern tools for modern development.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    bg-surface-hover border border-border text-text-secondary
                    hover:bg-primary-glow hover:border-primary/20 hover:text-text-primary transition-all duration-300"
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${tech.color}`} />
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Get in Touch
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Have questions? We&apos;d love to hear from you.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { icon: Mail, label: 'Email', value: 'hello@openerp.dev' },
                { icon: MapPin, label: 'Location', value: 'Built for the global community' },
                { icon: Globe, label: 'Web', value: 'github.com/ErickGBR/run-mvp' },
              ].map((item) => (
                <div key={item.label} className="card-glow p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{item.label}</h3>
                  <p className="text-sm text-text-muted">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
