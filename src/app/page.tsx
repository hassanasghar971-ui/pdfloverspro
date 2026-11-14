import type { Metadata } from 'next';
import Link from 'next/link';
import NativeBanner from '@/components/NativeBanner';
import ToolCard from '@/components/ToolCard';
import ToolGrid from '@/components/ToolGrid';
import { POPULAR_SLUGS, SITE, TOOLS, TOOL_COUNT, getTool } from '@/lib/tools-registry';
import type { Tool } from '@/lib/tools-registry';
import { isToolAvailable } from '@/lib/tool-availability';
import { categoryIds, categoryInfo, safeJson, toCard } from '@/lib/tool-view';

// Rendered title stays under 60 characters.
const TITLE = `${SITE.name}: ${TOOL_COUNT} Free PDF Tools in Your Browser`;
const DESCRIPTION = `Merge, split, compress, convert, sign and edit PDFs with ${TOOL_COUNT} free tools. Files are processed in your browser and not uploaded to our servers. No sign-up.`;
const HOME_URL = `${SITE.url.replace(/\/+$/, '')}/`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: HOME_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: HOME_URL,
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

const STEPS = [
  { title: 'Pick a tool', text: 'Choose from merging, splitting, compressing, converting, signing and more.' },
  { title: 'Add your files', text: 'Drop them on the page. Your browser opens them; they are not sent to our servers.' },
  { title: 'Download the result', text: 'Save the new file, or a ZIP when a tool produces several. Memory is released when you finish.' },
];

const TRUST = [
  { title: 'Not uploaded', text: 'Files are opened by your browser, not sent to our servers.' },
  { title: 'No sign-up', text: 'Open a tool and use it. There is no account to create.' },
  { title: 'Free to use', text: 'Supported by third-party ads, which are labelled as such.' },
  { title: 'Honest limits', text: 'Large files depend on your device memory. Each tool page says what to expect.' },
];

export default function HomePage() {
  const cards = TOOLS.map(toCard);
  const categories = categoryIds().map(categoryInfo);
  const popular = POPULAR_SLUGS.map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t))
    .map(toCard);

  // Only indexable tools go into the structured list.
  const listed = TOOLS.filter((t) => isToolAvailable(t.slug));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} tools`,
    numberOfItems: listed.length,
    itemListElement: listed.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${SITE.url}/tools/${t.slug}`,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemList) }} />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-red-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Free PDF tools</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {TOOL_COUNT} PDF tools that run in your browser
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
            Merge, split, compress, convert, sign and edit PDF files. Your documents are opened by your browser on your
            own device and are not uploaded to our servers.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#all-tools"
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm motion-safe:transition hover:bg-red-700 motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Browse all tools
            </a>
            <Link
              href="/tools/merge-pdf"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 motion-safe:transition hover:border-red-600 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Merge PDF
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Trust strip */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="What to expect">
          {TRUST.map((t) => (
            <li key={t.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{t.title}</p>
              <p className="mt-1 text-sm text-slate-600">{t.text}</p>
            </li>
          ))}
        </ul>

        <section className="mt-12" aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="mb-4 text-2xl font-bold">
            Popular tools
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((t) => (
              <li key={t.slug} className="motion-safe:transition motion-safe:hover:-translate-y-0.5">
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>

        <div className="mx-auto mt-10 max-w-3xl">
          <NativeBanner />
        </div>

        <section id="all-tools" className="mt-12 scroll-mt-24" aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-4 text-2xl font-bold">
            All {TOOL_COUNT} tools
          </h2>
          <ToolGrid tools={cards} categories={categories.map((c) => ({ id: c.id, label: c.label }))} />
        </section>

        <section className="mt-14" aria-labelledby="how-heading">
          <h2 id="how-heading" className="mb-4 text-2xl font-bold">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="seo-content mt-14 max-w-3xl" aria-labelledby="private-heading">
          <h2 id="private-heading">Processed on your device</h2>
          <p>
            {SITE.name} uses your browser as the processing engine. When you add a file, your device opens it, changes
            it and hands the result back to you; there is no upload step and no account. Once a page has loaded, most
            tools keep working on a slow connection.
          </p>
          <p>
            Running locally has honest limits. Very large files depend on the memory your device has free, scanned
            documents need the OCR tool before their text can be searched, and conversions to and from Word, Excel and
            PowerPoint rebuild the content rather than copying every layout detail. Each tool page explains what to
            expect before you start.
          </p>
          <p>
            This site shows ads from third-party networks, which may set cookies of their own. They are separate from
            your documents. Details are in the <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
