// src/lib/engine/ui-utils.ts
export const yieldToMain = (): Promise<void> =>
  (globalThis as any).scheduler?.yield?.() ?? new Promise(r => setTimeout(r, 0));

export function makeProgress(emit: (pct: number, label: string, etaSec?: number) => void) {
  let last = 0, lastEmit = 0; const t0 = performance.now();
  const report = (pct: number, label: string) => {
    pct = Math.max(last, Math.min(1, pct));
    const now = performance.now();
    if (now - lastEmit < 100 && pct < 1) return;
    last = pct; lastEmit = now;
    const eta = pct > 0.1 ? ((now - t0) / pct) * (1 - pct) / 1000 : undefined;
    emit(pct, label, eta);
  };
  return { report, stage: (a: number, b: number) => (p: number, label: string) => report(a + (b - a) * p, label) };
}
