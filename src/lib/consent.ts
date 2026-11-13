import { useEffect, useState } from 'react';

export type ConsentValue = 'granted' | 'denied';
/** Retained for compatibility with existing diagnostics; ads always require opt-in. */
export type ConsentMode = 'opt-in' | 'opt-out';

const DECISION_KEY = 'plp_consent_v1';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const CONSENT_CHANGED_EVENT = 'plp:consent';
export const CONSENT_OPEN_EVENT = 'plp:consent-open';

function emit(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

/** A valid, unexpired affirmative decision must exist in localStorage. */
export function getDecision(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DECISION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { value?: unknown; ts?: unknown };
    if (
      (data.value !== 'granted' && data.value !== 'denied') ||
      typeof data.ts !== 'number' ||
      !Number.isFinite(data.ts) ||
      data.ts > Date.now() ||
      Date.now() - data.ts > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(DECISION_KEY);
      return null;
    }
    return data.value;
  } catch {
    // If storage is unavailable or malformed, fail closed. Memory state never grants ads.
    return null;
  }
}

export function setDecision(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DECISION_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // Storage failure must not grant ads; adsAllowed() will return false.
  }
  emit();
}

export function hasGpc(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** Region never changes the default-deny ad policy; compatibility helper only. */
export function getMode(): ConsentMode {
  return 'opt-in';
}

/** Kept for older callers, with no network request or geo-based ad behavior. */
export function resolveMode(): Promise<ConsentMode> {
  return Promise.resolve('opt-in');
}

/** The one ad decision rule: only a stored explicit grant may enable ads. */
export function adsAllowed(): boolean {
  return typeof window !== 'undefined' && getDecision() === 'granted' && !hasGpc();
}

export function useAdsAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () => setAllowed(adsAllowed());
    update();
    window.addEventListener(CONSENT_CHANGED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return allowed;
}

/** Read-only snapshot retained for diagnostics. */
export function consentSignals(): {
  mode: ConsentMode;
  decision: ConsentValue | null;
  gpc: boolean;
  allowed: boolean;
} {
  return { mode: getMode(), decision: getDecision(), gpc: hasGpc(), allowed: adsAllowed() };
}
