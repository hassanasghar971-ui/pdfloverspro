// src/lib/engine/worker-rpc.ts
export function runInWorker<O>(
  make: () => Worker, payload: unknown, transfer: Transferable[],
  o: { onProgress?: (p: number, label?: string) => void; signal?: AbortSignal } = {},
): Promise<O> {
  return new Promise((resolve, reject) => {
    let w: Worker;
    try { w = make(); } catch (e) { reject(e); return; }
    const end = () => w.terminate();
    o.signal?.addEventListener('abort', () => { end(); reject(new DOMException('Cancelled', 'AbortError')); }, { once: true });
    w.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'progress') o.onProgress?.(m.p, m.label);
      else if (m.type === 'done') { end(); resolve(m.out as O); }
      else if (m.type === 'error') { end(); reject(new Error(m.message)); }
    };
    w.onerror = (e) => { end(); reject(new Error(e.message || 'Worker failed')); };
    w.postMessage(payload, transfer);
  });
}
