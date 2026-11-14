const HOME_URL = `${SITE.url}/`;

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
