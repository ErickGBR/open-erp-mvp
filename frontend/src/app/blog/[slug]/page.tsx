import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, Tag, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/data/blog-posts';

/**
 * Props for the individual blog post page.
 */
interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Individual blog post page — displays full article content with metadata,
 * navigation back to blog listing, and neon theme styling.
 *
 * Uses async params as required by Next.js 16 (breaking change from v15).
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Convert plain text content to rich paragraphs
  const paragraphs = post.content
    .split('\n\n')
    .filter(Boolean)
    .map((block) => {
      // Handle h2 headers
      if (block.startsWith('## ')) {
        const title = block.replace('## ', '');
        return { type: 'h2' as const, content: title };
      }
      // Handle list items (lines starting with - or *)
      if (block.includes('\n- ') || block.includes('\n* ')) {
        const lines = block.split('\n').filter(Boolean);
        const items = lines
          .filter((l) => l.startsWith('- ') || l.startsWith('* '))
          .map((l) => l.replace(/^[-*]\s/, ''));
        return { type: 'list' as const, content: items };
      }
      // Regular paragraph
      return { type: 'p' as const, content: block };
    });

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Header bar */}
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-[#0a0a12]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a12]/80">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Package className="h-5 w-5 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Open ERP
            </span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Floating orbs background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb-cyan w-[400px] h-[400px] -top-48 -right-48 animate-[orbFloat_12s_ease-in-out_infinite]" />
          <div className="orb-blue w-[300px] h-[300px] -bottom-32 -left-32 animate-[orbFloat_15s_ease-in-out_infinite_reverse]" />
        </div>

        <article className="relative max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Post header */}
          <header className="mb-12">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="text-slate-600">
                by <span className="text-slate-400 font-medium">{post.author}</span>
              </span>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-transparent" />
          </header>

          {/* Post content */}
          <div className="prose prose-invert max-w-none space-y-6">
            {paragraphs.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={index}
                    className="text-2xl font-bold text-white mt-12 mb-4"
                  >
                    {block.content}
                  </h2>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul key={index} className="space-y-2 my-4">
                    {block.content.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <span className="text-cyan-400 mt-1.5 shrink-0">
                          <span className="block w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-slate-300 leading-relaxed text-lg">
                  {block.content}
                </p>
              );
            })}
          </div>

          {/* Footer divider */}
          <div className="mt-16 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          {/* Back to blog */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/10 bg-[#0a0a12]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <Package className="h-5 w-5 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Open ERP
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Open ERP. Built with{' '}
              <span className="text-cyan-400 mx-1">❤</span> by{' '}
              <a
                href="https://github.com/ErickGBR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
              >
                kdh
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
