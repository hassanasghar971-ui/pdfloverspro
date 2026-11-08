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
    let alive = true;
    setGpc(hasGpc());
    // Strict regions (and unknown ones) see the banner at once; other regions only via the footer button.
    void resolveMode().then((mode) => {
      if (alive && mode === 'opt-in' && getDecision() === null) setOpen(true);
    });
    const onOpen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      alive = false;
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  const choose = useCallback((value: ConsentValue) => {
    setDecision(value);
    setOpen(false);
  }, []);

  if (!open) return null;

  const buttonBase =
    'min-h-[44px] flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold sm:flex-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900';

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
            Ads and cookies
          </p>
          <p id="plp-consent-text" className="mt-1 text-sm leading-relaxed text-slate-600">
            This site shows third-party ads (Adsterra) to stay free, and those ads may use cookies or
            similar identifiers. Choose Accept to allow ads, or Reject to use the tools without ads.
            Your PDF files are processed in your browser either way.
            {gpc
              ? ' Your browser sends a Global Privacy Control signal, so ads stay off unless you choose Accept.'
              : ''}{' '}
            You can change your choice at any time from Cookie settings. See the{' '}
            <Link href="/privacy-policy" className="font-medium text-slate-900 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose('denied')}
            className={`${buttonBase} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className={`${buttonBase} border border-slate-900 bg-slate-900 text-white hover:bg-slate-800`}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
