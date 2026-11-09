import type { NextConfig } from 'next';

const ADSTERRA = 'https://*.profitableratecpmnetwork.com https://bauval.org https://*.bauval.org https://show-sb.com https://*.show-sb.com https://cloudpiko.com https://*.cloudpiko.com https://show-creative1.com https://*.show-creative1.com';
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
  turbopack: {},
  webpack: (config) => {
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
