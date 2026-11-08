import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const OPT_IN = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'JE', 'GG', 'IM',
  'CH',
  'GP', 'MQ', 'GF', 'RE', 'YT', 'AX',
]);

const EXTRA_STRICT = new Set<string>([]);

export function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const strict = !country || OPT_IN.has(country) || EXTRA_STRICT.has(country);
  return NextResponse.json(
    { mode: strict ? 'opt-in' : 'opt-out' },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
