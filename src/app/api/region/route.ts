import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Countries where we ask BEFORE any ad loads: EU/EEA, UK and Crown dependencies, Switzerland.
// A starting point, not legal advice. Unknown country also means "ask first".
const OPT_IN = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'JE', 'GG', 'IM',
  'CH',
  'GP', 'MQ', 'GF', 'RE', 'YT', 'AX',
]);

export function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const mode = country && !OPT_IN.has(country) ? 'opt-out' : 'opt-in';
  return NextResponse.json({ mode }, { headers: { 'Cache-Control': 'private, no-store' } });
}
