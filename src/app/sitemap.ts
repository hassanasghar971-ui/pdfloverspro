import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/tools-registry';
import { isToolAvailable } from '@/lib/tool-availability';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

const LEGAL_PATHS = [
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-and-conditions',
  '/dmca-notice',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/+$/, '');

  const toolUrls = getAllSlugs()
    .filter((slug: string) => isToolAvailable(slug))
    .map((slug: string) => `${base}/tools/${slug}`);

  const urls = [
    `${base}/`,
    ...toolUrls,
    ...LEGAL_PATHS.map((path) => `${base}${path}`),
  ];

  return Array.from(new Set(urls)).map((url) => ({ url }));
}
