// Organize tools: merge, split, rotate, crop, extract, delete, resize, n-up.

import { PDFDocument, degrees, rgb } from 'pdf-lib';
import type { PDFEmbeddedPage, PDFPage } from 'pdf-lib';
import { ToolError } from './types';
import type { HandlerMap, RunContext } from './types';
import {
  formatBytes,
  loadPdfLibDocument,
  parsePageList,
  pdfResultFile,
  savePdfBytes,
  throwIfAborted,
  yieldToMain,
} from './shared';
import {
  allIndexes,
  bytesOf,
  clampNum,
  normalizeRotation,
  optFlag,
  optNum,
  optStr,
  pad,
  pageSizeFor,
  parseGroups,
  pdfFileName,
  progress,
  stem,
} from './handler-utils';
// نیا ورکر کلائنٹ امپورٹ (اگر فنکشن کا نام مختلف ہو تو یہاں تبدیل کریں)
import { mergePdfs } from './merge-client';

/* ------------------------------ helpers ------------------------------ */

async function openSource(file: File): Promise<PDFDocument> {
  return loadPdfLibDocument(await bytesOf(file), { fileName: file.name });
}

function pageSelection(raw: string, total: number, allowEmpty: boolean): number[] {
  const list = parsePageList(raw, total, { allowEmpty, dedupe: true });
  if (list.length > 0) return list;
  if (allowEmpty) return allIndexes(total);
  throw new ToolError('Enter at least one page number, for example 1-3, 5.', 'invalid-input');
}

function setProducer(doc: PDFDocument): void {
  doc.setProducer('PDF Lovers Pro');
  doc.setCreator('PDF Lovers Pro');
}

async function embedWithBox(out: PDFDocument, page: PDFPage): Promise<PDFEmbeddedPage> {
  const cb = page.getCropBox();
  return out.embedPage(
    page,
    { left: cb.x, bottom: cb.y, right: cb.x + cb.width, top: cb.y + cb.height },
    [1, 0, 0, 1, -cb.x, -cb.y],
  );
}

/** Visual (rotation-aware) size of a page's crop box. */
function visualSize(page: PDFPage): { width: number; height: number; rotation: 0 | 90 | 180 | 270 } {
  const cb = page.getCropBox();
  const rotation = normalizeRotation(page.getRotation().angle);
  const swap = rotation === 90 || rotation === 270;
  return {
    width: swap ? cb.height : cb.width,
    height: swap ? cb.width : cb.height,
    rotation,
  };
}

function placeEmbedded(
  target: PDFPage,
  embedded: PDFEmbeddedPage,
  rotation: 0 | 90 | 180 | 270,
  box: { x: number; y: number; width: number; height: number },
  fit: boolean,
): { x: number; y: number; width: number; height: number } {
  const swap = rotation === 90 || rotation === 270;
  const vw = swap ? embedded.height : embedded.width;
  const vh = swap ? embedded.width : embedded.height;
  const s = fit ? Math.min(box.width / vw, box.height / vh) : 1;
  const dw = vw * s;
  const dh = vh * s;
  const ox = box.x + (box.width - dw) / 2;
  const oy = box.y + (box.height - dh) / 2;

  let ax = ox;
  let ay = oy;
  if (rotation === 90) {
    ay += embedded.width * s;
  } else if (rotation === 180) {
    ax += embedded.width * s;
    ay += embedded.height * s;
  } else if (rotation === 270) {
    ax += embedded.height * s;
  }

  target.drawPage(embedded, {
    x: ax,
    y: ay,
    xScale: s,
    yScale: s,
    rotate: degrees(-rotation),
  });
  return { x: ox, y: oy, width: dw, height: dh };
}

async function saveDoc(doc: PDFDocument): Promise<Uint8Array> {
  return savePdfBytes(doc, { objectStreams: true });
}

async function copyInto(src: PDFDocument, indexes: number[]): Promise<PDFDocument> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indexes);
  for (const p of copied) out.addPage(p);
  setProducer(out);
  return out;
}

/* ------------------------------ handlers ----------------------------- */

