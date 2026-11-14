'use client';

import { useEffect } from 'react';
import { adsAllowed, CONSENT_CHANGED_EVENT } from '@/lib/consent';
import {
  GATED_SCRIPTS,
  injectScript,
  removeScript,
} from '@/lib/ads';

const ADSENSE_SCRIPT_ID = 'google-adsense-client';
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim();
const ADSENSE_SCRIPT_URL = ADSENSE_CLIENT
  ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
  : null;

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
      const load = () => {
        pending = false;
        if (!adsAllowed() || loaded) return;
        const script = GATED_SCRIPTS[0];
        if (!script) return;
        injectScript(script.id, script.src);
        loaded = true;
      };

      const requestIdleCallback = window.requestIdleCallback;
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback.call(window, load, { timeout: 2000 });
      } else {
        window.setTimeout(load, 0);
      }
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
