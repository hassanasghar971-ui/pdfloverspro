import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FileIntakeError } from './file-intake';

export type CompressLevel = 'low' | 'recommended' | 'extreme';

export type CompressResult = {
  bytes: Uint8Array;
  originalSize: number;
  newSize: number;
  usedOriginal: boolean;
};

const LEVELS: Record<CompressLevel, { scale: number; quality: number }> = {
  low: { scale: 2.0, quality: 0.85 },
  recommended: { scale: 1.5, quality: 0.7 },
  extreme: { scale: 1.0, quality: 0.5 },
};

const MAX_CANVAS_PIXELS = 16_000_000;

function toJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed.'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject);
      },
      'image/jpeg',
      quality
    );
  });
}

export async function compressByRasterizing(
  pdf: PDFDocumentProxy,
  originalBytes: Uint8Array,
  level: CompressLevel,
  hooks: { onProgress?: (done: number, total: number) => void; signal?: AbortSignal } = {}
): Promise<CompressResult> {
  const { scale, quality } = LEVELS[level];
  const out = await PDFDocument.create();
  const total = pdf.numPages;

  for (let n = 1; n <= total; n++) {
    if (hooks.signal?.aborted) throw new FileIntakeError('ABORTED', 'Cancelled.');

    const page = await pdf.getPage(n);
    let canvas: HTMLCanvasElement | null = null;
    try {
      const base = page.getViewport({ scale: 1 });
      let s = scale;
      const pixels = base.width * s * (base.height * s);
      if (pixels > MAX_CANVAS_PIXELS) s *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);

      const viewport = page.getViewport({ scale: s });
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new FileIntageError('OUT_OF_MEMORY', 'The browser could not create a drawing surface.');
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpeg = await toJpegBytes(canvas, quality);
      const image = await out.embedJpg(jpeg);
      const target = out.addPage([base.width, base.height]);
      target.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
    } finally {
      page.cleanup();
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }

    hooks.onProgress?.(n, total);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  const result = await out.save();
  if (result.length >= originalBytes.length) {
    return {
      bytes: originalBytes,
      originalSize: originalBytes.length,
      newSize: originalBytes.length,
      usedOriginal: true,
    };
  }
  return {
    bytes: result,
    originalSize: originalBytes.length,
    newSize: result.length,
    usedOriginal: false,
  };
}
