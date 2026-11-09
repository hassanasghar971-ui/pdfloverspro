'use client';

import { useEffect, useRef, useState } from 'react';
import { NATIVE_BANNER } from '@/lib/ads';
import { useAdsAllowed } from '@/lib/consent';

type AdSlotProps = {
  className?: string;
};

export default function AdSlot({ className = '' }: AdSlotProps) {
  const allowed = useAdsAllowed();
  const [box, setBox] = useState<HTMLElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!allowed || !box) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let fallbackTimer: number | undefined;

    const setState = (state: string) => {
      box.setAttribute('data-ad-state', state);
    };

    const load = () => {
      if (cancelled || startedRef.current) return;
      if (document.getElementById(NATIVE_BANNER.scriptId)) {
        startedRef.current = true;
        return;
      }
      startedRef.current = true;
      setState('loading');

      const container = box.querySelector('#' + NATIVE_BANNER.containerId);

      const script = document.createElement('script');
      script.id = NATIVE_BANNER.scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = NATIVE_BANNER.src;
      script.onload = () => setState('loaded');
      script.onerror = () => setState('error');

      // Same order as the official snippet: script first, container after it.
      if (container && container.parentNode === box) {
        box.insertBefore(script, container);
      } else {
        box.appendChild(script);
      }
    };

    setState('waiting');

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
      <div
        id={NATIVE_BANNER.containerId}
        style={{ minHeight: 280 }}
      />
    </aside>
  );
}
