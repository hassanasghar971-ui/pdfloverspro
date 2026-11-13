import type { MetadataRoute } from 'next';
import { getAvailableToolSlugs } from '@/lib/tool-availability';
import { LEGAL_PAGES } from '@/lib/tools-registry';

export const dynamic = 'force-static';

const BASE_URL = 'https://pdfloverspro.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [{ url: BASE_URL }];

  const toolPages: MetadataRoute.Sitemap = getAvailableToolSlugs().map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
  }));

  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map(({ slug }) => ({
    url: `${BASE_URL}/${slug}`,
  }));

  return [...home, ...toolPages, ...legalPages];
}
