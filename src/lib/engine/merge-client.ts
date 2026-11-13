// Main-thread entry point: tries a Web Worker first, falls back to the main thread.
import { runInWorker } from './worker-rpc';
import { mergePdfBytes, type MergeInput } from './merge-core';

export interface MergeOutcome {
  bytes: Uint8Array;
  via: 'worker' | 'main-thread';
}

const FALLBACK_COPY_LIMIT = 64 * 1024 * 1024;

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export async function mergePdfs(
  inputs: MergeInput[],
  options: { signal?: AbortSignal; onProgress?: (fraction: number, label: string) => void } = {},
): Promise<MergeOutcome> {
  const totalBytes = inputs.reduce((sum, f) => sum + f.bytes.length, 0);
  const canFallback = totalBytes <= FALLBACK_COPY_LIMIT;

  if (typeof Worker !== 'undefined') {
    const buffers = inputs.map((f) =>
      canFallback
        ? f.bytes.slice().buffer
        : f.bytes.byteOffset === 0 && f.bytes.byteLength === f.bytes.buffer.byteLength
          ? f.bytes.buffer
          : f.bytes.slice().buffer,
    );
    try {
      const bytes = await runInWorker<Uint8Array>(
        () => new Worker(new URL('../../workers/merge.worker.ts', import.meta.url), { type: 'module' }),
        { names: inputs.map((f) => f.name), buffers },
        buffers as Transferable[],
        {
          signal: options.signal,
          onProgress: (p, label) => {
            options.onProgress?.(p, label ?? 'Processing');
          },
        },
      );
      return { bytes, via: 'worker' };
    } catch (err) {
      if (isAbort(err) || !canFallback) throw err;
    }
  }

  const bytes = await mergePdfBytes(
    inputs.map((f) => ({ name: f.name, bytes: f.bytes })),
    (p, label) => {
      options.onProgress?.(p, label);
    },
  );
  return { bytes, via: 'main-thread' };
}
