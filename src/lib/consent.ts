import { useEffect, useState } from 'react';

export type ConsentValue = 'granted' | 'denied';

/** Retained for compatibility with callers; ads always require explicit opt-in. */
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

/**
 * Returns only a valid, unexpired choice stored in localStorage.
 * Missing, malformed, expired, or inaccessible storage always means no consent.
 */
export function getDecision(): ConsentValue | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DECISION_KEY);
    if (!raw) return null;

    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    const record = data as { value?: unknown; ts?: unknown };
    const now = Date.now();

    if (
      (record.value !== 'granted' && record.value !== 'denied') ||
      typeof record.ts !== 'number' ||
      !Number.isFinite(record.ts) ||
      record.ts > now ||
      now - record.ts > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(DECISION_KEY);
      return null;
    }

    return record.value;
  } catch {
    // Fail closed if storage is blocked or the saved value cannot be read.
    return null;
  }
}

/**
 * Saves the visitor's choice. If storage is unavailable, the choice is not
 * treated as persistent consent and ads remain disabled.
 */
export function setDecision(value: ConsentValue): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      DECISION_KEY,
      JSON.stringify({ value, ts: Date.now() }),
    );
  } catch {
    // Fail closed: adsAllowed() requires a readable stored affirmative choice.
  }

  emit();
}

export function hasGpc(): boolean {
  if (typeof navigator === 'undefined') return false;

  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

/** Compatibility helper; region classification never grants ad consent. */
export function getMode(): ConsentMode {
  return 'opt-in';
}

/** Compatibility helper; does not make a network request or affect consent. */
export function resolveMode(): Promise<ConsentMode> {
  return Promise.resolve('opt-in');
}

/** Ads are allowed only after an affirmative choice has been stored. */
export function adsAllowed(): boolean {
  return typeof window !== 'undefined' && getDecision() === 'granted';
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

/** Read-only snapshot retained for existing diagnostics. */
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
