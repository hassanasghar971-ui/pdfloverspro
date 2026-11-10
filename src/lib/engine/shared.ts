/* =============================================================================
 * PDF Lovers Pro – Shared engine utilities
 * Used by every engine module. No heavy library is imported statically here.
 * ========================================================================== */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { PDFDocument } from 'pdf-lib';
import type { MemoryScope } from '../memory';
import {
  ToolError,
  type OptionValues,
  type ProgressFn,
  type ResultFile,
} from './types';

/* ================================ Constants ================================ */

export const MIME = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  jpg: 'image/jpeg',
  png: 'image/png',
  txt: 'text/plain;charset=utf-8',
  rtf: 'application/rtf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
} as const;

/** Per-file safety limit. Everything lives in browser RAM, so this protects weak devices. */
export const MAX_FILE_BYTES = 250 * 1024 * 1024;

/** Safari/iOS caps a canvas near 16.7M pixels. Stay safely under it everywhere. */
export const MAX_CANVAS_PIXELS = 16_000_000;
export const MAX_CANVAS_DIMENSION = 16_384;

export interface SizeLimits {
  perFile: number;
  total: number;
}

/**
 * Memory limits scaled to the device. Chrome reports navigator.deviceMemory; Safari does not,
 * so phones and tablets are detected from the user agent. The numbers are conservative guesses
 * (parsing a PDF can take several times its size in RAM), not measured values.
 */
export function getSizeLimits(): SizeLimits {
  const MB = 1024 * 1024;
  if (typeof navigator === 'undefined') return { perFile: MAX_FILE_BYTES, total: 500 * MB };
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (mem !== undefined && mem <= 2) return { perFile: 50 * MB, total: 100 * MB };
  if (mobile || (mem !== undefined && mem <= 4)) return { perFile: 100 * MB, total: 200 * MB };
  return { perFile: MAX_FILE_BYTES, total: 500 * MB };
}

/**
 * pdf.js loads CMaps (CJK fonts) and standard font data at runtime.
 * Default is jsDelivr (allowed by the CSP: connect-src https:).
 * To self-host, copy node_modules/pdfjs-dist/{cmaps,standard_fonts} into /public/pdfjs/
 * and set NEXT_PUBLIC_PDFJS_ASSET_BASE=/pdfjs
 */
const PDFJS_ASSET_BASE = process.env.NEXT_PUBLIC_PDFJS_ASSET_BASE ?? '';

/* ============================= Small utilities ============================= */

export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / Math.pow(1024, i);
  return `${i === 0 ? v.toFixed(0) : v.toFixed(digits)} ${units[i]}`;
}

export const yieldToMain = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ToolError('Cancelled.', 'aborted');
}

/** Map a 0-100 progress callback into the [from, to] slice of a parent callback. */
export function scaleProgress(parent: ProgressFn, from: number, to: number): ProgressFn {
  return (percent, message) => parent(from + ((to - from) * Math.max(0, Math.min(100, percent))) / 100, message);
}

/** Returns a function that advances progress by one unit of `total` each call. */
export function makeStepper(parent: ProgressFn, total: number, from = 0, to = 100) {
  let done = 0;
  return (message?: string) => {
    done = Math.min(done + 1, Math.max(total, 1));
    parent(from + ((to - from) * done) / Math.max(total, 1), message);
  };
}

/* ============================ Option accessors ============================= */

export function optString(o: OptionValues, key: string, fallback = ''): string {
  const v = o[key];
  return v === undefined || v === null ? fallback : String(v);
}

export function optNumber(o: OptionValues, key: string, fallback: number): number {
  const v = o[key];
  if (v === undefined || v === '' || typeof v === 'boolean') return fallback;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

export function optBool(o: OptionValues, key: string, fallback = false): boolean {
  const v = o[key];
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

/* ============================== File helpers =============================== */

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function baseName(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

/** Remove characters that are illegal in file names on Windows/macOS/Linux. */
export function safeFileName(name: string): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, ' ').trim();
  return (cleaned || 'file').slice(0, 120);
}

/** Make `name` unique inside `used` by appending " (2)", " (3)", ... */
export function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const ext = extOf(name);
  const stem = ext ? name.slice(0, -(ext.length + 1)) : name;
  let n = 2;
  let candidate = '';
  do {
    candidate = ext ? `${stem} (${n}).${ext}` : `${stem} (${n})`;
    n++;
  } while (used.has(candidate));
  used.add(candidate);
  return candidate;
}

