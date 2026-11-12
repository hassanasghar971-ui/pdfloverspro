// Optimize tools: compress, repair, flatten, grayscale, invert colours,
// remove annotations.

import { PDFContext, PDFDict, PDFDocument, PDFName, PDFRef } from 'pdf-lib';
import type { PDFObject } from 'pdf-lib';
import type { MemoryScope } from '../memory';
import { ToolError } from './types';
import type { HandlerMap, RunContext, ToolHandler } from './types';
import {
  canvasToBlob,
  forEachPdfPage,
  formatBytes,
  loadPdfLibDocument,
  pdfResultFile,
  savePdfBytes,
  withPdfDocument,
} from './shared';
import {
  allIndexes,
  bytesOf,
  clampNum,
  isPasswordError,
  optNum,
  optStr,
  pdfFileName,
  progress,
  qualityOf,
  renderToCanvas,
} from './handler-utils';
// نیا کمپریشن ہیلپر امپورٹ (اگر فنکشن کا نام مختلف ہو تو یہاں تبدیل کریں)
import { compressPdfWithHelper } from './compression-helper';

/* ------------------------------ raster core -------------------------- */

type RasterFilter = 'none' | 'gray' | 'invert';

interface RasterOptions {
  scale: number;
  quality: number;
  filter: RasterFilter;
  from: number;
  to: number;
  label: string;
  tolerant: boolean;
}

interface RasterResult {
  bytes: Uint8Array;
  pages: number;
  failed: number;
}

