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
 * About landing page — showcases our story, mission, values, tech stack,
 * and contact information with neon theme and glass cards.
 */
export default function AboutPage() {
  const techStack = [
    { name: 'Docker', color: 'from-blue-400 to-blue-600' },
    { name: 'NestJS', color: 'from-red-400 to-red-600' },
    { name: 'Next.js', color: 'from-white to-gray-300' },
    { name: 'React', color: 'from-cyan-400 to-blue-500' },
    { name: 'Tailwind', color: 'from-teal-400 to-cyan-500' },
    { name: 'DeepSeek', color: 'from-yellow-400 to-orange-500' },
    { name: 'PostgreSQL', color: 'from-blue-500 to-indigo-600' },
    { name: 'TypeScript', color: 'from-blue-400 to-blue-600' },
    { name: 'TypeORM', color: 'from-orange-400 to-red-500' },
  ];

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
              <span>Open-source ERP for everyone</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white">About </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent gradient-sweep">
                Open ERP
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Built with passion, powered by open source. Learn about our mission,
              our values, and the technology that makes Open ERP possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="btn-cyan inline-flex items-center gap-2 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#story" className="btn-outline text-base">
                Our Story
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* ── STORY ── */}
        <section id="story" className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <Heart className="w-3.5 h-3.5" />
                Our Story
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It All Began
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>

            <div className="glass-card rounded-2xl p-10 glow-cyan space-y-6">
              <p className="text-slate-300 leading-relaxed text-lg">
                Open ERP was born from a simple observation: small and medium businesses
                deserve access to enterprise-grade tools without enterprise price tags.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Most ERP systems are either prohibitively expensive, overly complex, or locked
                behind proprietary licenses that leave businesses dependent on a single vendor.
                We believed there had to be a better way.
              </p>
              <p className="text-slate-400 leading-relaxed">
                What started as a personal project to build a simple inventory management tool
                quickly evolved into a full-fledged ERP platform. Today, Open ERP serves
                businesses around the world, helping them streamline operations, manage
                customers, and grow their revenue — all with the freedom of open-source software.
              </p>
              <div className="border-l-2 border-cyan-500/30 pl-6 py-4 mt-8">
                <Quote className="w-8 h-8 text-cyan-400/50 mb-2" />
                <p className="text-lg text-cyan-300 italic">
                  We believe great business software should be accessible to everyone,
                  not just those with enterprise budgets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION & VALUES ── */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Mission */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  To democratize business management by providing a free, open-source ERP
                  platform that rivals proprietary solutions in quality, security, and user experience.
                </p>
              </div>

              {/* Vision */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Our Vision</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A world where every business, regardless of size or budget, has access to
                  powerful, intuitive, and secure management software.
                </p>
              </div>

              {/* Values */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Our Values</h3>
                <ul className="text-slate-400 text-sm leading-relaxed space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">◆</span>
                    Transparency in everything we do
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">◆</span>
                    Community-driven development
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">◆</span>
                    Simplicity over complexity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">◆</span>
                    Privacy and security by design
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <Code2 className="w-3.5 h-3.5" />
                Technology
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built With Modern Technology
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
              <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                Open ERP leverages a cutting-edge tech stack for performance, security, and scalability.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-10 glow-cyan">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                      bg-white/5 border border-cyan-500/10 text-slate-300
                      hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 
                      hover:border-cyan-500/30 hover:text-white transition-all duration-300"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${tech.color}`} />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-24 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-4">
                <Mail className="w-3.5 h-3.5" />
                Contact
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Get In Touch
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto glow-cyan-sm" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Email */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-slate-400 text-sm">contact@runmvp.com</p>
              </div>

              {/* Location */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <p className="text-slate-400 text-sm">Open Source<br />Worldwide</p>
              </div>

              {/* GitHub */}
              <div className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <GitBranch className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Source Code</h3>
                <a
                  href="https://github.com/ErickGBR/run-mvp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                >
                  github.com/ErickGBR/run-mvp
                </a>
              </div>
            </div>

            {/* Author card */}
            <div className="mt-12 glass-card rounded-2xl p-10 glow-cyan text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-5">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Built by Erick Burgos</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                A passionate developer creating open-source tools to empower businesses worldwide.
                Open ERP is built with love, late nights, and lots of coffee.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://github.com/ErickGBR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <GitBranch className="w-5 h-5" />
                  ErickGBR
                </a>
                <a
                  href="https://github.com/ErickGBR/run-mvp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Project Repository
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-12 glow-cyan">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Join the Open ERP community
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Start using Open ERP today. It&apos;s free, open-source, and built for businesses like yours.
              </p>
              <Link
                href="/auth"
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
