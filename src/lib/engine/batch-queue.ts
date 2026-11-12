// src/lib/engine/batch-queue.ts
export type BatchItem = { name: string; status: 'done' | 'error' | 'skipped'; blob?: Blob; error?: string };

export async function runBatch(
  files: File[],
  job: (f: File, i: number) => Promise<{ name: string; blob: Blob }>,
  o: { concurrency?: number; signal?: AbortSignal; onItem?: (i: number, item: BatchItem) => void; onProgress?: (done: number, total: number) => void },
): Promise<BatchItem[]> {
  const results: BatchItem[] = new Array(files.length);
  const big = files.some(f => f.size > 20 * 1048576);
  const conc = big ? 1 : Math.min(o.concurrency ?? 2, 3);
  let next = 0, done = 0;

  async function lane() {
    while (next < files.length) {
      if (o.signal?.aborted) return;
      const i = next++;
      try {
        const r = await job(files[i], i);
        results[i] = { name: r.name, status: 'done', blob: r.blob };
      } catch (e: any) {
        results[i] = { name: files[i].name, status: 'error', error: e?.message ?? 'Failed' };
      }
      o.onItem?.(i, results[i]);
      o.onProgress?.(++done, files.length);
    }
  }
  await Promise.all(Array.from({ length: conc }, lane));
  return results;
}
