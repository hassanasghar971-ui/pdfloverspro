import { runInWorker } from './worker-rpc';
import type { MergeInput } from './merge-core';

export interface MergeOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number, label: string) => void;
}

export interface MergeResult {
  bytes: Uint8Array;
  via: 'worker' | 'main-thread';
  /** Set only when the worker failed and the main thread was used instead. */
  workerError?: string;
}

const COPY_LIMIT = 64 * 1024 * 1024;

function isAbort(e: unknown): boolean {
  const name = (e as { name?: string } | null)?.name;
  return name === 'AbortError';
}

export async function mergePdfs(inputs: MergeInput[], opts: MergeOptions = {}): Promise<MergeResult> {
  const total = inputs.reduce((sum, i) => sum + i.bytes.byteLength, 0);
  const canCopy = total <= COPY_LIMIT;

  const buffers: ArrayBuffer[] = inputs.map((i) => {
    const b = i.bytes;
    if (!canCopy && b.byteOffset === 0 && b.byteLength === b.buffer.byteLength) return b.buffer as ArrayBuffer;
    return b.slice().buffer as ArrayBuffer;
  });
  const names = inputs.map((i) => i.name);

  let workerError = '';
  try {
    const out = await runInWorker<Uint8Array>(
      () => new Worker(new URL('../../workers/merge.worker.ts', import.meta.url), { type: 'module' }),
      { names, buffers },
      buffers,
      {
        signal: opts.signal,
        onProgress: (p, label) => opts.onProgress?.(p, label ?? ''),
      },
    );
    return { bytes: out, via: 'worker' };
  } catch (e) {
    if (isAbort(e) || opts.signal?.aborted) throw e;
    if (!canCopy) throw e; // buffers were transferred, nothing left to retry with
    workerError = e instanceof Error ? e.message : String(e);
  }

  const { mergePdfBytes } = await import('./merge-core');
  const bytes = await mergePdfBytes(inputs, (p, label) => opts.onProgress?.(p, label));
  return { bytes, via: 'main-thread', workerError };
}