/** e.g. outputName('Report.pdf', '-merged', 'pdf') => "Report-merged.pdf" */
export function outputName(inputName: string, suffix: string, ext: string): string {
  return `${safeFileName(baseName(inputName))}${suffix}.${ext}`;
}

/**
 * Does `file` satisfy a registry `accept` list such as ['.pdf', 'application/pdf']?
 * Matches by extension OR MIME type (mobile browsers often give an empty MIME type).
 */
export function fileMatchesAccept(file: File, accept: readonly string[]): boolean {
  const ext = extOf(file.name);
  const type = (file.type || '').toLowerCase();
  return accept.some((a) => {
    const rule = a.toLowerCase();
    if (rule.startsWith('.')) return ext === rule.slice(1);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export async function readFileBytes(file: File | Blob): Promise<Uint8Array> {
  const attempts: Array<() => Promise<ArrayBuffer>> = [
    () => file.arrayBuffer(),
    () =>
      new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) resolve(reader.result);
          else reject(new Error('Unexpected FileReader result.'));
        };
        reader.onerror = () => reject(reader.error ?? new Error('FileReader failed.'));
        reader.readAsArrayBuffer(file);
      }),
    () => new Response(file).arrayBuffer(),
  ];

  for (let round = 0; round < 2; round++) {
    if (round > 0) await new Promise<void>((resolve) => setTimeout(resolve, 250));
    for (const attempt of attempts) {
      try {
        return new Uint8Array(await attempt());
      } catch {
        /* try the next method */
      }
    }
  }

  const name = 'name' in file ? `"${(file as File).name}"` : 'the file';
  throw new ToolError(
    `Could not read ${name}. If it is stored in Google Photos or a cloud folder, download it to the phone first and pick it again.`,
  );
}

