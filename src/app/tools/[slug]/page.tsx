import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import ToolCard from '@/components/ToolCard';
import ToolRunner from '@/components/ToolRunner';
import { SITE, buildToolJsonLd, getAllSlugs, getTool } from '@/lib/tools-registry';
import { categoryInfo, contentGaps, getFaqs, getRelated, getSections, getSteps, safeJson, toCard } from '@/lib/tool-view';
import { isToolAvailable } from '@/lib/tool-availability';

export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: 'Tool not found', robots: { index: false } };

  const url = `${SITE.url}/tools/${tool.slug}`;
  const title = String(tool.metaTitle || `${tool.name} - Free Online`);
  const hasBrand = /pdf lovers/i.test(title);
  const keywords = Array.isArray(tool.keywords) ? (tool.keywords as unknown[]).map(String) : undefined;
  const robots = isToolAvailable(tool.slug) ? undefined : { index: false, follow: true };

  return {
    title: hasBrand ? { absolute: title } : title,
    description: tool.metaDescription,
    keywords,
    ...(robots ? { robots } : {}),
    alternates: { canonical: url },
    openGraph: { title, description: tool.metaDescription, url, type: 'website', siteName: SITE.name },
    twitter: { card: 'summary', title, description: tool.metaDescription },
  };
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const available = isToolAvailable(tool.slug);

  if (process.env.NODE_ENV !== 'production') {
    const gaps = contentGaps(tool);
    if (gaps.length > 0) console.warn(`[tool page] ${tool.slug}: ${gaps.join(', ')}`);
  }

  const category = categoryInfo(String(tool.category));
  const sections = available ? getSections(tool) : [];
  const steps = available ? getSteps(tool) : [];
  const faqs = available ? getFaqs(tool) : [];
  const related = getRelated(tool).map(toCard);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      {available ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(buildToolJsonLd(tool)) }} />
      ) : null}

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/#all-tools" className="hover:underline">
              {category.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-gray-900">
            {tool.name}
          </li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tool.h1 || tool.name}</h1>
        <p className="mt-2 text-lg text-gray-700">
          {available ? tool.metaDescription : 'This tool is not available yet.'}
        </p>
      </header>

      {available ? (
        <>
          <ToolRunner slug={tool.slug} />
          <AdSlot className="my-10" />
        </>
      ) : (
        <div role="status" className="card p-5">
          <p className="font-semibold">{tool.name} is not available at the moment.</p>
          <p className="mt-2 text-gray-700">
            The browser engine we use does not support this feature safely yet, so we have switched it off instead of
            giving you a file that does not work. Your files were not opened or uploaded. Please try one of the other
            tools below.
          </p>
          <p className="mt-3">
            <Link href="/#all-tools" className="font-semibold text-brand-600 hover:underline">
              Browse all available tools
            </Link>
          </p>
        </div>
      )}

      {sections.length > 0 && (
        <article className="seo-content">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </article>
      )}

      {steps.length > 0 && (
        <section className="seo-content mt-8" aria-labelledby="steps-heading">
          <h2 id="steps-heading">How to use {tool.name}</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={i}>
                {s.title ? <strong>{s.title}</strong> : null}
                {s.title && s.text ? ' - ' : null}
                {s.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-3 text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="card group p-4">
                <summary className="cursor-pointer list-none font-semibold marker:content-none">
                  <span className="flex items-start justify-between gap-3">
                    <span>{f.q}</span>
                    <span aria-hidden="true" className="shrink-0 text-brand-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-3 text-2xl font-bold">
            Related PDF tools
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
