import { useEffect, useState } from 'react';

export type ConsentValue = 'granted' | 'denied';
/** Compatibility type retained for existing diagnostics. */
export type ConsentMode = 'opt-in' | 'opt-out';

const DECISION_KEY = 'plp_consent_v1';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const CONSENT_CHANGED_EVENT = 'plp:consent';
export const CONSENT_OPEN_EVENT = 'plp:consent-open';

function emit(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  }
}

/** A valid, unexpired affirmative decision must exist in localStorage. */
export function getDecision(): ConsentValue | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DECISION_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as { value?: unknown; ts?: unknown };
    const now = Date.now();

    if (
      (data.value !== 'granted' && data.value !== 'denied') ||
      typeof data.ts !== 'number' ||
      !Number.isFinite(data.ts) ||
      data.ts > now ||
      now - data.ts > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(DECISION_KEY);
      return null;
    }

    return data.value;
  } catch {
    // Missing, inaccessible, or malformed storage never counts as consent.
    return null;
  }
}

export function setDecision(value: ConsentValue): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      DECISION_KEY,
      JSON.stringify({ value, ts: Date.now() }),
    );
  } catch {
    // If consent cannot be stored, adsAllowed() fails closed.
  }

  emit();
}

export function hasGpc(): boolean {
  if (typeof navigator === 'undefined') return false;

  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

/** Region never changes the default-deny ad policy. */
export function getMode(): ConsentMode {
  return 'opt-in';
}

/** Kept for compatibility with older callers. */
export function resolveMode(): Promise<ConsentMode> {
  return Promise.resolve('opt-in');
}

/** The sole ad gate: only an explicit, unexpired grant enables ads, and GPC blocks them. */
export function adsAllowed(): boolean {
  return (
    typeof window !== 'undefined' &&
    getDecision() === 'granted' &&
    !hasGpc()
  );
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
  return {
    mode: getMode(),
    decision: getDecision(),
    gpc: hasGpc(),
    allowed: adsAllowed(),
  };
}
