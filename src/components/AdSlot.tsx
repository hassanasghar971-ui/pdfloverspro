'use client';

import { useEffect, useRef } from 'react';
import { useAdsAllowed } from '@/lib/consent';

const CONTAINER_ID = 'container-8af9b4ea9bf1c8a1daa4e46faa003ae7';
const SCRIPT_SRC =
  'https://pl31646499.profitableratecpmnetwork.com/8af9b4ea9bf1c8a1daa4e46faa003ae7/invoke.js';
const SCRIPT_ID = 'adsterra-native-banner';

function whenIdle(cb: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => cb(), { timeout: 3000 });
  } else {
    window.setTimeout(cb, 1500);
  }
}

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
      if (cancelled || document.getElementById(SCRIPT_ID)) return;
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      document.body.appendChild(s);
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            whenIdle(load);
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(box);
    } else {
      whenIdle(load);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [allowed]);

  if (!allowed) return null;

  return (
    <aside aria-label="Advertisement" className={`mx-auto w-full max-w-3xl ${className}`}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-slate-400">
        Advertisement
      </p>
      <div id={CONTAINER_ID} ref={boxRef} style={{ minHeight: 280 }} />
    </aside>
  );
}
