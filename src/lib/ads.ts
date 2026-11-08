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

export const GATED_SCRIPTS: GatedScript[] = [
  {
    id: 'adsterra-social-bar',
    src: 'https://bauval.org/14/e82678238737ef67a400827536c7a4db',
    countKey: 'plp_sb_loads',
    maxLoads: 2,
    interactionsNeeded: 2,
  },
];

export function whenIdle(cb: () => void, timeout = 2000): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    window.setTimeout(cb, 800);
  }
}

export function injectScript(id: string, src: string): void {
  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  s.setAttribute('data-cfasync', 'false');
  document.body.appendChild(s);
}
