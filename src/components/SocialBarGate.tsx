'use client';

import { useEffect } from 'react';
import { adsAllowed, CONSENT_CHANGED_EVENT } from '@/lib/consent';
import { GATED_SCRIPTS, injectScript, removeScript } from '@/lib/ads';

const ADSENSE_SCRIPT_ID = 'google-adsense-client';
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim();
const ADSENSE_SCRIPT_URL = ADSENSE_CLIENT
  ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
  : null;

type IdleCallbackFn = (callback: () => void, options?: { timeout: number }) => number;

function runWhenIdle(task: () => void): void {
  const idle = (window as unknown as { requestIdleCallback?: IdleCallbackFn }).requestIdleCallback;
  if (typeof idle === 'function') {
    idle.call(window, task, { timeout: 2000 });
  } else {
    setTimeout(task, 0);
  }
}

export default function SocialBarGate() {
  useEffect(() => {
    let interactions = 0;
    let pending = false;
    let loaded = false;

    const syncAdSense = () => {
      if (!adsAllowed()) {
        removeScript(ADSENSE_SCRIPT_ID);
        return;
      }
      if (ADSENSE_SCRIPT_URL && !document.getElementById(ADSENSE_SCRIPT_ID)) {
        const script = injectScript(ADSENSE_SCRIPT_ID, ADSENSE_SCRIPT_URL);
        script?.setAttribute('crossorigin', 'anonymous');
      }
    };

    const tryLoadAdsterraSocial = () => {
      if (!adsAllowed() || loaded || pending || interactions < 2) return;
      pending = true;
      runWhenIdle(() => {
        pending = false;
        if (!adsAllowed() || loaded) return;
        const script = GATED_SCRIPTS[0];
        if (!script) return;
        injectScript(script.id, script.src);
        loaded = true;
      });
    };

    const onInteraction = () => {
      interactions += 1;
      tryLoadAdsterraSocial();
    };

    const onConsent = () => {
      if (!adsAllowed()) {
        for (const script of GATED_SCRIPTS) removeScript(script.id);
        loaded = false;
        pending = false;
      } else {
        syncAdSense();
        tryLoadAdsterraSocial();
      }
    };

    syncAdSense();
    window.addEventListener('pointerdown', onInteraction, { passive: true });
    window.addEventListener('keydown', onInteraction);
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);
    window.addEventListener('storage', onConsent);

    return () => {
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
      window.removeEventListener('storage', onConsent);
      if (!adsAllowed()) {
        removeScript(ADSENSE_SCRIPT_ID);
        for (const script of GATED_SCRIPTS) removeScript(script.id);
      }
    };
  }, []);

  return null;
}