/** Decode text bytes: UTF-16 BOMs, then strict UTF-8, then Windows-1252 as a fallback. */
export function decodeText(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

export async function readFileText(file: File | Blob): Promise<string> {
  return decodeText(await readFileBytes(file));
}

/** Blob from bytes/text. The cast avoids TS 5.9 `Uint8Array<ArrayBufferLike>` vs BlobPart errors. */
export function toBlob(data: Blob | Uint8Array | ArrayBuffer | string, mime: string): Blob {
  if (data instanceof Blob) return data.type === mime ? data : new Blob([data], { type: mime });
  return new Blob([data as unknown as BlobPart], { type: mime });
}

export function makeResultFile(name: string, data: Blob | Uint8Array | ArrayBuffer | string, mime: string): ResultFile {
  return { name: safeFileName(name), blob: toBlob(data, mime), mime };
}

export function pdfResultFile(bytes: Uint8Array, name: string): ResultFile {
  return makeResultFile(name, bytes, MIME.pdf);
}

/* ========================= Image type detection/decoding =================== */

export type SniffedImage = 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'unknown';

/** Detect the real image type from magic bytes (users sometimes rename files). */
export function sniffImageType(b: Uint8Array): SniffedImage {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length > 7 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.length > 5 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
  if (b.length > 11 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  if (b.length > 2 && b[0] === 0x42 && b[1] === 0x4d) return 'bmp';
  return 'unknown';
}

interface DecodedImage {
  drawable: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

async function decodeImage(source: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      // 'from-image' applies EXIF rotation, so phone photos come out upright.
      const bmp = await createImageBitmap(source, { imageOrientation: 'from-image' });
      return { drawable: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(source);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new ToolError('This image could not be read. It may be corrupted or in an unsupported format.');
  }
  return {
    drawable: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    close: () => {
      URL.revokeObjectURL(url);
      img.src = '';
    },
  };
}

/** Decode any browser-supported image into a tracked canvas (downscaled if it exceeds `maxPixels`). */
export async function decodeImageToCanvas(
  source: Blob,
  mem: MemoryScope,
  maxPixels = MAX_CANVAS_PIXELS,
): Promise<HTMLCanvasElement> {
  const decoded = await decodeImage(source);
  try {
    let w = decoded.width;
    let h = decoded.height;
    if (w * h > maxPixels) {
      const r = Math.sqrt(maxPixels / (w * h));
      w = Math.max(1, Math.floor(w * r));
      h = Math.max(1, Math.floor(h * r));
    }
    const canvas = mem.canvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      mem.release(canvas);
      throw new ToolError('Your browser could not create a drawing surface (canvas).', 'unsupported');
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(decoded.drawable, 0, 0, w, h);
    return canvas;
  } finally {
    decoded.close();
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/jpeg' | 'image/png' = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new ToolError('Could not encode the image. The page may be too large for this device.', 'out-of-memory')),
      type,
      quality,
    );
  });
}

/* ============================ Page range parsing =========================== */

interface RangeToken {
  start: number; // 1-based, inclusive
  end: number; // 1-based, inclusive
}

const RANGE_HINT = 'Use commas and dashes, for example: 1-3, 5, 8-10.';

function resolveBound(raw: string, total: number): number {
  return raw === 'last' || raw === 'end' ? total : parseInt(raw, 10);
}

/**
 * Parse "1-3, 5, 8-", "2 4 6", "all", "last" etc. into 1-based inclusive ranges.
 * Open ends ("5-") run to the last page; a missing start ("-3") begins at page 1.
 */
export function parseRangeTokens(input: string, total: number): RangeToken[] {
  const norm = input
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[;\n\r\t]+/g, ',')
    .replace(/\s*-\s*/g, '-')
    .trim();
  if (!norm) return [];

  const out: RangeToken[] = [];
  for (const token of norm.split(/[,\s]+/).filter(Boolean)) {
    if (token === 'all') {
      out.push({ start: 1, end: total });
      continue;
    }
    const m = /^(\d+|last|end)?(-)?(\d+|last|end)?$/.exec(token);
    if (!m || token === '-' || (!m[2] && m[3])) {
      throw new ToolError(`"${token}" is not a valid page or range. ${RANGE_HINT}`);
    }
    let start: number;
    let end: number;
    if (!m[2]) {
      start = end = resolveBound(m[1]!, total);
    } else {
      start = m[1] ? resolveBound(m[1], total) : 1;
      end = m[3] ? resolveBound(m[3], total) : total;
    }
    if (start < 1 || end < 1) throw new ToolError('Page numbers start at 1.');
    if (start > total) throw new ToolError(`Page ${start} is outside this document (it has ${total} page${total === 1 ? '' : 's'}).`);
    if (end > total) throw new ToolError(`Page ${end} is outside this document (it has ${total} page${total === 1 ? '' : 's'}).`);
    if (end < start) throw new ToolError(`The range "${token}" is backwards. Write it as ${end}-${start}.`);
    out.push({ start, end });
  }
  return out;
}

export function allPageIndexes(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i);
}

/**
 * Parse a page selection into ZERO-based page indexes, in the order typed.
 * Empty input => every page (unless allowEmpty is false, then an error is thrown).
 */
export function parsePageList(
  input: string,
  total: number,
  opts: { allowEmpty?: boolean; dedupe?: boolean } = {},
): number[] {
  const { allowEmpty = true, dedupe = true } = opts;
  const tokens = parseRangeTokens(input, total);
  if (tokens.length === 0) {
    if (allowEmpty) return allPageIndexes(total);
    throw new ToolError(`Enter the pages you want. ${RANGE_HINT}`);
  }
  const seen = new Set<number>();
  const out: number[] = [];
  for (const t of tokens) {
    for (let p = t.start; p <= t.end; p++) {
      if (dedupe) {
        if (seen.has(p)) continue;
        seen.add(p);
      }
      out.push(p - 1);
    }
  }
  return out;
}

/** One group of zero-based indexes per token, e.g. "1-3, 5" => [[0,1,2],[4]] (used by Split PDF). */
export function parsePageGroups(input: string, total: number): number[][] {
  const tokens = parseRangeTokens(input, total);
  if (tokens.length === 0) throw new ToolError(`Enter at least one page range. ${RANGE_HINT}`);
  return tokens.map((t) => Array.from({ length: t.end - t.start + 1 }, (_, i) => t.start - 1 + i));
}

