import type { MetadataRoute } from "next";
import { getAvailableToolSlugs } from "@/lib/tool-availability";
import { LEGAL_PAGES } from "@/lib/tools-registry";
import { TOOL_CONTENT } from "@/lib/tool-content";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

const BASE_URL = SITE_URL;

/*
 * lastmod rules: Google only trusts this field if it changes when the page
 * really changes. Never use new Date() here, because that would stamp every
 * page with the build time on each deploy. Never use a date in the future.
 *
 * - DEFAULT_LASTMOD: pages that have not been touched since launch.
 * - REWRITE_LASTMOD: the day the hand-written content in tool-content.ts and
 *   the new home page went live. Leave it alone unless that content changes.
 * - LEGAL_LASTMOD: change per page only when that page's text changes.
 */
const DEFAULT_LASTMOD = "2026-01-15";
const REWRITE_LASTMOD = "2026-01-15";
const LEGAL_LASTMOD: Record<string, string> = {
  "privacy-policy": "2026-01-15",
  "terms-and-conditions": "2026-01-15",
  "dmca-notice": "2026-01-15",
  "about-us": "2026-01-15",
  "contact-us": "2026-01-15",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(REWRITE_LASTMOD),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = getAvailableToolSlugs().map((slug) => {
    const hasHandWrittenContent = slug in TOOL_CONTENT;
    return {
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: new Date(hasHandWrittenContent ? REWRITE_LASTMOD : DEFAULT_LASTMOD),
      changeFrequency: "monthly",
      priority: hasHandWrittenContent ? 0.9 : 0.7,
    };
  });

  // Built from the slug, the same way the footer links are built in layout.tsx.
  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map(({ slug }) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(LEGAL_LASTMOD[slug] ?? DEFAULT_LASTMOD),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...home, ...toolPages, ...legalPages];
}
