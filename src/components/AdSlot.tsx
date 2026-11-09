'use client';

import { useEffect, useRef } from 'react';
import { useAdsAllowed } from '@/lib/consent';
import { NATIVE_BANNER, adsDebug, injectScript, removeScript, whenIdle } from '@/lib/ads';

export default function AdSlot({ className = '' }: { className?: string }) {
  const allowed = useAdsAllowed();
  const wrapRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!allowed) {
      adsDebug('native banner: not allowed (consent denied, no choice in opt-in region, GPC, or region not resolved)');
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const load = () => {
      whenIdle(() => {
        if (cancelled) return;
        const container = document.getElementById(NATIVE_BANNER.containerId);
        if (!container) {
          adsDebug('native banner: container missing in DOM');
          return;
        }
        injectScript(NATIVE_BANNER.scriptId, NATIVE_BANNER.src, {
          parent: wrap,
          before: container,
        });
      });
    };

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            observer = null;
            adsDebug('native banner: near viewport, loading');
            load();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(wrap);
    } else {
      load();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      removeScript(NATIVE_BANNER.scriptId);
      const container = document.getElementById(NATIVE_BANNER.containerId);
      if (container) container.innerHTML = '';
    };
  }, [allowed]);

  if (!allowed) return null;

  return (
    <aside ref={wrapRef} aria-label="Advertisement" className={className}>
      <p className="mb-1 text-center text-xs text-slate-500">Advertisement</p>
      <div id={NATIVE_BANNER.containerId} style={{ minHeight: 280 }} />
    </aside>
  );
}
