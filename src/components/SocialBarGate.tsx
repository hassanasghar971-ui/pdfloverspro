'use client';

import { useEffect } from 'react';
import { adsAllowed, CONSENT_CHANGED_EVENT } from '@/lib/consent';
import {
  GATED_SCRIPTS,
  adsDebug,
  bumpCount,
  injectScript,
  readCount,
  removeScript,
  whenIdle,
} from '@/lib/ads';

export default function SocialBarGate() {
  useEffect(() => {
    let interactions = 0;
    const loaded = new Set<string>();
    const pending = new Set<string>();

    const tryLoad = () => {
      if (!adsAllowed()) {
        adsDebug('social bar: ads not allowed (consent / region / GPC)');
        return;
      }
      if (document.visibilityState !== 'visible') {
        adsDebug('social bar: tab not visible');
        return;
      }
      for (const s of GATED_SCRIPTS) {
        if (loaded.has(s.id) || pending.has(s.id)) continue;
        if (interactions < s.interactionsNeeded) {
          adsDebug(`social bar: waiting for interactions (${interactions}/${s.interactionsNeeded})`);
          continue;
        }
        if (readCount(s.countKey) >= s.maxLoads) {
          adsDebug('social bar: session cap reached for', s.id);
          continue;
        }
        pending.add(s.id);
        whenIdle(() => {
          pending.delete(s.id);
          if (!adsAllowed()) return;
          injectScript(s.id, s.src);
          bumpCount(s.countKey);
          loaded.add(s.id);
        });
      }
    };

    const onInteraction = () => {
      interactions += 1;
      tryLoad();
    };
    const onAction = () => {
      interactions = Math.max(interactions, 2);
      tryLoad();
    };
    const onConsent = () => {
      if (!adsAllowed()) {
        for (const s of GATED_SCRIPTS) removeScript(s.id);
        loaded.clear();
        pending.clear();
        adsDebug('social bar: consent withdrawn, script removed (reload to remove the bar itself)');
      } else {
        tryLoad();
      }
    };

    window.addEventListener('pointerdown', onInteraction, { passive: true });
    window.addEventListener('keydown', onInteraction);
    window.addEventListener('plp:action', onAction);
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);
    document.addEventListener('visibilitychange', tryLoad);

    return () => {
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      window.removeEventListener('plp:action', onAction);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
      document.removeEventListener('visibilitychange', tryLoad);
    };
  }, []);

  return null;
}
