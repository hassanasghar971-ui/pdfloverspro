import { useEffect, useState } from 'react';

export type ConsentValue = 'granted' | 'denied';
export type ConsentMode = 'opt-in' | 'opt-out';

const DECISION_KEY = 'plp_consent_v1';
const MODE_KEY = 'plp_region_mode_v1';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const CONSENT_CHANGED_EVENT = 'plp:consent';
export const CONSENT_OPEN_EVENT = 'plp:consent-open';

let memoryDecision: ConsentValue | null = null;
let memoryMode: ConsentMode | null = null;
let modePromise: Promise<ConsentMode> | null = null;

function emit(): void {
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

export function getDecision(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DECISION_KEY);
    if (!raw) return memoryDecision;
    const data = JSON.parse(raw) as { value?: string; ts?: number };
    if (data.value !== 'granted' && data.value !== 'denied') return memoryDecision;
    if (typeof data.ts !== 'number' || Date.now() - data.ts > MAX_AGE_MS) return null;
    return data.value;
  } catch {
    return memoryDecision;
  }
}

export function setDecision(value: ConsentValue): void {
  memoryDecision = value;
  try {
    window.localStorage.setItem(DECISION_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // Storage blocked: the in-memory value still works for this visit.
  }
  emit();
}

export function hasGpc(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function getMode(): ConsentMode | null {
  if (typeof window === 'undefined') return null;
  if (memoryMode) return memoryMode;
  try {
    const v = window.sessionStorage.getItem(MODE_KEY);
    if (v === 'opt-in' || v === 'opt-out') {
      memoryMode = v;
      return v;
    }
  } catch {
    // ignore
  }
  return null;
}

/** Asks /api/region once per page load. Any failure falls back to the strict mode. */
export function resolveMode(): Promise<ConsentMode> {
  const known = getMode();
  if (known) return Promise.resolve(known);
  if (modePromise) return modePromise;

  modePromise = (async () => {
    let mode: ConsentMode = 'opt-in';
    let ok = false;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch('/api/region', { cache: 'no-store', signal: ctrl.signal });
      if (res.ok) {
        const data = (await res.json()) as { mode?: string };
        if (data.mode === 'opt-out' || data.mode === 'opt-in') {
          mode = data.mode;
          ok = true;
        }
      }
    } catch {
      // network error or timeout: stay on opt-in
    } finally {
      window.clearTimeout(timer);
    }
    memoryMode = mode;
    if (ok) {
      try {
        window.sessionStorage.setItem(MODE_KEY, mode);
      } catch {
        // ignore
      }
    }
    emit();
    return mode;
  })();

  return modePromise;
}

/** The single rule every ad component must follow. */
export function adsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const mode = getMode();
  if (!mode) return false; // region not known yet
  const decision = getDecision();
  if (decision === 'denied') return false;
  if (mode === 'opt-in') return decision === 'granted';
  // opt-out regions: allowed by default, but GPC counts as an opt-out
  if (hasGpc() && decision !== 'granted') return false;
  return true;
}

export function useAdsAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () => setAllowed(adsAllowed());
    update();
    void resolveMode();
    window.addEventListener(CONSENT_CHANGED_EVENT, update);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, update);
  }, []);
  return allowed;
}
