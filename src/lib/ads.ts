export interface GatedScript {
  id: string;
  src: string;
  countKey: string;
  maxLoads: number;
  interactionsNeeded: number;
}

export const NATIVE_BANNER = {
  scriptId: 'ad-native-banner',
  containerId: 'container-2219d728bd140f492c47b5e49fe870ad',
  src: 'https://bauval.org/21/2219d728bd140f492c47b5e49fe870ad',
} as const;

export const GATED_SCRIPTS: readonly GatedScript[] = [
  {
    id: 'adsterra-social-bar',
    src: 'https://bauval.org/14/e82678238737ef67a400827536c7a4db',
    countKey: 'plp_sb_loads',
    maxLoads: 2,
    interactionsNeeded: 2,
  },
];

function debugOn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      new URLSearchParams(window.location.search).get('adsdebug') === '1' ||
      window.localStorage.getItem('plp_ads_debug') === '1'
    );
  } catch {
    return false;
  }
}

/** Prints to the Console only when the page is opened with ?adsdebug=1 */
export function adsDebug(...args: unknown[]): void {
  if (debugOn()) console.info('[ads]', ...args);
}

export function whenIdle(cb: () => void, timeout = 2000): void {
  if (typeof window === 'undefined') return;
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    window.setTimeout(cb, 1);
  }
}

export function readCount(key: string): number {
  try {
    return Number(window.sessionStorage.getItem(key) || '0') || 0;
  } catch {
    return 0;
  }
}

export function bumpCount(key: string): void {
  try {
    window.sessionStorage.setItem(key, String(readCount(key) + 1));
  } catch {
    /* storage unavailable: ignore */
  }
}

export function injectScript(id: string, src: string): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null;
  const existing = document.getElementById(id);
  if (existing) return existing as HTMLScriptElement;

  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  s.setAttribute('data-cfasync', 'false');
  s.onload = () => adsDebug('script loaded:', id);
  s.onerror = () =>
    adsDebug('script FAILED (CSP, ad blocker or network). Check Console for "Refused to" and the Network tab:', id, src);
  document.body.appendChild(s);
  adsDebug('script injected:', id, src);
  return s;
}

export function removeScript(id: string): void {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.remove();
}
