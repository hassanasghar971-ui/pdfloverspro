'use client';

import { useEffect } from 'react';
import { CONSENT_CHANGED_EVENT, adsAllowed, resolveMode } from '@/lib/consent';

const SOCIAL_BAR_SRC =
  'https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js';
const SCRIPT_ID = 'adsterra-social-bar';
const COUNT_KEY = 'plp_sb_loads';
const MAX_LOADS_PER_SESSION = 2;
const INTERACTIONS_NEEDED = 2;

function readLoads(): number {
  try {
    return Number(window.sessionStorage.getItem(COUNT_KEY) || '0');
  } catch {
    return 0;
  }
}

function writeLoads(n: number): void {
  try {
    window.sessionStorage.setItem(COUNT_KEY, String(n));
  } catch {
    // ignore
  }
}

function whenIdle(cb: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => cb(), { timeout: 2000 });
  } else {
    window.setTimeout(cb, 800);
  }
}

export default function SocialBarGate() {
  useEffect(() => {
    let interactions = 0;
    let pending = false;
    void resolveMode();

    const tryLoad = () => {
      if (pending) return;
      if (!adsAllowed()) return;
      if (document.getElementById(SCRIPT_ID)) return;
      if (readLoads() >= MAX_LOADS_PER_SESSION) return;
      pending = true;

      whenIdle(() => {
        pending = false;
        if (!adsAllowed()) return;
        if (document.visibilityState !== 'visible') return;
        if (document.getElementById(SCRIPT_ID)) return;
        const loads = readLoads();
        if (loads >= MAX_LOADS_PER_SESSION) return;

        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = SOCIAL_BAR_SRC;
        s.async = true;
        s.setAttribute('data-cfasync', 'false');
        document.body.appendChild(s);
        writeLoads(loads + 1);
      });
    };

    const onInteraction = () => {
      if (!adsAllowed()) return;
      interactions += 1;
      if (interactions >= INTERACTIONS_NEEDED) tryLoad();
    };

    const onAction = () => tryLoad();

    const onConsent = () => {
      if (!adsAllowed()) {
        document.getElementById(SCRIPT_ID)?.remove();
        interactions = 0;
      }
    };

    window.addEventListener('pointerdown', onInteraction, { passive: true });
    window.addEventListener('keydown', onInteraction);
    window.addEventListener('plp:action', onAction);
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);
    return () => {
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      window.removeEventListener('plp:action', onAction);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
    };
  }, []);

  return null;
}
