import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FileIntakeError } from './file-intake';

/** Rectangle in page fractions (0 to 1), origin at the top-left of the page. */
export type RedactRect = { x: number; y: number; width: number; height: number };

/** Key is the 1-based page number. */
export type RedactionPlan = Record<number, RedactRect[]>;

export type RedactOptions = {
  scale?: number;
  jpegQuality?: number;
  rasterizeAllPages?: boolean;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
};

const MAX_CANVAS_PIXELS = 16_000_000;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
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

export async function redactByRasterizing(
  pdf: PDFDocumentProxy,
  originalBytes: Uint8Array,
  plan: RedactionPlan,
  options: RedactOptions = {}
): Promise<Uint8Array> {
  const scale = options.scale ?? 2;
  const quality = Math.min(1, Math.max(0.5, options.jpegQuality ?? 0.88));
  const total = pdf.numPages;

  // Brand-new document: nothing from the original file (metadata, XMP, forms,
  // attachments, outlines) is carried over.
  const out = await PDFDocument.create({ updateMetadata: false });
  let source: PDFDocument | null = null;

  for (let n = 1; n <= total; n++) {
    if (options.signal?.aborted) throw new FileIntakeError('ABORTED', 'Cancelled.');

    const rects = plan[n] ?? [];
    const mustRasterize = rects.length > 0 || options.rasterizeAllPages === true;

    if (!mustRasterize) {
      if (!source) source = await PDFDocument.load(originalBytes, { updateMetadata: false });
      const [copied] = await out.copyPages(source, [n - 1]);
      if (copied) out.addPage(copied);
    } else {
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
          throw new FileIntakeError(
            'OUT_OF_MEMORY',
            'Could not create a drawing surface. Redaction was NOT applied.'
          );
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Burn the black boxes into the pixels.
        ctx.fillStyle = '#000000';
        for (const r of rects) {
          const x = Math.max(0, Math.floor(r.x * canvas.width) - 1);
          const y = Math.max(0, Math.floor(r.y * canvas.height) - 1);
          const w = Math.ceil(r.width * canvas.width) + 2;
          const h = Math.ceil(r.height * canvas.height) + 2;
          ctx.fillRect(x, y, w, h);
        }

        const jpeg = await canvasToJpeg(canvas, quality);
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
    }

    options.onProgress?.(n, total);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  source = null;
  return out.save();
}

/** Returns the page numbers that still contain extractable text. Empty array means clean. */
export async function verifyNoTextOnPages(
  pdf: PDFDocumentProxy,
  pageNumbers: number[]
): Promise<number[]> {
  const leaking: number[] = [];
  for (const n of pageNumbers) {
    const page = await pdf.getPage(n);
    try {
      const content = await page.getTextContent();
      const hasText = content.items.some(
        (item) => 'str' in item && item.str.trim().length > 0
      );
      if (hasText) leaking.push(n);
    } finally {
      page.cleanup();
    }
  }
  return leaking;
}