export function complementPages(total: number, removed: number[]): number[] {
  const drop = new Set(removed);
  return allPageIndexes(total).filter((i) => !drop.has(i));
}

/* ================================ Page sizes =============================== */

export type PageSizeKey = 'a3' | 'a4' | 'a5' | 'letter' | 'legal';

/** Portrait sizes in PDF points (1 pt = 1/72 inch). */
export const PAGE_SIZES_PT: Record<PageSizeKey, [number, number]> = {
  a3: [841.89, 1190.55],
  a4: [595.28, 841.89],
  a5: [419.53, 595.28],
  letter: [612, 792],
  legal: [612, 1008],
};

export function getPageSize(key: string, orientation: string = 'portrait'): [number, number] {
  const base = PAGE_SIZES_PT[key as PageSizeKey] ?? PAGE_SIZES_PT.a4;
  return orientation === 'landscape' ? [base[1], base[0]] : [base[0], base[1]];
}

/* ================================== Colour ================================= */

export function hexToRgb01(hex: string, fallback = '#000000'): { r: number; g: number; b: number } {
  const clean = (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex) ? hex : fallback).slice(1);
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

/* ============================ Text helpers (pdf-lib) ======================= */

const WIN_ANSI_EXTRA = new Set(Array.from('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'));

/**
 * pdf-lib's built-in fonts (Helvetica/Times/Courier) only encode WinAnsi and THROW on anything else.
 * This keeps encodable characters, normalises whitespace and replaces the rest.
 * Real Unicode (Urdu, Arabic, CJK...) needs an embedded font via fontkit and is handled per-tool.
 */
export function winAnsiSafe(text: string, replacement = '?'): string {
  let out = '';
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === '\n' || c === 0x2028 || c === 0x2029) out += '\n';
    else if (ch === '\t') out += '    ';
    else if (c === 0x0d || c < 0x20 || c === 0x7f) continue;
    else if ((c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff)) out += ch;
    else if (WIN_ANSI_EXTRA.has(ch)) out += ch;
    else if (c === 0x2011 || c === 0x2212) out += '-';
    else if ((c >= 0x200b && c <= 0x200f) || c === 0xfeff) continue;
    else out += replacement;
  }
  return out;
}

export interface TextMeasurer {
  widthOfTextAtSize(text: string, size: number): number;
}

