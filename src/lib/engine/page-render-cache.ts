import type { PDFDocumentProxy } from 'pdfjs-dist';

type Entry = { bitmap: ImageBitmap; bytes: number };

/**
 * Draw the returned bitmap right away (ctx.drawImage) and never close it yourself:
 * the cache closes bitmaps when it evicts them or when dispose() is called.
 */
export class PageRenderCache {
  private readonly pdf: PDFDocumentProxy;
  private readonly budgetBytes: number;
  private readonly entries = new Map<string, Entry>();
  private readonly inflight = new Map<string, Promise<ImageBitmap>>();
  private used = 0;
  private disposed = false;

  constructor(pdf: PDFDocumentProxy, budgetBytes: number = 96 * 1024 * 1024) {
    this.pdf = pdf;
    this.budgetBytes = budgetBytes;
  }

  get(pageNumber: number, targetWidth: number): Promise<ImageBitmap> {
    if (this.disposed) return Promise.reject(new Error('Cache disposed.'));
    const width = Math.max(32, Math.round(targetWidth));
    const key = pageNumber + ':' + width;

    const hit = this.entries.get(key);
    if (hit) {
      // Move to the newest position (Map keeps insertion order, so this is the LRU).
      this.entries.delete(key);
      this.entries.set(key, hit);
      return Promise.resolve(hit.bitmap);
    }

    const pending = this.inflight.get(key);
    if (pending) return pending;

    const job = this.render(pageNumber, width)
      .then((bitmap) => {
        if (this.disposed) {
          bitmap.close();
          throw new Error('Cache disposed.');
        }
        const bytes = bitmap.width * bitmap.height * 4;
        this.entries.set(key, { bitmap, bytes });
        this.used += bytes;
        this.evict(key);
        return bitmap;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, job);
    return job;
  }

  dispose(): void {
    this.disposed = true;
    for (const entry of this.entries.values()) entry.bitmap.close();
    this.entries.clear();
    this.inflight.clear();
    this.used = 0;
  }

  private evict(keep: string): void {
    for (const [key, entry] of this.entries) {
      if (this.used <= this.budgetBytes) break;
      if (key === keep) continue;
      entry.bitmap.close();
      this.used -= entry.bytes;
      this.entries.delete(key);
    }
  }

  private async render(pageNumber: number, width: number): Promise<ImageBitmap> {
    const page = await this.pdf.getPage(pageNumber);
    let canvas: HTMLCanvasElement | null = null;
    try {
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / base.width });
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No drawing surface available.');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      return await createImageBitmap(canvas);
    } finally {
      page.cleanup();
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  }
}
