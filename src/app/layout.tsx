import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
import {
  SITE,
  LEGAL_PAGES,
  TOOL_COUNT,
  POPULAR_SLUGS,
  TOOLS_BY_SLUG,
} from '@/lib/tools-registry';
import { safeJson } from '@/lib/tool-view';
import SocialBarGate from '@/components/SocialBarGate';
import ConsentBanner, { CookieSettingsButton } from '@/components/ConsentBanner';
import AdDiagnostic from '@/components/AdDiagnostic';

const DEFAULT_TITLE = `${SITE.name}: ${TOOL_COUNT} Free PDF Tools in Your Browser`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.founder }],
  creator: SITE.founder,
  manifest: '/manifest.webmanifest',
  verification: { google: SITE.googleVerification },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    url: SITE.url,
    title: DEFAULT_TITLE,
    description: SITE.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: DEFAULT_TITLE,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e5322d',
  colorScheme: 'light',
};

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  founder: { '@type': 'Person', name: SITE.founder },
  email: SITE.email,
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
};

function popularTools() {
  return POPULAR_SLUGS.map((slug) => TOOLS_BY_SLUG[slug]).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const popular = popularTools();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-lift"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-extrabold text-white"
              >
                P
              </span>
              <span className="text-base font-bold tracking-tight">{SITE.name}</span>
            </Link>
            <nav aria-label="Main" className="flex items-center gap-2">
              <Link href="/#all-tools" className="btn btn-ghost">
                All tools
              </Link>
              <Link href="/contact-us" className="btn btn-primary">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-16 border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
            <div>
              <p className="text-base font-bold">{SITE.name}</p>
              <p className="mt-2 text-sm text-slate-600">{SITE.tagline}</p>
              <p className="mt-3 text-sm text-slate-600">
                Files are processed in your browser and are not uploaded to our servers.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Popular tools
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {popular.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className="text-slate-700 hover:text-brand-600">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Company
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {LEGAL_PAGES.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="text-slate-700 hover:text-brand-600">
                      {p.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookieSettingsButton className="text-left text-slate-700 hover:text-brand-600" />
                </li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                {SITE.founderTitle}: {SITE.founder}
              </p>
              <p className="mt-1 text-sm">
                <a href={`mailto:${SITE.email}`} className="text-slate-700 hover:text-brand-600">
                  {SITE.email}
                </a>
              </p>
              {SITE.whatsappPrimary && (
                <p className="mt-1 text-sm">
                  <a
                    href={SITE.whatsappPrimaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-brand-600"
                  >
                    WhatsApp: {SITE.whatsappPrimary}
                  </a>
                </p>
              )}
              {SITE.whatsappSecondary && (
                <p className="mt-1 text-sm">
                  <a
                    href={SITE.whatsappSecondaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-brand-600"
                  >
                    WhatsApp: {SITE.whatsappSecondary}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(WEBSITE_JSON_LD) }}
        />

        <SocialBarGate />
        <ConsentBanner />
        <AdDiagnostic />
      </body>
    </html>
  );
}