function breakLongWord(word: string, font: TextMeasurer, size: number, maxWidth: number): string[] {
  const chunks: string[] = [];
  let cur = '';
  for (const ch of word) {
    if (cur && font.widthOfTextAtSize(cur + ch, size) > maxWidth) {
      chunks.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

/** Greedy word-wrap that preserves blank lines and leading indentation. Input must be winAnsiSafe(). */
export function wrapText(text: string, font: TextMeasurer, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const candidate = i === 0 ? w : `${line} ${w}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line !== '') lines.push(line);
      if (font.widthOfTextAtSize(w, size) > maxWidth) {
        const chunks = breakLongWord(w, font, size, maxWidth);
        for (let k = 0; k < chunks.length - 1; k++) lines.push(chunks[k]);
        line = chunks[chunks.length - 1] ?? '';
      } else {
        line = w;
      }
    }
    lines.push(line);
  }
  return lines;
}

/* ================================= Errors ================================== */

/** Convert any thrown value (pdf-lib, pdf.js, browser) into a friendly ToolError. */
export function normalizeError(e: unknown, fileName?: string): ToolError {
  if (e instanceof ToolError) return e;
  const err = e as { name?: string; message?: string; code?: number } | null;
  const name = err?.name ?? '';
  const msg = String(err?.message ?? e ?? '');
  const who = fileName ? `"${fileName}"` : 'This PDF';

  if (name === 'AbortError' || name === 'AbortException' || name === 'RenderingCancelledException') {
    return new ToolError('Cancelled.', 'aborted');
  }
  if (
    name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(msg)
  ) {
    return new ToolError(
      'This tool could not be loaded. Your connection may have dropped, or the site was updated while this page was open. Reload the page and try again.',
      'internal',
    );
  }
  if (name === 'PasswordException') {
    return err?.code === 2
      ? new ToolError('The password is incorrect. Please try again.', 'wrong-password')
      : new ToolError(`${who} is password-protected. Enter the password, or remove it with Unlock PDF first.`, 'password-required');
  }
  if (name === 'EncryptedPDFError' || /encrypted/i.test(msg)) {
    return new ToolError(`${who} is password-protected. Remove the password with Unlock PDF first.`, 'password-required');
  }
  if (
    name === 'InvalidPDFException' ||
    name === 'MissingPDFException' ||
    /No PDF header|Invalid PDF|Failed to parse|Invalid XRef|bad XRef|Expected instance of/i.test(msg)
  ) {
    return new ToolError(`${who} looks damaged or is not a valid PDF. Try the Repair PDF tool first.`, 'invalid-pdf');
  }
  if (e instanceof RangeError || /allocation|out of memory|Array buffer/i.test(msg)) {
    return new ToolError('The file is too large for this device’s memory. Close other tabs or try a smaller file.', 'out-of-memory');
  }
  return new ToolError(msg || 'Something went wrong while processing the file.', 'internal');
}

/* ================================== pdf-lib ================================ */

/** Load a PDF with pdf-lib (dynamic import) and translate failures into friendly errors. */
export async function loadPdfLibDocument(
  bytes: Uint8Array,
  opts: { ignoreEncryption?: boolean; fileName?: string } = {},
): Promise<PDFDocument> {
  const { PDFDocument: Doc } = await import('pdf-lib');
  try {
    return await Doc.load(bytes, {
      ignoreEncryption: opts.ignoreEncryption ?? false,
      updateMetadata: false,
      throwOnInvalidObject: false,
    });
  } catch (e) {
    throw normalizeError(e, opts.fileName);
  }
}

export async function savePdfBytes(doc: PDFDocument, opts: { objectStreams?: boolean } = {}): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: opts.objectStreams ?? true });
}

/* ================================== pdf.js ================================= */

type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfJsModule> | null = null;

/** pdf.js 4.x uses Promise.withResolvers, which Safari < 17.4 and older Chromium lack. */
function polyfillPromiseWithResolvers(): void {
  const P = Promise as unknown as { withResolvers?: unknown };
  if (typeof P.withResolvers === 'function') return;
  P.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

/** Load pdf.js once, client-side only, with its worker bundled by webpack as a static asset. */
export async function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === 'undefined') {
    throw new ToolError('PDF tools only run inside the browser.', 'unsupported');
  }
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      polyfillPromiseWithResolvers();
      const mod = await import('pdfjs-dist');
      mod.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return mod;
    })();
    pdfjsPromise.catch(() => {
      pdfjsPromise = null; // allow a retry after a failed load
    });
  }
  return pdfjsPromise;
}

export interface OpenPdfOptions {
  password?: string;
  signal?: AbortSignal;
}

/** Open a PDF with pdf.js. Caller MUST destroy the result (prefer withPdfDocument). */
export async function openPdfJsDocument(bytes: Uint8Array, opts: OpenPdfOptions = {}): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  throwIfAborted(opts.signal);
  const assetBase = PDFJS_ASSET_BASE || `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}`;
  const task = pdfjs.getDocument({
    // pdf.js transfers (detaches) the buffer it receives, so hand it a copy and keep ours usable.
    data: bytes.slice(),
    password: opts.password,
    isEvalSupported: false,
    useSystemFonts: true,
    cMapUrl: `${assetBase}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${assetBase}/standard_fonts/`,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  });
  const onAbort = () => {
    void task.destroy();
  };
  opts.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    return await task.promise;
  } catch (e) {
    void task.destroy();
    throw e;
  } finally {
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

/** Open, run `fn`, then ALWAYS clean up and destroy the document (frees the worker-side memory). */
export async function withPdfDocument<T>(
  bytes: Uint8Array,
  fn: (doc: PDFDocumentProxy) => Promise<T>,
  opts: OpenPdfOptions & { fileName?: string } = {},
): Promise<T> {
  let doc: PDFDocumentProxy;
  try {
    doc = await openPdfJsDocument(bytes, opts);
  } catch (e) {
    throw normalizeError(e, opts.fileName);
  }
  try {
    return await fn(doc);
  } finally {
    try {
      await doc.cleanup();
    } catch {
      /* ignore */
    }
    try {
      await doc.destroy();
    } catch {
      /* ignore */
    }
  }
}

export interface PageLoopOptions {
  signal?: AbortSignal;
  onProgress?: ProgressFn;
  from?: number;
  to?: number;
  label?: string;
}

/**
 * Visit pages one at a time: checks cancellation, calls page.cleanup() after each page,
 * reports progress and yields to the UI thread so the page never freezes.
 */
export async function forEachPdfPage(
  doc: PDFDocumentProxy,
  pageIndexes: number[],
  cb: (page: PDFPageProxy, pageIndex: number, position: number) => Promise<void>,
  opts: PageLoopOptions = {},
): Promise<void> {
  const total = pageIndexes.length;
  const from = opts.from ?? 0;
  const to = opts.to ?? 100;
  for (let pos = 0; pos < total; pos++) {
    throwIfAborted(opts.signal);
    const idx = pageIndexes[pos];
    const page = await doc.getPage(idx + 1);
    try {
      await cb(page, idx, pos);
    } finally {
      page.cleanup();
    }
    opts.onProgress?.(from + ((to - from) * (pos + 1)) / total, `${opts.label ?? 'Processing page'} ${pos + 1} of ${total}`);
    await yieldToMain();
  }
}

/** Page size in PDF points (rotation-aware). */
export function getPageSizePt(page: PDFPageProxy): { width: number; height: number } {
  const v = page.getViewport({ scale: 1 });
  return { width: v.width, height: v.height };
}

/** Largest scale <= desired that keeps the canvas inside device limits. */
export function clampScale(pageWidth: number, pageHeight: number, desired: number): number {
  let s = desired;
  if (pageWidth * pageHeight * s * s > MAX_CANVAS_PIXELS) {
    s = Math.sqrt(MAX_CANVAS_PIXELS / (pageWidth * pageHeight));
  }
  const longest = Math.max(pageWidth, pageHeight) * s;
  if (longest > MAX_CANVAS_DIMENSION) s = (s * MAX_CANVAS_DIMENSION) / longest;
  return Math.max(s, 0.1);
}

export interface RenderOptions {
  scale?: number;
  background?: string;
  signal?: AbortSignal;
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  scale: number;
}

/**
 * Render a page onto a canvas tracked by `mem`.
 * The caller owns the canvas and must call mem.release(canvas) as soon as it is finished with it.
 */
export async function renderPageToCanvas(page: PDFPageProxy, mem: MemoryScope, opts: RenderOptions = {}): Promise<RenderedPage> {
  const base = page.getViewport({ scale: 1 });
  const scale = clampScale(base.width, base.height, opts.scale ?? 2);
  const viewport = page.getViewport({ scale });
  const canvas = mem.canvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    mem.release(canvas);
    throw new ToolError('Your browser could not create a drawing surface (canvas).', 'unsupported');
  }
  const task = page.render({ canvasContext: ctx, viewport, background: opts.background ?? '#ffffff' });
  const onAbort = () => task.cancel();
  opts.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    await task.promise;
  } catch (e) {
    mem.release(canvas);
    throw e;
  } finally {
    opts.signal?.removeEventListener('abort', onAbort);
  }
  return { canvas, width: canvas.width, height: canvas.height, scale };
}

export interface RenderedBlob {
  blob: Blob;
  /** Pixel size of the image. */
  width: number;
  height: number;
  /** Page size in PDF points. */
  pageWidth: number;
  pageHeight: number;
}

/** Render a page to a JPEG/PNG blob and purge the canvas immediately. */
export async function renderPageToBlob(
  page: PDFPageProxy,
  mem: MemoryScope,
  opts: RenderOptions & { type?: 'image/jpeg' | 'image/png'; quality?: number } = {},
): Promise<RenderedBlob> {
  const { width: pageWidth, height: pageHeight } = getPageSizePt(page);
  const rendered = await renderPageToCanvas(page, mem, opts);
  try {
    const blob = await canvasToBlob(rendered.canvas, opts.type ?? 'image/jpeg', opts.quality ?? 0.92);
    return { blob, width: rendered.width, height: rendered.height, pageWidth, pageHeight };
  } finally {
    mem.release(rendered.canvas);
  }
}

export const parseScale = (value: string | number, fallback = 2): number => {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/* ============================ pdf.js text extraction ======================= */

export interface TextRun {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLine {
  y: number;
  height: number;
  text: string;
  runs: TextRun[];
}

interface RawTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

function joinRuns(runs: TextRun[]): string {
  let out = '';
  let prev: TextRun | null = null;
  for (const r of runs) {
    if (prev && out) {
      const gap = r.x - (prev.x + prev.width);
      const spaceWidth = Math.max(r.height, prev.height) * 0.18;
      if (gap > spaceWidth && !/\s$/.test(out) && !/^\s/.test(r.str)) out += ' ';
    }
    out += r.str;
    prev = r;
  }
  return out.replace(/\s+$/, '');
}

/**
 * Rebuild reading-order lines from pdf.js text items.
 * Limits: rotated text and multi-column layouts can interleave; complex tables need cleanup afterwards.
 */
export async function extractTextLines(page: PDFPageProxy): Promise<TextLine[]> {
  const content = await page.getTextContent();
  const runs: TextRun[] = [];
  for (const raw of content.items as unknown[]) {
    const item = raw as Partial<RawTextItem>;
    if (typeof item.str !== 'string' || item.str === '' || !item.transform) continue;
    runs.push({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width ?? 0,
      height: item.height || Math.abs(item.transform[3]) || 10,
    });
  }
  runs.sort((a, b) => b.y - a.y || a.x - b.x);

  const groups: { y: number; height: number; runs: TextRun[] }[] = [];
  for (const run of runs) {
    const last = groups[groups.length - 1];
    const tolerance = Math.max(2, run.height * 0.5);
    if (last && Math.abs(run.y - last.y) <= tolerance) {
      last.runs.push(run);
      last.height = Math.max(last.height, run.height);
    } else {
      groups.push({ y: run.y, height: run.height, runs: [run] });
    }
  }

  return groups
    .map((g) => {
      g.runs.sort((a, b) => a.x - b.x);
      return { y: g.y, height: g.height, text: joinRuns(g.runs), runs: g.runs };
    })
    .filter((l) => l.text.trim() !== '');
}

/** Lines to text. With `paragraphs`, larger vertical gaps become blank lines. */
export function linesToText(lines: TextLine[], opts: { paragraphs?: boolean } = {}): string {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (opts.paragraphs && i > 0) {
      const gap = lines[i - 1].y - lines[i].y;
      const ref = Math.max(lines[i - 1].height, lines[i].height);
      if (gap > ref * 1.7) out.push('');
    }
    out.push(lines[i].text);
  }
  return out.join('\n');
}

/* ============================= ZIP + download ============================== */

export async function zipResultFiles(
  files: ResultFile[],
  opts: { compress?: boolean; onProgress?: ProgressFn } = {},
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const used = new Set<string>();
  for (const f of files) zip.file(uniqueName(safeFileName(f.name), used), f.blob);
  return zip.generateAsync(
    {
      type: 'blob',
      compression: opts.compress === false ? 'STORE' : 'DEFLATE',
      compressionOptions: { level: 6 },
      streamFiles: true,
    },
    (meta) => opts.onProgress?.(meta.percent, 'Packaging ZIP…'),
  );
}

/** Save a blob. file-saver creates the object URL and revokes it itself after the download starts. */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const { saveAs } = await import('file-saver');
  saveAs(blob, safeFileName(filename));
}

/** One file downloads directly; several files are zipped first. */
export async function downloadResultFiles(files: ResultFile[], zipName = 'pdflovers-results.zip'): Promise<void> {
  if (files.length === 0) return;
  if (files.length === 1) {
    await downloadBlob(files[0].blob, files[0].name);
    return;
  }
  const zip = await zipResultFiles(files);
  await downloadBlob(zip, zipName);
}
