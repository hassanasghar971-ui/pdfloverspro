import { PDFDocument } from 'pdf-lib';

type MergeRequest = { type: 'merge'; files: File[] };

type WorkerScope = {
  onmessage: ((event: MessageEvent<MergeRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

const ctx = self as unknown as WorkerScope;

function fail(code: string, message: string, fileName?: string): void {
  ctx.postMessage({ type: 'error', code, message, fileName });
}

ctx.onmessage = async (event) => {
  const req = event.data;
  if (!req || req.type !== 'merge') return;

  try {
    const out = await PDFDocument.create({ updateMetadata: false });
    const total = req.files.length;

    for (let i = 0; i < total; i++) {
      const file = req.files[i];
      if (!file) continue;

      let src: PDFDocument;
      try {
        // The file is read here, inside the worker. The main thread never holds the bytes.
        const bytes = new Uint8Array(await file.arrayBuffer());
        src = await PDFDocument.load(bytes, { updateMetadata: false });
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        if (msg.indexOf('encrypt') !== -1) {
          fail('ENCRYPTED', file.name + ' is password protected. Unlock it first.', file.name);
        } else {
          fail('CORRUPT', file.name + ' looks damaged. Try the Repair PDF tool first.', file.name);
        }
        return;
      }

      const pages = await out.copyPages(src, src.getPageIndices());
      for (const page of pages) out.addPage(page);
      // src goes out of scope here, so its objects can be freed before the next file loads.

      ctx.postMessage({ type: 'progress', done: i + 1, total });
    }

    const saved = await out.save();
    const buffer = saved.buffer as ArrayBuffer;
    ctx.postMessage(
      { type: 'done', buffer, offset: saved.byteOffset, length: saved.byteLength },
      [buffer]
    );
  } catch (err) {
    fail('FAILED', err instanceof Error ? err.message : 'Merge failed.');
  }
};
