import Link from 'next/link';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_MAP, POPULAR_TOOLS, TOOLS_BY_SLUG, Tool } from '@/lib/tools-registry';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center py-8 sm:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
          Free, Private PDF Tools That Run In Your Browser
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Process your PDF documents locally without uploading them to any server. Fast, secure, and 100% free.
        </p>
      </section>

      {/* Popular Tools Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Popular Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_TOOLS.map((slug) => {
            const tool = TOOLS_BY_SLUG[slug];
            if (!tool) return null;
            return (
              <Link
                key={tool.slug}
                href={tool.path}
                className="card card-hover flex flex-col justify-between p-5 transition-all"
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl font-bold text-brand-700 mb-3">
                    {tool.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{tool.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{tool.metaDescription}</p>
                </div>
                <span className="mt-4 text-xs font-medium text-brand-600">Use tool →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Categories & Tools Section */}
      <section id="all-tools" className="mt-16 space-y-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">All PDF Tools by Category</h2>
          <p className="mt-1 text-slate-600">Explore our complete collection of 42 browser-based PDF utilities.</p>
        </div>

        {CATEGORY_ORDER.map((catId) => {
          const category = CATEGORIES[catId];
          if (!category) return null;
          
          // Get tools belonging to this category
          const categoryTools = Object.values(TOOLS_BY_SLUG).filter((t: Tool) => t.category === catId);
          if (categoryTools.length === 0) return null;

          return (
            <div key={catId} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                  <p className="text-sm text-slate-600">{category.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTools.map((tool: Tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.path}
                    className="card card-hover flex items-start gap-3 p-4 transition-all"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-700">
                      {tool.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900 truncate">{tool.name}</span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-600">{tool.metaDescription}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
