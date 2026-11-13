// Main-thread entry point: tries a Web Worker first, falls back to the main thread.
import { runInWorker } from './worker-rpc';
import { mergePdfBytes, type MergeInput } from './merge-core';

export interface MergeOutcome {
  bytes: Uint8Array;
  via: 'worker' | 'main-thread';
  workerError?: string;
}

export async function mergePdfs(
  inputs: MergeInput[],
  options: { signal?: AbortSignal; onProgress?: (fraction: number, label: string) => void } = {},
): Promise<MergeOutcome> {
  const buffers = inputs.map((f) => f.bytes.buffer.slice(f.bytes.byteOffset, f.bytes.byteOffset + f.bytes.byteLength));
  try {
    const bytes = await runInWorker<Uint8Array>(
      () => new Worker(new URL('../../workers/merge.worker.ts', import.meta.url), { type: 'module' }),
      { names: inputs.map((f) => f.name), buffers },
      buffers,
      {
        signal: options.signal,
        onProgress: (p, label) => options.onProgress?.(p, label ?? 'Processing'),
      },
    );
    return { bytes, via: 'worker' };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const bytes = await mergePdfBytes(inputs, (p, label) => options.onProgress?.(p, label));
    return { bytes, via: 'main-thread', workerError: errMsg };
  }
}
