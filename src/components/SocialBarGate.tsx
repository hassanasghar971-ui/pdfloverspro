'use client';

import { useEffect } from 'react';
import { CONSENT_CHANGED_EVENT, adsAllowed, resolveMode } from '@/lib/consent';
import { GATED_SCRIPTS, injectScript, whenIdle, type GatedScript } from '@/lib/ads';

function readLoads(key: string): number {
  try {
    return Number(window.sessionStorage.getItem(key) || '0');
  } catch {
    return 0;
  }
}

function writeLoads(key: string, n: number): void {
  try {
    window.sessionStorage.setItem(key, String(n));
  } catch {
    // ignore
  }
}

// Despite the file name, this gate controls every gated ad script listed in src/lib/ads.ts.
export default function SocialBarGate() {
  useEffect(() => {
    let interactions = 0;
    const pending = new Set<string>();
    void resolveMode();

    const tryLoad = (u: GatedScript) => {
      if (pending.has(u.id) || !adsAllowed()) return;
      if (document.getElementById(u.id)) return;
      if (readLoads(u.countKey) >= u.maxLoads) return;
      pending.add(u.id);

      whenIdle(() => {
        pending.delete(u.id);
        // Re-check: consent or visibility may have changed while we waited.
        if (!adsAllowed()) return;
        if (document.visibilityState !== 'visible') return;
        if (document.getElementById(u.id)) return;
        const loads = readLoads(u.countKey);
        if (loads >= u.maxLoads) return;
        injectScript(u.id, u.src);
        writeLoads(u.countKey, loads + 1);
      });
    };

    const tryAll = () => {
      for (const u of GATED_SCRIPTS) {
        if (interactions >= u.interactionsNeeded) tryLoad(u);
      }
    };

    const onInteraction = () => {
      if (!adsAllowed()) return;
      interactions += 1;
      tryAll();
    };

    const onAction = () => {
      if (!adsAllowed()) return;
      interactions = Math.max(interactions, 2);
      tryAll();
    };

    const onConsent = () => {
      if (!adsAllowed()) {
        for (const u of GATED_SCRIPTS) document.getElementById(u.id)?.remove();
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
