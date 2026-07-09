'use client';

import Link from 'next/link';
import { CalendarDays, Clock, ArrowRight, Sparkles, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts } from '@/data/blog-posts';

/**
 * Blog listing page — displays all blog posts as glass cards with
 * title, excerpt, date, read time, and tags. Neon theme throughout.
 */
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb-cyan w-[500px] h-[500px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]" />
        <div className="orb-blue w-[400px] h-[400px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]" />
        <div className="orb-cyan w-[300px] h-[300px] top-1/2 left-1/2 animate-[orbFloat_10s_ease-in-out_infinite_2s]" />
      </div>

      <main className="relative z-10">
        <Header landing />

        {/* ── HERO ── */}
        <section className="relative min-h-[50vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Insights, guides &amp; updates</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent gradient-sweep">
                Blog
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Product updates, guides, and thoughts on open-source ERP.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
        </section>

        {/* ── POSTS ── */}
        <section className="py-12 px-4 pb-32">
          <div className="max-w-4xl mx-auto space-y-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card rounded-xl p-8 glow-cyan group hover:glow-blue transition-all duration-500 block"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-400 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all shrink-0">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
