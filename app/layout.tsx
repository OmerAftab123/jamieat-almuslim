import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: 'Muslim Student Career and University Planner',
    template: '%s | Muslim Student Career and University Planner',
  },
  description:
    'Evidence-based research and decision support for Muslim students choosing degrees, careers, universities and funding. Every claim shows its source, date and confidence.',
  applicationName: 'Muslim Student Career and University Planner',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f5a4c',
};

const navItems = [
  { href: '/careers', label: 'Career explorer' },
  { href: '/universities', label: 'Universities' },
  { href: '/matcher', label: 'Free-study matcher' },
  { href: '/compare', label: 'Compare' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about', label: 'About' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              Jamieat Al-Muslim
            </Link>
            <nav aria-label="Main">
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <main id="main" className="container main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="container">
            <p>
              <strong>Educational research and decision support only.</strong> This site is not an admissions
              decision, a scholarship offer, individual financial advice, or a religious ruling (fatwa). For
              religious questions, consult a qualified scholar. Admission, funding and visa outcomes are never
              guaranteed.
            </p>
            <p>
              Data is versioned and dated. See the <Link href="/methodology">methodology and trust centre</Link>.
              Learn how to run or maintain this site in the repository&rsquo;s <code>docs/</code> folder.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
