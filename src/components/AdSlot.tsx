'use client';

import { useEffect, useRef, useState } from 'react';
import { NATIVE_BANNER } from '@/lib/ads';
import { useAdsAllowed } from '@/lib/consent';

type AdSlotProps = {
  className?: string;
};

function readDebugFlag(): boolean {
  try {
    if (window.location.search.indexOf('addiag=1') !== -1) return true;
    return window.localStorage.getItem('plp_addiag') === '1';
  } catch {
    return false;
  }
}

function wasRequested(): boolean {
  try {
    return performance
      .getEntriesByType('resource')
      .some((entry) => entry.name.indexOf(NATIVE_BANNER.src) !== -1);
  } catch {
    return false;
  }
}

export default function AdSlot({ className = '' }: AdSlotProps) {
  const allowed = useAdsAllowed();
  const [box, setBox] = useState<HTMLElement | null>(null);
  const [debug, setDebug] = useState(false);
  const [stateText, setStateText] = useState('waiting (not in view yet)');
  const startedRef = useRef(false);

  useEffect(() => {
    setDebug(readDebugFlag());
  }, []);

  useEffect(() => {
    if (!allowed || !box) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let fallbackTimer: number | undefined;
    let checkTimer: number | undefined;

    const report = (state: string, text: string) => {
      box.setAttribute('data-ad-state', state);
      setStateText(text);
    };

    const checkFill = () => {
      if (cancelled) return;
      const container = document.getElementById(NATIVE_BANNER.containerId);
      const filled =
        !!container &&
        (container.children.length > 0 ||
          container.querySelector('iframe') !== null ||
          (container.textContent || '').trim().length > 0);
      const requested = wasRequested();
      if (filled) {
        report('filled', 'filled (ad is showing), requested: ' + (requested ? 'yes' : 'no'));
      } else {
        report(
          'no-fill',
          'script ran but container still empty after 8s (no-fill or unit not approved), requested: ' +
            (requested ? 'yes' : 'no')
        );
      }
    };

    const load = () => {
      if (cancelled || startedRef.current) return;
      if (document.getElementById(NATIVE_BANNER.scriptId)) {
        startedRef.current = true;
        report('loading', 'script tag already in page');
        return;
      }
      startedRef.current = true;
      report('loading', 'injecting script...');

      const container = box.querySelector('#' + NATIVE_BANNER.containerId);

      const script = document.createElement('script');
      script.id = NATIVE_BANNER.scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = NATIVE_BANNER.src;
      script.onload = () => {
        report('loaded', 'script loaded, waiting for ad (8s check)...');
        checkTimer = window.setTimeout(checkFill, 8000);
      };
      script.onerror = () => {
        report(
          'error',
          'script request FAILED (ad blocker, Brave Shields, private DNS or network)'
        );
      };

      // Same order as the official snippet: script first, container after it.
      if (container && container.parentNode === box) {
        box.insertBefore(script, container);
      } else {
        box.appendChild(script);
      }
    };

    if (typeof window.IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            observer = null;
            load();
          }
        },
        { rootMargin: '300px 0px' }
      );
      observer.observe(box);
    } else {
      fallbackTimer = window.setTimeout(load, 3000);
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      if (checkTimer !== undefined) window.clearTimeout(checkTimer);

      const script = document.getElementById(NATIVE_BANNER.scriptId);
      if (script && script.parentNode) script.parentNode.removeChild(script);

      const container = document.getElementById(NATIVE_BANNER.containerId);
      if (container) container.innerHTML = '';

      startedRef.current = false;
    };
  }, [allowed, box]);

  if (!allowed) return null;

  return (
    <aside
      ref={setBox}
      aria-label="Advertisement"
      data-ad-state="waiting"
      className={className}
    >
      <p className="mb-1 text-center text-xs uppercase tracking-wide text-slate-600">
        Advertisement
      </p>
      {debug ? (
        <p className="mb-1 text-center text-xs text-slate-700">
          AdSlot state: {stateText}
        </p>
      ) : null}
      <div id={NATIVE_BANNER.containerId} style={{ minHeight: 280 }} />
    </aside>
  );
}
