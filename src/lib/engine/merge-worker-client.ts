import { FileIntakeError } from './file-intake';
import type { FileIntakeCode } from './file-intake';

export type MergeHooks = {
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
};

type WorkerMessage =
  | { type: 'progress'; done: number; total: number }
  | { type: 'done'; buffer: ArrayBuffer; offset: number; length: number }
  | { type: 'error'; code: string; message: string; fileName?: string };

function toIntakeCode(code: string): FileIntakeCode {
  if (code === 'ENCRYPTED') return 'ENCRYPTED';
  if (code === 'CORRUPT') return 'CORRUPT';
  return 'UNREADABLE';
}

export function mergeInWorker(files: File[], hooks: MergeHooks = {}): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    if (files.length === 0) {
      reject(new FileIntakeError('EMPTY', 'Add at least one PDF.'));
      return;
    }
    if (hooks.signal?.aborted) {
      reject(new FileIntakeError('ABORTED', 'Cancelled.'));
      return;
    }

    const worker = new Worker(new URL('../workers/merge.worker.ts', import.meta.url));

    function cleanup(): void {
      hooks.signal?.removeEventListener('abort', onAbort);
      // terminate() releases everything the worker allocated, instantly.
      worker.terminate();
    }

    function onAbort(): void {
      cleanup();
      reject(new FileIntakeError('ABORTED', 'Cancelled.'));
    }

    hooks.signal?.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        hooks.onProgress?.(msg.done, msg.total);
      } else if (msg.type === 'done') {
        const bytes = new Uint8Array(msg.buffer, msg.offset, msg.length);
        cleanup();
        resolve(bytes);
      } else {
        cleanup();
        reject(new FileIntakeError(toIntakeCode(msg.code), msg.message, msg.fileName));
      }
    };

    worker.onerror = () => {
      cleanup();
      reject(new FileIntakeError('UNREADABLE', 'The background worker failed to start.'));
    };

    // Files are structured-cloned by reference: no bytes are copied here.
    worker.postMessage({ type: 'merge', files });
  });
}