export const handlers: HandlerMap = {
  /* ------------------------------ merge (Updated for Worker) ------------------------------ */
  'merge-pdf': async (ctx) => {
    const files = ctx.files;
    const result = await mergePdfs(files, {
      signal: ctx.signal,
      onProgress: (p, label) => progress(ctx, p, label || 'Merging PDFs'),
    });

    return {
      files: [pdfResultFile(result.bytes, 'merged.pdf')],
      note: `Merged ${files.length} files into ${result.pageCount} pages (${formatBytes(result.bytes.length)}).`,
    };
  },

  /* ------------------------------ split ------------------------------ */
  'split-pdf': async (ctx) => {
    const file = ctx.files[0];
    const mode = optStr(ctx.options, 'mode', 'ranges');
    progress(ctx, 4, 'Reading PDF');
    const src = await openSource(file);
    const total = src.getPageCount();

    let groups: number[][];
    if (mode === 'each') {
      groups = allIndexes(total).map((i) => [i]);
    } else if (mode === 'every-n') {
      const n = Math.max(1, Math.floor(optNum(ctx.options, 'n', 1)));
      groups = [];
      for (let start = 0; start < total; start += n) {
        groups.push(allIndexes(Math.min(n, total - start)).map((k) => start + k));
      }
    } else {
      groups = parseGroups(optStr(ctx.options, 'ranges', ''), total);
    }

    const base = stem(file.name);
    const numWidth = String(groups.length).length;
    const pageWidth = String(total).length;
    const results = [];

    for (let g = 0; g < groups.length; g += 1) {
      throwIfAborted(ctx.signal);
      progress(ctx, 8 + (g / groups.length) * 86, `Creating part ${g + 1} of ${groups.length}`);
      const group = groups[g];
      const doc = await copyInto(src, group);
      const bytes = await saveDoc(doc);
      const first = group[0] + 1;
      const last = group[group.length - 1] + 1;
      const name =
        mode === 'each'
          ? `${base}-page-${pad(first, pageWidth)}.pdf`
          : `${base}-part-${pad(g + 1, numWidth)}-p${first}${last !== first ? `-${last}` : ''}.pdf`;
      results.push(pdfResultFile(bytes, name));
      await yieldToMain();
    }

    return {
      files: results,
      note:
        results.length === 1
          ? `Created 1 PDF from ${total} pages.`
          : `Split ${total} pages into ${results.length} PDFs.`,
    };
  },

  /* ------------------------------ rotate ----------------------------- */
  'rotate-pdf': async (ctx) => {
    const file = ctx.files[0];
    const angle = Math.round(optNum(ctx.options, 'angle', 90));
    if (angle % 90 !== 0) {
      throw new ToolError('Rotation must be 90, 180 or 270 degrees.', 'invalid-input');
    }
    progress(ctx, 5, 'Reading PDF');
    const doc = await openSource(file);
    const targets = pageSelection(optStr(ctx.options, 'pages', ''), doc.getPageCount(), true);

    for (let k = 0; k < targets.length; k += 1) {
      const page = doc.getPage(targets[k]);
      const current = page.getRotation().angle;
      page.setRotation(degrees((((current + angle) % 360) + 360) % 360));
      if (k % 50 === 0) {
        progress(ctx, 10 + (k / targets.length) * 80, 'Rotating pages');
        await yieldToMain();
      }
    }

    setProducer(doc);
    progress(ctx, 93, 'Saving');
    const out = await saveDoc(doc);
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'rotated'))],
      note: `Rotated ${targets.length} page${targets.length === 1 ? '' : 's'} by ${angle}°.`,
    };
  },

  /* ------------------------------- crop ------------------------------ */
  'crop-pdf': async (ctx) => {
    const file = ctx.files[0];
    const top = clampNum(optNum(ctx.options, 'top', 0), 0, 95);
    const right = clampNum(optNum(ctx.options, 'right', 0), 0, 95);
    const bottom = clampNum(optNum(ctx.options, 'bottom', 0), 0, 95);
    const left = clampNum(optNum(ctx.options, 'left', 0), 0, 95);
    if (top + right + bottom + left === 0) {
      throw new ToolError('Set at least one crop margin above 0%.', 'invalid-input');
    }
    if (top + bottom >= 95 || left + right >= 95) {
      throw new ToolError('Those margins would crop away the whole page. Use smaller values.', 'invalid-input');
    }

    progress(ctx, 5, 'Reading PDF');
    const doc = await openSource(file);
    const targets = pageSelection(optStr(ctx.options, 'pages', ''), doc.getPageCount(), true);

    for (let k = 0; k < targets.length; k += 1) {
      const page = doc.getPage(targets[k]);
      const base = page.getCropBox();
      const rot = normalizeRotation(page.getRotation().angle);
      const swap = rot === 90 || rot === 270;
      const visW = swap ? base.height : base.width;
      const visH = swap ? base.width : base.height;

      const vTop = (visH * top) / 100;
      const vBottom = (visH * bottom) / 100;
      const vLeft = (visW * left) / 100;
      const vRight = (visW * right) / 100;

      let uTop = vTop;
      let uRight = vRight;
      let uBottom = vBottom;
      let uLeft = vLeft;
      if (rot === 90) {
        uLeft = vTop;
        uTop = vRight;
        uRight = vBottom;
        uBottom = vLeft;
      } else if (rot === 180) {
        uBottom = vTop;
        uLeft = vRight;
        uTop = vBottom;
        uRight = vLeft;
      } else if (rot === 270) {
        uRight = vTop;
        uBottom = vRight;
        uLeft = vBottom;
        uTop = vLeft;
      }

      const x = base.x + uLeft;
      const y = base.y + uBottom;
      const w = base.width - uLeft - uRight;
      const h = base.height - uTop - uBottom;
      if (w < 12 || h < 12) {
        throw new ToolError(`Page ${targets[k] + 1} would be smaller than 12 pt after cropping.`, 'invalid-input');
      }
      page.setMediaBox(x, y, w, h);
      page.setCropBox(x, y, w, h);
      page.setTrimBox(x, y, w, h);
      page.setBleedBox(x, y, w, h);
      page.setArtBox(x, y, w, h);

      if (k % 50 === 0) {
        progress(ctx, 10 + (k / targets.length) * 80, 'Cropping pages');
        await yieldToMain();
      }
    }

    setProducer(doc);
    progress(ctx, 93, 'Saving');
    const out = await saveDoc(doc);
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'cropped'))],
      note:
        `Cropped ${targets.length} page${targets.length === 1 ? '' : 's'}. ` +
        'Cropping hides the outer area; the hidden content is still inside the file.',
    };
  },

  /* --------------------------- extract pages ------------------------- */
  'extract-pages': async (ctx) => {
    const file = ctx.files[0];
    progress(ctx, 5, 'Reading PDF');
    const src = await openSource(file);
    const indexes = pageSelection(optStr(ctx.options, 'pages', ''), src.getPageCount(), false);
    progress(ctx, 40, 'Copying pages');
    const doc = await copyInto(src, indexes);
    progress(ctx, 85, 'Saving');
    const out = await saveDoc(doc);
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'extracted'))],
      note: `Extracted ${indexes.length} of ${src.getPageCount()} pages.`,
    };
  },

  /* ---------------------------- delete pages ------------------------- */
  'delete-pages': async (ctx) => {
    const file = ctx.files[0];
    progress(ctx, 5, 'Reading PDF');
    const src = await openSource(file);
    const total = src.getPageCount();
    const toDelete = new Set(pageSelection(optStr(ctx.options, 'pages', ''), total, false));
    const keep = allIndexes(total).filter((i) => !toDelete.has(i));
    if (keep.length === 0) {
      throw new ToolError('You cannot delete every page. Leave at least one page in the document.', 'invalid-input');
    }
    progress(ctx, 40, 'Copying remaining pages');
    const doc = await copyInto(src, keep);
    progress(ctx, 85, 'Saving');
    const out = await saveDoc(doc);
    return {
      files: [pdfResultFile(out, pdfFileName(file, 'pages-removed'))],
      note: `Removed ${toDelete.size} page${toDelete.size === 1 ? '' : 's'}; ${keep.length} remain.`,
    };
  },

  /* ------------------------------ resize ----------------------------- */
  'resize-pdf': async (ctx) => {
    const file = ctx.files[0];
    const sizeKey = optStr(ctx.options, 'size', 'a4');
    const scaleContent = optFlag(ctx.options, 'scaleContent', true);
    pageSizeFor(sizeKey, false);

    progress(ctx, 4, 'Reading PDF');
    const src = await openSource(file);
    const pages = src.getPages();
    const out = await PDFDocument.create();

    for (let i = 0; i < pages.length; i += 1) {
      throwIfAborted(ctx.signal);
      const sourcePage = pages[i];
      const vis = visualSize(sourcePage);
      const [tw, th] = pageSizeFor(sizeKey, vis.width > vis.height);
      const embedded = await embedWithBox(out, sourcePage);
      const target = out.addPage([tw, th]);
      placeEmbedded(target, embedded, vis.rotation, { x: 0, y: 0, width: tw, height: th }, scaleContent);
      if (i % 10 === 0) {
        progress(ctx, 8 + (i / pages.length) * 84, `Resizing page ${i + 1} of ${pages.length}`);
        await yieldToMain();
      }
    }

    setProducer(out);
    progress(ctx, 94, 'Saving');
    const bytes = await saveDoc(out);
    return {
      files: [pdfResultFile(bytes, pdfFileName(file, `${sizeKey.toLowerCase()}`))],
      note:
        `Resized ${pages.length} page${pages.length === 1 ? '' : 's'} to ${sizeKey.toUpperCase()}. ` +
        (scaleContent
          ? 'Content was scaled to fit.'
          : 'Content kept its original size and may be clipped if it was larger than the new page.') +
        ' Links and form fields on resized pages are not preserved.',
    };
  },

  /* ------------------------------ n-up ------------------------------- */
  'n-up-pdf': async (ctx) => {
    const file = ctx.files[0];
    const per = Math.round(optNum(ctx.options, 'perSheet', 4));
    if (![2, 4, 6, 9].includes(per)) {
      throw new ToolError('Pages per sheet must be 2, 4, 6 or 9.', 'invalid-input');
    }
    const orientation = optStr(ctx.options, 'orientation', 'auto');
    const landscape = orientation === 'auto' ? per === 2 || per === 6 : orientation === 'landscape';
    const [sheetW, sheetH] = pageSizeFor(optStr(ctx.options, 'pageSize', 'a4'), landscape);
    const gap = clampNum(optNum(ctx.options, 'gap', 8), 0, 40);
    const border = optFlag(ctx.options, 'border', true);

    const base = per === 2 ? [2, 1] : per === 4 ? [2, 2] : per === 6 ? [3, 2] : [3, 3];
    const cols = landscape ? base[0] : base[1];
    const rows = landscape ? base[1] : base[0];
    const margin = 18;
    const cellW = (sheetW - margin * 2 - gap * (cols - 1)) / cols;
    const cellH = (sheetH - margin * 2 - gap * (rows - 1)) / rows;

    progress(ctx, 4, 'Reading PDF');
    const src = await openSource(file);
    const pages = src.getPages();
    const out = await PDFDocument.create();
    const sheets = Math.ceil(pages.length / per);

    for (let s = 0; s < sheets; s += 1) {
      throwIfAborted(ctx.signal);
      const sheet = out.addPage([sheetW, sheetH]);
      for (let k = 0; k < per; k += 1) {
        const index = s * per + k;
        if (index >= pages.length) break;
        const sourcePage = pages[index];
        const vis = visualSize(sourcePage);
        const embedded = await embedWithBox(out, sourcePage);
        const r = Math.floor(k / cols);
        const c = k % cols;
        const cell = {
          x: margin + c * (cellW + gap),
          y: sheetH - margin - (r + 1) * cellH - r * gap,
          width: cellW,
          height: cellH,
        };
        const drawn = placeEmbedded(sheet, embedded, vis.rotation, cell, true);
        if (border) {
          sheet.drawRectangle({
            x: drawn.x,
            y: drawn.y,
            width: drawn.width,
            height: drawn.height,
            borderColor: rgb(0.55, 0.55, 0.55),
            borderWidth: 0.5,
          });
        }
      }
      progress(ctx, 8 + ((s + 1) / sheets) * 84, `Sheet ${s + 1} of ${sheets}`);
      await yieldToMain();
    }

    setProducer(out);
    progress(ctx, 94, 'Saving');
    const bytes = await saveDoc(out);
    return {
      files: [pdfResultFile(bytes, pdfFileName(file, `${per}-up`))],
      note:
        `Arranged ${pages.length} page${pages.length === 1 ? '' : 's'} onto ${sheets} sheet${sheets === 1 ? '' : 's'} ` +
        `(${per} per sheet). Links and form fields are not preserved.`,
    };
  },
};

export type OrganizeContext = RunContext;
