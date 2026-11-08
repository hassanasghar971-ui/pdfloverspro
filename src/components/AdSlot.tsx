'use client';

import { useEffect, useRef } from 'react';
import { useAdsAllowed } from '@/lib/consent';
import { NATIVE_BANNER, injectScript, whenIdle } from '@/lib/ads';

// The container id is fixed by the network: use this component at most ONCE per page.
export default function AdSlot({ className = '' }: { className?: string }) {
  const allowed = useAdsAllowed();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allowed) return;
    const box = boxRef.current;
    if (!box) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const load = () => {
      if (cancelled || document.getElementById(NATIVE_BANNER.scriptId)) return;
      injectScript(NATIVE_BANNER.scriptId, NATIVE_BANNER.src);
    };

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            whenIdle(load, 3000);
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(box);
    } else {
      whenIdle(load, 3000);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.getElementById(NATIVE_BANNER.scriptId)?.remove();
    };
  }, [allowed]);

  if (!allowed) return null;

  return (
    <aside aria-label="Advertisement" className={`mx-auto w-full max-w-3xl ${className}`}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-slate-400">
        Advertisement
      </p>
      <div id={NATIVE_BANNER.containerId} ref={boxRef} style={{ minHeight: 280 }} />
    </aside>
  );
}
