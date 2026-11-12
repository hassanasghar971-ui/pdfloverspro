// src/lib/engine/for-each-page.ts
import * as pdfjs from 'pdfjs-dist';

export function pickScale(base: {width:number;height:number}, dpi: number, maxPixels: number) {
  let s = dpi / 72;
  const px = base.width * s * base.height * s;
  if (px > maxPixels) s *= Math.sqrt(maxPixels / px);
  return s;
}

export async function forEachPage(
  data: Uint8Array,
  opts: { dpi: number; maxPixels?: number; signal?: AbortSignal },
  fn: (canvas: HTMLCanvasElement, pageNo: number, total: number) => Promise<void>,
) {
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const maxPixels = opts.maxPixels ?? (mobile ? 12_000_000 : 25_000_000);
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  const canvas = document.createElement('canvas');
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      if (opts.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const page = await pdf.getPage(n);
      const vp = page.getViewport({ scale: pickScale(page.getViewport({ scale: 1 }), opts.dpi, maxPixels) });
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: false })!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      await fn(canvas, n, pdf.numPages);
      page.cleanup();
    }
  } finally {
    canvas.width = canvas.height = 0;
    await pdf.destroy();
  }
}
