/**
 * Blog post data model and content collection.
 * All posts are statically defined for the MVP landing pages.
 */

/**
 * Represents a single blog post with full content.
 */
export interface BlogPost {
  /** URL-friendly slug identifier */
  slug: string;
  /** Post headline */
  title: string;
  /** Short description shown in listing cards */
  excerpt: string;
  /** Full markdown-like body content */
  content: string;
  /** Publication date string */
  date: string;
  /** Estimated reading time */
  readTime: string;
  /** Category or topic tags */
  tags: string[];
  /** Post author name */
  author: string;
}

/**
 * Static collection of blog posts for the MVP blog section.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started with Open ERP',
    excerpt:
      'Learn how to set up your first products, customers, and sales in minutes.',
    content: `Open ERP is designed to be intuitive and easy to set up. Whether you're a small business owner or managing a growing team, getting started takes just a few steps.

## 1. Create Your Account

Sign up at app.runmvp.com with your email address. You'll be guided through a quick onboarding flow to set up your company profile.

## 2. Add Your First Products

Navigate to the Products section and click "New Product". Fill in the name, description, price, and initial stock quantity. You can organize products by categories and set reorder points to automate inventory management.

## 3. Import or Add Customers

Go to Customers and start building your client database. You can add customers individually or import them via CSV. Each customer profile stores contact information, purchase history, and notes.

## 4. Create Your First Sale

Head to Sales and click "New Sale". Select a customer, add products, and generate an invoice. Open ERP automatically updates inventory levels and creates payment records.

## 5. Explore Reports

Use the Reports dashboard to track revenue, top-selling products, and customer activity. All data is updated in real-time, giving you actionable insights at a glance.

That's it! You're now ready to run your business with Open ERP.`,
    date: 'July 8, 2026',
    readTime: '5 min read',
    tags: ['Guide', 'Getting Started'],
    author: 'kdh',
  },
  {
    slug: 'why-open-source-erp',
    title: 'Why Open Source ERP?',
    excerpt:
      'Discover the benefits of choosing an open-source ERP system for your business.',
    content: `Choosing the right ERP system is one of the most important decisions a growing business can make. Here's why open source is the superior choice.

## Full Control Over Your Data

With proprietary ERP solutions, your data lives in someone else's infrastructure. Open ERP gives you complete control. Self-host on your own servers, or use our cloud — the choice is yours.

## No Vendor Lock-In

Proprietary systems make it difficult and expensive to switch providers. Open source means you own the software. You can modify it, extend it, or migrate it as your needs evolve.

## Community-Driven Innovation

Open source software benefits from contributions by developers worldwide. Bugs are found and fixed faster, features are added by the community, and the software improves continuously.

## Cost-Effective Scaling

Enterprise ERP systems often charge per-user fees that grow exponentially with your team. Open ERP is free to use, with no per-seat licensing. You only pay for the infrastructure you need.

## Transparency and Security

When the source code is open, security vulnerabilities can be identified and patched quickly. There are no hidden backdoors or opaque data practices. Every line of code is auditable.

## Built for Modern Businesses

Open ERP combines the power of traditional ERP with modern technologies: real-time analytics, responsive design, and a clean, intuitive interface that your team will actually enjoy using.

Ready to take control of your business operations? Get started with Open ERP today.`,
    date: 'July 5, 2026',
    readTime: '4 min read',
    tags: ['Open Source', 'Business'],
    author: 'kdh',
  },
  {
    slug: 'neon-dark-theme',
    title: 'Introducing the Neon Dark Theme',
    excerpt:
      'Check out our new VS Code-inspired design with glassmorphism and neon effects.',
    content: `We're excited to unveil Open ERP's new visual identity — a neon dark theme inspired by modern code editors and cyberpunk aesthetics.

## Design Philosophy

We believe enterprise software doesn't have to be boring. Our new design combines readability with visual flair, creating an interface that's both functional and delightful to use.

## Glassmorphism Cards

Each card and panel features a semi-transparent background with backdrop blur, creating a layered depth effect. The subtle borders glow with cyan and blue accents, making content sections feel tactile and premium.

## Neon Accents

Cyan and blue gradients provide visual hierarchy and guide attention to important elements. Buttons, badges, and active states use soft neon glows that respond to interaction, giving the interface a living, responsive feel.

## VS Code-Inspired Dark Background

The deep navy-black background (#0a0a12) reduces eye strain during long work sessions, just like your favorite code editor. High-contrast text on dark surfaces ensures readability without harsh brightness.

## Smooth Animations

Floating orbs, hover glows, and subtle transitions add polish without sacrificing performance. Every animation is optimized for 60fps and respects reduced-motion preferences.

## Accessibility First

Despite the bold visual style, we maintain WCAG 2.1 AA compliance with proper contrast ratios, clear typography, and full keyboard navigation support.

Experience the new look yourself — sign up for Open ERP and see your data in a whole new light.`,
    date: 'July 1, 2026',
    readTime: '3 min read',
    tags: ['Design', 'Update'],
    author: 'kdh',
  },
];

/**
 * Retrieves a blog post by its slug.
 *
 * @param slug - The URL slug of the post to find
 * @returns The matching BlogPost, or undefined if not found
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
