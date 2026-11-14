'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  CONSENT_OPEN_EVENT,
  getDecision,
  hasGpc,
  resolveMode,
  setDecision,
  type ConsentValue,
} from '@/lib/consent';

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      Cookie settings / Do not sell or share my info
    </button>
  );
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    let active = true;

    setGpc(hasGpc());

    void resolveMode().then((mode) => {
      if (active && mode === 'opt-in' && getDecision() === null) {
        setOpen(true);
      }
    });

    const onOpen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);

    return () => {
      active = false;
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  const choose = useCallback((value: ConsentValue) => {
    setDecision(value);
    setOpen(false);
  }, []);

  if (!open) return null;

  const buttonBase =
    'min-h-[44px] rounded-lg px-5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="plp-consent-title"
      aria-describedby="plp-consent-text"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:flex-row sm:items-center sm:p-5">
        <div className="flex-1">
          <p id="plp-consent-title" className="text-sm font-bold text-slate-900">
            Support free PDF tools ☕
          </p>
          <p id="plp-consent-text" className="mt-1 text-sm leading-relaxed text-slate-600">
            Our PDF tools run 100% locally in your browser; your documents are not uploaded to our
            servers. Non-intrusive advertising helps keep the tools free and unlimited. Adsterra and,
            when configured, Google AdSense may use cookies or similar technologies. In this region,
            ads load only if you accept. You can change your choice any time in Cookie settings.
            {gpc ? ' Your browser also sends a Global Privacy Control signal.' : ''}{' '}
            See our{' '}
            <Link href="/privacy-policy" className="font-medium text-slate-900 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={() => choose('denied')}
            className={`${buttonBase} text-slate-700 underline underline-offset-2 hover:text-slate-950`}
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className={`${buttonBase} bg-amber-400 text-slate-950 shadow-sm hover:bg-amber-300`}
          >
            ☕ Accept &amp; Keep It Free
          </button>
        </div>
      </div>
    </div>
  );
}
