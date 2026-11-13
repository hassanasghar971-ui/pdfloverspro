import { mergePdfBytes } from '../lib/engine/merge-core';

interface MergeJob {
  names: string[];
  buffers: ArrayBuffer[];
}

interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent<MergeJob>) => void) | null;
}

const scope = self as unknown as WorkerScope;

scope.onmessage = async (event) => {
  try {
    const { names, buffers } = event.data;
    const inputs = buffers.map((buffer, i) => ({
      name: names[i] ?? `File ${i + 1}`,
      bytes: new Uint8Array(buffer),
    }));
    const out = await mergePdfBytes(inputs, (p, label) => {
      scope.postMessage({ type: 'progress', p, label });
    });
    const copy = out.slice();
    scope.postMessage({ type: 'done', out: copy }, [copy.buffer as ArrayBuffer]);
  } catch (e) {
    scope.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) });
  }
};
