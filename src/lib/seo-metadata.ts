import type { Metadata } from 'next';
import { SITE } from './tools-registry';
import { SITE_URL } from './site-url';

const DEFAULT_TITLE = `${SITE.name}: Free PDF Tools in Your Browser`;
const DEFAULT_DESCRIPTION =
  'Free online PDF tools that open your files in your own browser. Merge, split, compress, convert and edit PDFs without an account.';

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE.name,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: 'Hassan Asghar' }],
  creator: 'Hassan Asghar',
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  verification: { google: SITE.googleVerification },
};
