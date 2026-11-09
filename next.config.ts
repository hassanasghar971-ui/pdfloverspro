import type { NextConfig } from 'next';

/* -----------------------------------------------------------------------------
 * Content-Security-Policy
 *
 * Every host below exists for a reason:
 *  - profitableratecpmnetwork.com, bauval.org & show-sb.com : Adsterra Social Bar + Native Banner / Scripts
 *  - cdn.jsdelivr.net             : pdf.js CMaps/fonts, tesseract.js worker + core
 *  - tessdata.projectnaptha.com   : tesseract.js language data (OCR)
 *  - cdnjs.cloudflare.com         : kept from the previous policy (probably unused)
 *
 * 'unsafe-inline' is required by Next.js inline bootstrap scripts and the
 * layout's gate script. 'unsafe-eval' is kept because third-party ad scripts
 * commonly need it. Tightening either one needs testing against live ads.
 *
 * If the browser console shows "Refused to ... because it violates the
 * Content Security Policy", add exactly that host to the matching directive.
 * -------------------------------------------------------------------------- */
const ADSTERRA = 'https://*.profitableratecpmnetwork.com https://bauval.org https://*.bauval.org https://show-sb.com https://*.show-sb.com';
const JSDELIVR = 'https://cdn.jsdelivr.net';
const TESSDATA = 'https://tessdata.projectnaptha.com';
const CDNJS = 'https://cdnjs.cloudflare.com';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${ADSTERRA} ${JSDELIVR}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  `connect-src 'self' blob: ${ADSTERRA} ${JSDELIVR} ${TESSDATA} ${CDNJS}`,
  `frame-src 'self' ${ADSTERRA}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Empty turbopack config so Next.js 16 accepts the custom webpack() below.
  turbopack: {},
  webpack: (config) => {
    // pdfjs-dist and tesseract.js reference the optional node "canvas" package.
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
