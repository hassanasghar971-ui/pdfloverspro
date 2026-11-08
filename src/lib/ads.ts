export interface GatedScript {
  id: string;
  src: string;
  countKey: string;
  maxLoads: number;
  interactionsNeeded: number;
}

export const NATIVE_BANNER = {
  scriptId: 'ad-native-banner',
  containerId: 'container-f51e74a40c326ccb95a7a043005bd0ae',
  src: 'https://bauval.org/21/f51e74a40c326ccb95a7a043005bd0ae',
} as const;

export const GATED_SCRIPTS: GatedScript[] = [
  {
    id: 'adsterra-social-bar',
    src: 'https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js',
    countKey: 'plp_sb_loads',
    maxLoads: 2,
    interactionsNeeded: 2,
  },
  {
    // Format not confirmed (Social Bar or Popunder). Check the Adsterra dashboard.
    id: 'ad-extra-unit',
    src: 'https://bauval.org/14/da0660016dcfaa6988e2c35f05108ab4',
    countKey: 'plp_x1_loads',
    maxLoads: 1,
    interactionsNeeded: 3,
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
