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
let cachedMode: ConsentMode | null = null;
let modePromise: Promise<ConsentMode> | null = null;

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
    if (
      (data.value !== 'granted' && data.value !== 'denied') ||
      typeof data.ts !== 'number' ||
      !Number.isFinite(data.ts) ||
      data.ts > Date.now() ||
      Date.now() - data.ts > MAX_AGE_MS

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
    return data.value;
  } catch {
    // If storage is unavailable or malformed, fail closed. Memory state never grants ads.

    return record.value;
  } catch {
    // Missing or inaccessible storage never counts as consent.
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
    // If consent cannot be stored, adsAllowed() will fail closed.
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
export function getMode(): ConsentMode | null {
  if (typeof window === 'undefined') return null;
  if (cachedMode) return cachedMode;

  try {
    const stored = window.sessionStorage.getItem(MODE_KEY);
    if (stored === 'opt-in' || stored === 'opt-out') {
      cachedMode = stored;
      return stored;
    }
  } catch {
    // No stored region decision; resolve it below.
  }

  return null;
}

/**
 * Resolves the regional banner policy. Any network, response, or parsing
 * failure uses opt-in: the banner is shown and ads remain blocked.
 */
export function resolveMode(): Promise<ConsentMode> {
  const knownMode = getMode();
  if (knownMode) return Promise.resolve(knownMode);
  if (modePromise) return modePromise;

  modePromise = (async () => {
    let mode: ConsentMode = 'opt-in';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('/api/region', {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.ok) {
        const data = (await response.json()) as { mode?: unknown };
        if (data.mode === 'opt-in' || data.mode === 'opt-out') {
          mode = data.mode;
        }
      }
    } catch {
      // Keep the safer opt-in default.
    } finally {
      window.clearTimeout(timeout);
    }

    cachedMode = mode;

    try {
      window.sessionStorage.setItem(MODE_KEY, mode);
    } catch {
      // Keep the in-memory mode for this page view.
    }

    emit();
    return mode;
  })();

  return modePromise;
}

/**
 * EU/selected-state opt-in: requires an explicit stored grant.
 * Other regions: ads may load by default, unless the visitor rejected or
 * their browser sends Global Privacy Control.
 * Unknown region: fail closed until the region check resolves.
 */
export function adsAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  const mode = getMode();
  if (!mode || hasGpc()) return false;

  const decision = getDecision();
  if (decision === 'denied') return false;
  if (mode === 'opt-in') return decision === 'granted';

  return true;
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
