import { Package } from 'lucide-react';
import Link from 'next/link';

/**
 * Footer component for the landing page with logo, description, link sections, and copyright.
 * Styled with the neon cyan/blue dark theme.
 */
export default function Footer() {
  const linkSections = [
    {
      title: 'Products',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Inventory', href: '#' },
        { label: 'Sales', href: '/dashboard/sales' },
        { label: 'Reports', href: '#' },
      ],
    },
    {
      title: 'Customers',
      links: [
        { label: 'All Customers', href: '/dashboard/customers' },
        { label: 'Analytics', href: '#' },
        { label: 'Support', href: '#' },
      ],
    },
    {
      title: 'Sales',
      links: [
        { label: 'New Sale', href: '/dashboard/sales/new' },
        { label: 'Invoices', href: '#' },
        { label: 'Payments', href: '#' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Our Story', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-cyan-500/10 bg-[#0a0a12]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo + description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Package className="h-6 w-6 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Open ERP
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              Open-source Enterprise Resource Planning system. Streamline your business operations
              with a modern, extensible platform.
            </p>
          </div>

          {/* Link sections */}
          {linkSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-300">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-8 pt-8 border-t border-cyan-500/10">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-4">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Docker', color: 'from-blue-400 to-blue-600' },
              { name: 'NestJS', color: 'from-red-400 to-red-600' },
              { name: 'Next.js', color: 'from-white to-gray-300' },
              { name: 'React', color: 'from-cyan-400 to-blue-500' },
              { name: 'Tailwind', color: 'from-teal-400 to-cyan-500' },
              { name: 'DeepSeek', color: 'from-yellow-400 to-orange-500' },
              { name: 'VS Code', color: 'from-blue-400 to-indigo-500' },
              { name: 'PostgreSQL', color: 'from-blue-500 to-indigo-600' },
              { name: 'TypeScript', color: 'from-blue-400 to-blue-600' },
              { name: 'TypeORM', color: 'from-orange-400 to-red-500' },
            ].map((tech) => (
              <span
                key={tech.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  bg-white/5 border border-cyan-500/10 text-slate-300
                  hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 
                  hover:border-cyan-500/30 hover:text-white transition-all duration-300"
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${tech.color}`} />
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-cyan-500/10 pt-8">
          <p className="text-center text-sm text-slate-500">
            &copy; 2026 Open ERP. Built with{' '}
            <span className="text-cyan-400 mx-1">❤</span>{' '}
            by{' '}
            <a 
              href="https://github.com/ErickGBR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-cyan-400 transition-colors"
            >
              kdh
            </a>
            {' '}|{' '}
            <a 
              href="https://github.com/ErickGBR/run-mvp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Source Code
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