function applyFilter(canvas: HTMLCanvasElement, filter: RasterFilter): void {
  if (filter === 'none') return;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (!g) throw new ToolError('Your browser could not create a 2D canvas.', 'internal');
  const { width, height } = canvas;
  if (width === 0 || height === 0) return;
  const stripH = Math.max(1, Math.floor(1_000_000 / width));
  for (let y = 0; y < height; y += stripH) {
    const h = Math.min(stripH, height - y);
    const img = g.getImageData(0, y, width, h);
    const d = img.data;
    if (filter === 'gray') {
      for (let i = 0; i < d.length; i += 4) {
        const l = ((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000) | 0;
        d[i] = d[i + 1] = d[i + 2] = l;
      }
    } else {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
    }
    g.putImageData(img, 0, y);
  }
}

async function rasterizeToPdf(
  ctx: RunContext,
  mem: MemoryScope,
  file: File,
  bytes: Uint8Array,
  opts: RasterOptions,
): Promise<RasterResult> {
  const out = await PDFDocument.create();
  out.setProducer('PDF Lovers Pro');
  out.setCreator('PDF Lovers Pro');
  let pages = 0;
  let failed = 0;

  await withPdfDocument(
    bytes,
    async (doc) => {
      await forEachPdfPage(
        doc,
        allIndexes(doc.numPages),
        async (page) => {
          let canvas: HTMLCanvasElement | null = null;
          try {
            const viewport = page.getViewport({ scale: 1 });
            canvas = await renderToCanvas(page, mem, { scale: opts.scale, signal: ctx.signal });
            applyFilter(canvas, opts.filter);
            const blob = await canvasToBlob(canvas, 'image/jpeg', opts.quality);
            const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
            const target = out.addPage([viewport.width, viewport.height]);
            target.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            pages += 1;
          } catch (e) {
            if (!opts.tolerant || ctx.signal?.aborted) throw e;
            failed += 1;
          } finally {
            if (canvas) mem.release(canvas);
          }
        },
        {
          signal: ctx.signal,
          onProgress: ctx.onProgress,
          from: opts.from,
          to: opts.to,
          label: opts.label,
        },
      );
    },
    { signal: ctx.signal, fileName: file.name },
  );

  if (pages === 0) {
    throw new ToolError('No readable pages could be rendered from this PDF.', 'invalid-pdf');
  }
  const saved = await savePdfBytes(out, { objectStreams: true });
  return { bytes: saved, pages, failed };
}

function sizeChange(before: number, after: number): string {
  const pct = Math.round((1 - after / before) * 100);
  const arrow = `${formatBytes(before)} → ${formatBytes(after)}`;
  if (pct > 0) return `${arrow} (${pct}% smaller)`;
  if (pct < 0) return `${arrow} (${Math.abs(pct)}% larger)`;
  return arrow;
}

/* ------------------------------ compress ----------------------------- */

const COMPRESS_PRESETS: Record<string, { scale: number; quality: number; summary: string }> = {
  medium: { scale: 1.5, quality: 0.7, summary: 'about 108 dpi, JPEG quality 70' },
  high: { scale: 1.0, quality: 0.5, summary: 'about 72 dpi, JPEG quality 50' },
};

/* ------------------- grayscale / invert handler factory -------------- */

function makeFilterHandler(filter: 'gray' | 'invert', suffix: string, verb: string): ToolHandler {
  return async (ctx, mem) => {
    const file = ctx.files[0];
    const scale = clampNum(optNum(ctx.options, 'scale', 1.5), 0.5, 4);
    const quality = qualityOf(optNum(ctx.options, 'quality', 0.8));
    progress(ctx, 4, 'Reading PDF');
    const bytes = await bytesOf(file);
    const result = await rasterizeToPdf(ctx, mem, file, bytes, {
      scale,
      quality,
      filter,
      from: 8,
      to: 94,
      label: `${verb} pages`,
      tolerant: false,
    });
    return {
      files: [pdfResultFile(result.bytes, pdfFileName(file, suffix))],
      note:
        `${verb} ${result.pages} page${result.pages === 1 ? '' : 's'} (${formatBytes(result.bytes.length)}). ` +
        'Pages are saved as images, so text is no longer selectable or searchable.',
    };
  };
}

/* ------------------------- annotation helpers ------------------------ */

const MARKUP_SUBTYPES = new Set([
  'Text',
  'FreeText',
  'Line',
  'Square',
  'Circle',
  'Polygon',
  'PolyLine',
  'Highlight',
  'Underline',
  'Squiggly',
  'StrikeOut',
  'Stamp',
  'Caret',
  'Ink',
  'Popup',
  'FileAttachment',
  'Sound',
  'Redact',
]);

function subtypeOf(dict: PDFDict): string {
  const st = dict.get(PDFName.of('Subtype'));
  return st instanceof PDFName ? st.asString().replace(/^\//, '') : '';
}

function shouldRemove(subtype: string, mode: string): boolean {
  if (subtype === 'Widget') return false;
  if (mode === 'links') return subtype === 'Link';
  if (mode === 'markup') return MARKUP_SUBTYPES.has(subtype);
  return true;
}

function appearanceRefs(dict: PDFDict, context: PDFContext): PDFRef[] {
  const refs: PDFRef[] = [];
  const addEntries = (d: PDFDict) => {
    for (const [, v] of d.entries()) if (v instanceof PDFRef) refs.push(v);
  };
  const collect = (value: PDFObject | undefined) => {
    if (value instanceof PDFRef) {
      refs.push(value);
      const target = context.lookup(value);
      if (target instanceof PDFDict) addEntries(target);
    } else if (value instanceof PDFDict) {
      addEntries(value);
    }
  };
  const apRaw = dict.get(PDFName.of('AP'));
  if (apRaw instanceof PDFRef) refs.push(apRaw);
  const ap = apRaw instanceof PDFRef ? context.lookup(apRaw) : apRaw;
  if (ap instanceof PDFDict) {
    for (const key of ['N', 'R', 'D']) collect(ap.get(PDFName.of(key)));
  }
  return refs;
}

/* ------------------------------- repair ------------------------------ */

interface Rebuilt {
  bytes: Uint8Array;
  pages: number;
  skipped: number;
}

async function rebuildWithPdfLib(bytes: Uint8Array): Promise<Rebuilt> {
  const src = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    throwOnInvalidObject: false,
    updateMetadata: false,
  });
  const out = await PDFDocument.create();
  let skipped = 0;
  const total = src.getPageCount();
  for (let i = 0; i < total; i += 1) {
    try {
      const [copied] = await out.copyPages(src, [i]);
      out.addPage(copied);
    } catch {
      skipped += 1;
    }
  }
  if (out.getPageCount() === 0) {
    throw new ToolError('No pages could be recovered with the structural method.', 'invalid-pdf');
  }
  try {
    const title = src.getTitle();
    const author = src.getAuthor();
    if (title) out.setTitle(title);
    if (author) out.setAuthor(author);
  } catch {
    /* metadata is optional */
  }
  out.setProducer('PDF Lovers Pro');
  out.setCreator('PDF Lovers Pro');
  const saved = await savePdfBytes(out, { objectStreams: false });
  return { bytes: saved, pages: out.getPageCount(), skipped };
}

/* ------------------------------ handlers ----------------------------- */

