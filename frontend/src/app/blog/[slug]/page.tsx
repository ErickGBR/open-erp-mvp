import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, Tag, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPostBySlug, blogPosts } from '@/data/blog-posts';

/**
 * Generate static params for all blog posts.
 */
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Individual blog post page — Vercel-inspired dark theme.
 * Uses async params as required by Next.js 16.
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content
    .split('\n\n')
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('## ')) {
        const title = block.replace('## ', '');
        return { type: 'h2' as const, content: title };
      }
      if (block.includes('\n- ') || block.includes('\n* ')) {
        const lines = block.split('\n').filter(Boolean);
        const items = lines
          .filter((l) => l.startsWith('- ') || l.startsWith('* '))
          .map((l) => l.replace(/^[-*]\s/, ''));
        return { type: 'list' as const, content: items };
      }
      return { type: 'p' as const, content: block };
    });

  return (
    <div className="min-h-screen bg-brand-base">
      {/* Header bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-brand-surface/95 backdrop-blur supports-[backdrop-filter]:bg-brand-surface/80">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Open ERP
            </span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb" style={{ width: '400px', height: '400px', top: '-200px', right: '-150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 70%)' }} />
          <div className="orb" style={{ width: '300px', height: '300px', bottom: '-150px', left: '-100px', animationDelay: '-7s', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%)' }} />
        </div>

        <article className="relative max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                    bg-primary-glow border border-primary/20 text-primary-light"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="text-text-muted">
                by <span className="text-text-secondary font-medium">{post.author}</span>
              </span>
            </div>
          </header>

          <div className="prose-custom space-y-6">
            {paragraphs.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2 key={index} className="text-2xl font-bold text-text-primary mt-10 mb-4">
                    {block.content}
                  </h2>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul key={index} className="space-y-2 text-text-secondary leading-relaxed list-disc pl-6">
                    {block.content.map((item, i) => (
                      <li key={i} className="text-lg">{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-text-secondary leading-relaxed text-lg">
                  {block.content}
                </p>
              );
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
