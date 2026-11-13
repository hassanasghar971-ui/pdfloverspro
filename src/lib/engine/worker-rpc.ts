export interface WorkerRpcOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number, label?: string) => void;
}

interface WorkerMessage {
  type?: string;
  p?: number;
  progress?: number;
  label?: string;
  out?: unknown;
  result?: unknown;
  message?: string;
  error?: string;
}

export function runInWorker<T>(
  make: () => Worker,
  payload: unknown,
  transfer: Transferable[] = [],
  options: WorkerRpcOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new DOMException('Cancelled.', 'AbortError'));
      return;
    }

    let worker: Worker;
    try {
      worker = make();
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    let finished = false;

    const finish = (action: () => void): void => {
      if (finished) return;
      finished = true;
      options.signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      action();
    };

    function onAbort(): void {
      finish(() => reject(new DOMException('Cancelled.', 'AbortError')));
    }

    options.signal?.addEventListener('abort', onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const m = event.data;
      if (!m || typeof m !== 'object') return;

      if (m.type === 'progress') {
        const percent = typeof m.p === 'number' ? m.p : typeof m.progress === 'number' ? m.progress : 0;
        options.onProgress?.(percent, m.label);
      } else if (m.type === 'done' || m.type === 'result') {
        const value = 'out' in m ? m.out : m.result;
        finish(() => resolve(value as T));
      } else if (m.type === 'error') {
        finish(() => reject(new Error(m.message ?? m.error ?? 'The worker failed.')));
      }
    };

    worker.onerror = (ev: ErrorEvent) => {
      finish(() => reject(new Error(ev.message || 'The worker could not start.')));
    };

    worker.onmessageerror = () => {
      finish(() => reject(new Error('The worker sent an unreadable message.')));
    };

    try {
      worker.postMessage(payload, transfer);
    } catch (e) {
      finish(() => reject(e instanceof Error ? e : new Error(String(e))));
    }
  });
}