export const handlers: HandlerMap = {
  /* ----------------------------- compress (Updated with Helper) ---------------------------- */
  'compress-pdf': async (ctx, mem) => {
    const file = ctx.files[0];
    const level = optStr(ctx.options, 'level', 'medium');
    const preset = COMPRESS_PRESETS[level];

    progress(ctx, 4, 'Reading PDF');
    const original = await bytesOf(file);

    let best: Uint8Array | null = null;
    let method: 'structure' | 'raster' | '' = '';

    // Pass 1: lossless structural re-save
    progress(ctx, 8, 'Optimizing structure');
    try {
      const doc = await loadPdfLibDocument(original, { fileName: file.name });
      const saved = await savePdfBytes(doc, { objectStreams: true });
      if (saved.length < original.length) {
        best = saved;
        method = 'structure';
      }
    } catch (e) {
      if (level === 'low' || isPasswordError(e)) throw e;
    }

    // Pass 2: delegated to new compression-helper
    if (preset) {
      const compressed = await compressPdfWithHelper(ctx, mem, file, original, {
        scale: preset.scale,
        quality: preset.quality,
        from: 15,
        to: 94,
      });
      const currentBest = best ? best.length : original.length;
      if (compressed.length < currentBest) {
        best = compressed;
        method = 'raster';
      }
    }

    if (!best) {
      return {
        files: [pdfResultFile(original, pdfFileName(file, 'compressed'))],
        note:
          'This PDF is already well optimized, so every method made it larger. ' +
          `Your original (${formatBytes(original.length)}) is returned unchanged.`,
      };
    }

    const detail =
      method === 'raster' && preset
        ? ` Pages were re-rendered as images (${preset.summary}), so text is no longer selectable or searchable.`
        : ' Text, links and forms were kept (lossless optimization only).';
    return {
      files: [pdfResultFile(best, pdfFileName(file, 'compressed'))],
      note: `${sizeChange(original.length, best.length)}.${detail}`,
    };
  },

  /* ------------------------------ repair ----------------------------- */
  'repair-pdf': async (ctx, mem) => {
    const file = ctx.files[0];
    progress(ctx, 4, 'Reading PDF');
    const bytes = await bytesOf(file);

    progress(ctx, 10, 'Rebuilding file structure');
    let rebuilt: Rebuilt | null = null;
    try {
      rebuilt = await rebuildWithPdfLib(bytes);
    } catch (e) {
      if (isPasswordError(e)) throw e;
      rebuilt = null;
    }

    if (rebuilt) {
      progress(ctx, 40, 'Verifying result');
      let verifiedPages = 0;
      try {
        await withPdfDocument(
          rebuilt.bytes,
          async (doc) => {
            verifiedPages = doc.numPages;
          },
          { signal: ctx.signal, fileName: file.name },
        );
      } catch {
        verifiedPages = 0;
      }
      if (verifiedPages !== rebuilt.pages) rebuilt = null;
    }

    if (rebuilt) {
      return {
        files: [pdfResultFile(rebuilt.bytes, pdfFileName(file, 'repaired'))],
        note:
          `Rebuilt the PDF structure and verified ${rebuilt.pages} page${rebuilt.pages === 1 ? '' : 's'}.` +
          (rebuilt.skipped > 0
            ? ` ${rebuilt.skipped} page${rebuilt.skipped === 1 ? ' was' : 's were'} too damaged to copy and had to be skipped.`
            : '') +
          ' Forms and bookmarks are not carried into the rebuilt file.',
      };
    }

    progress(ctx, 45, 'Structure is too damaged, re-rendering readable pages');
    const raster = await rasterizeToPdf(ctx, mem, file, bytes, {
      scale: 2,
      quality: 0.85,
      filter: 'none',
      from: 45,
      to: 94,
      label: 'Recovering pages',
      tolerant: true,
    });
    return {
      files: [pdfResultFile(raster.bytes, pdfFileName(file, 'repaired'))],
      note:
        `The file structure could not be rebuilt directly, so ${raster.pages} readable page${raster.pages === 1 ? ' was' : 's were'} ` +
        'recovered by re-rendering them as images (text is no longer selectable).' +
        (raster.failed > 0
          ? ` ${raster.failed} page${raster.failed === 1 ? '' : 's'} could not be read and ${raster.failed === 1 ? 'was' : 'were'} left out.`
          : ''),
    };
  },

  /* ------------------------------ flatten ---------------------------- */
  'flatten-pdf': async (ctx, mem) => {
    const file = ctx.files[0];
    const mode = optStr(ctx.options, 'mode', 'forms');
    progress(ctx, 4, 'Reading PDF');
    const bytes = await bytesOf(file);

    if (mode === 'full') {
      const scale = clampNum(optNum(ctx.options, 'scale', 2), 0.5, 4);
      const result = await rasterizeToPdf(ctx, mem, file, bytes, {
        scale,
        quality: 0.88,
        filter: 'none',
        from: 8,
        to: 94,
        label: 'Flattening pages',
        tolerant: false,
      });
      return {
        files: [pdfResultFile(result.bytes, pdfFileName(file, 'flattened'))],
        note:
          `Flattened ${result.pages} page${result.pages === 1 ? '' : 's'} into images (${formatBytes(result.bytes.length)}). ` +
          'Form fields, annotations and layers are now part of the page picture; text is no longer selectable.',
      };
    }

    const openForm = async () => {
      const doc = await loadPdfLibDocument(bytes, { fileName: file.name });
      return { doc, form: doc.getForm() };
    };

    let fieldCount = 0;
    let doc: PDFDocument;
    try {
      const first = await openForm();
      fieldCount = first.form.getFields().length;
      if (fieldCount === 0) {
        return {
          files: [pdfResultFile(bytes, pdfFileName(file, 'flattened'))],
          note:
            'No fillable form fields were found, so the file is returned unchanged. ' +
            'Use "Full" mode to also flatten comments, stamps and other annotations.',
        };
      }
      progress(ctx, 40, 'Flattening form fields');
      try {
        first.form.flatten();
        doc = first.doc;
      } catch {
        const second = await openForm();
        second.form.flatten({ updateFieldAppearances: false });
        doc = second.doc;
      }
    } catch (e) {
      if (e instanceof ToolError) throw e;
      throw new ToolError(
        'The form fields in this PDF could not be flattened directly. Try "Full" mode instead.',
        'unsupported',
      );
    }

    doc.setProducer('PDF Lovers Pro');
    progress(ctx, 85, 'Saving');
    const out = await savePdfBytes(doc, { objectStreams: true });
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'flattened'))],
      note:
        `Flattened ${fieldCount} form field${fieldCount === 1 ? '' : 's'}; text stays selectable. ` +
        'Comments and stamps are not affected in this mode; use "Full" to flatten those too.',
    };
  },

  /* ----------------------- grayscale / invert ------------------------ */
  'grayscale-pdf': makeFilterHandler('gray', 'grayscale', 'Converted'),
  'invert-pdf-colors': makeFilterHandler('invert', 'inverted', 'Inverted'),

  /* ------------------------ remove annotations ----------------------- */
  'remove-annotations': async (ctx) => {
    const file = ctx.files[0];
    const mode = optStr(ctx.options, 'mode', 'all');
    progress(ctx, 5, 'Reading PDF');
    const doc = await loadPdfLibDocument(await bytesOf(file), { fileName: file.name });
    const context = doc.context;
    const pages = doc.getPages();
    let removed = 0;

    for (let p = 0; p < pages.length; p += 1) {
      const annots = pages[p].node.Annots();
      if (annots) {
        const keep: PDFObject[] = [];
        const count = annots.size();
        for (let i = 0; i < count; i += 1) {
          const raw = annots.get(i);
          const dict = annots.lookupMaybe(i, PDFDict);
          if (!dict || !shouldRemove(subtypeOf(dict), mode)) {
            keep.push(raw);
            continue;
          }
          removed += 1;
          for (const ref of appearanceRefs(dict, context)) context.delete(ref);
          if (raw instanceof PDFRef) context.delete(raw);
        }
        if (keep.length !== count) {
          if (keep.length === 0) pages[p].node.delete(PDFName.of('Annots'));
          else pages[p].node.set(PDFName.of('Annots'), context.obj(keep));
        }
      }
      if (p % 25 === 0) progress(ctx, 10 + (p / pages.length) * 80, 'Scanning annotations');
    }

    const label = mode === 'links' ? 'link' : mode === 'markup' ? 'markup annotation' : 'annotation';
    if (removed === 0) {
      return {
        files: [pdfResultFile(await bytesOf(file), pdfFileName(file, 'clean'))],
        note: `No ${label}s of that type were found, so the file is returned unchanged.`,
      };
    }

    doc.setProducer('PDF Lovers Pro');
    progress(ctx, 93, 'Saving');
    const out = await savePdfBytes(doc, { objectStreams: true });
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'no-annotations'))],
      note:
        `Removed ${removed} ${label}${removed === 1 ? '' : 's'}. ` +
        'Fillable form fields are never removed by this tool; use Flatten PDF for those.',
    };
  },
};
