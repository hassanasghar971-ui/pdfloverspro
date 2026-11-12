// src/lib/engine/memory-budget.ts
const COST: Record<string, number> = {
  'merge-pdf': 3, 'split-pdf': 3, 'compress-pdf': 4,
  'ocr-pdf': 1.5, 'pdf-to-jpg': 1.5, default: 3,
};

export function ramBudgetMB(): number {
  const dm = (navigator as any).deviceMemory as number | undefined; // صرف Chrome، زیادہ سے زیادہ 8
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (dm) return Math.min(dm * 1024 * 0.25, mobile ? 600 : 2000);
  return mobile ? 300 : 800; // iOS میں deviceMemory نہیں ہوتی، اس لیے محتاط
}

export function preflight(slug: string, totalBytes: number) {
  const need = (totalBytes / 1048576) * (COST[slug] ?? COST.default);
  const budget = ramBudgetMB();
  if (need <= budget * 0.7) return { level: 'ok' as const };
  if (need <= budget) return { level: 'warn' as const, message: 'This file is large for your device. Close other tabs and keep this one open.' };
  return { level: 'block' as const, message: 'This file is too large for this tool on your device. Try Split PDF first, or use a computer.' };
}

export function markJobStart(slug: string, bytes: number) {
  localStorage.setItem('plp_job', JSON.stringify({ slug, bytes, t: Date.now() }));
}
export function markJobEnd() { localStorage.removeItem('plp_job'); }

export function interruptedJob() {
  const raw = localStorage.getItem('plp_job');
  if (!raw) return null;
  localStorage.removeItem('plp_job');
  return JSON.parse(raw) as { slug: string; bytes: number; t: number };
}
