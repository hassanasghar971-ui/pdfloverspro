import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CONSENT_REQUIRED_COUNTRIES = new Set([
  // European Union
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA, UK, Switzerland, and associated territories
  'IS', 'LI', 'NO', 'GB', 'JE', 'GG', 'IM', 'CH', 'GP', 'MQ', 'GF', 'RE', 'YT', 'AX',
]);

/**
 * States configured to show the consent choice before advertising.
 * Review and update this list with qualified privacy counsel as laws change.
 */
const CONSENT_REQUIRED_US_STATES = new Set([
  'CA', 'CO', 'CT', 'DE', 'MD', 'MN', 'MT', 'NE', 'NH', 'NJ', 'OR', 'TX',
]);

function regionCode(value: string | null): string {
  if (!value) return '';
  return value.trim().toUpperCase().split('-').at(-1) ?? '';
}

export function GET(request: Request) {
  const country = (request.headers.get('x-vercel-ip-country') ?? '').trim().toUpperCase();
  const region = regionCode(request.headers.get('x-vercel-ip-country-region'));

  // If location is missing or unrecognized, use the safer consent-required mode.
  const consentRequired =
    !country ||
    CONSENT_REQUIRED_COUNTRIES.has(country) ||
    (country === 'US' && CONSENT_REQUIRED_US_STATES.has(region));

  return NextResponse.json(
    { mode: consentRequired ? 'opt-in' : 'opt-out' },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
