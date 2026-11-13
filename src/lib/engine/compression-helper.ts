/* Recompresses JPEG images inside a PDF (main thread, canvas based). Text and vectors are untouched. */
import { PDFArray, PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFRef } from 'pdf-lib';

export type CompressLevel = 'low' | 'medium' | 'high';

export interface CompressOptions {
  level: CompressLevel;
  /** Kept for compatibility. The raster fallback lives in optimize.ts, not here. */
  rasterFallback?: boolean;
  signal?: AbortSignal;
  onProgress?: (percent: number, label?: string) => void;
}

export interface CompressResult {
  bytes: Uint8Array;
  method: 'unchanged' | 'images' | 'raster';
  before: number;
  after: number;
  imagesSeen: number;
  imagesRecompressed: number;
  note: string;
}

const PROFILES: Record<CompressLevel, { quality: number; maxDim: number }> = {
  low: { quality: 0.82, maxDim: 3000 },
  medium: { quality: 0.68, maxDim: 2000 },
  high: { quality: 0.55, maxDim: 1400 },
};

const MIN_IMAGE_BYTES = 20 * 1024;
const KEEP_IF_SMALLER_THAN = 0.92;

interface JpegInfo {
  width: number;
  height: number;
  components: number;
  bits: number;
  sof: number;
}

function jpegInfo(b: Uint8Array): JpegInfo | null {
  if (b.length < 12 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const m = b[i + 1];
    if (m === 0xff) {
      i++;
      continue;
    }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
      i += 2;
      continue;
    }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return {
        sof: m,
        bits: b[i + 4],
        height: (b[i + 5] << 8) | b[i + 6],
        width: (b[i + 7] << 8) | b[i + 8],
        components: b[i + 9],
      };
    }
    i += 2 + ((b[i + 2] << 8) | b[i + 3]);
  }
  return null;
}

function abortError(): Error {
  return new DOMException('Cancelled.', 'AbortError');
}

function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

interface Candidate {
  ref: PDFRef;
  stream: PDFRawStream;
  contents: Uint8Array;
  info: JpegInfo;
}

function isOnlyDct(filter: unknown): boolean {
  if (filter instanceof PDFName) return String(filter) === '/DCTDecode';
  if (filter instanceof PDFArray) return filter.size() === 1 && String(filter.lookup(0)) === '/DCTDecode';
  return false;
}

function isSimpleColorSpace(doc: PDFDocument, stream: PDFRawStream): boolean {
  void doc;
  const cs = stream.dict.lookup(PDFName.of('ColorSpace'));
  if (cs instanceof PDFName) {
    const n = String(cs);
    return n === '/DeviceGray' || n === '/DeviceRGB';
  }
  if (cs instanceof PDFArray && cs.size() > 0) return String(cs.lookup(0)) === '/ICCBased';
  return false;
}

function findCandidates(doc: PDFDocument): { candidates: Candidate[]; seen: number } {
  const candidates: Candidate[] = [];
  let seen = 0;
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (String(dict.lookup(PDFName.of('Subtype'))) !== '/Image') continue;
    seen++;

    if (!isOnlyDct(dict.lookup(PDFName.of('Filter')))) continue;
    if (dict.has(PDFName.of('SMask')) || dict.has(PDFName.of('Mask')) || dict.has(PDFName.of('Decode'))) continue;
    if (String(dict.lookup(PDFName.of('ImageMask'))) === 'true') continue;
    const bpc = dict.lookup(PDFName.of('BitsPerComponent'));
    if (!(bpc instanceof PDFNumber) || bpc.asNumber() !== 8) continue;
    if (!isSimpleColorSpace(doc, obj)) continue;

    const contents = obj.getContents();
    if (contents.length < MIN_IMAGE_BYTES) continue;
    const info = jpegInfo(contents);
    if (!info || info.sof > 0xc2 || info.bits !== 8) continue;
    if (info.components !== 1 && info.components !== 3) continue;

    candidates.push({ ref, stream: obj, contents, info });
  }
  return { candidates, seen };
}

async function recompressJpeg(
  source: Uint8Array,
  info: JpegInfo,
  quality: number,
  maxDim: number,
): Promise<{ bytes: Uint8Array; info: JpegInfo } | null> {
  if (typeof createImageBitmap !== 'function') return null;

  const longest = Math.max(info.width, info.height);
  const ratio = longest > maxDim ? maxDim / longest : 1;
  const w = Math.max(1, Math.round(info.width * ratio));
  const h = Math.max(1, Math.round(info.height * ratio));

  let bitmap: ImageBitmap | null = null;
  let canvas: HTMLCanvasElement | null = null;
  try {
    bitmap = await createImageBitmap(new Blob([source as unknown as BlobPart], { type: 'image/jpeg' }), {
      imageOrientation: 'none',
    });
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas!.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return null;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const outInfo = jpegInfo(bytes);
    if (!outInfo || outInfo.bits !== 8 || (outInfo.components !== 1 && outInfo.components !== 3)) return null;
    return { bytes, info: outInfo };
  } catch {
    return null;
  } finally {
    bitmap?.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

export async function compressPdf(bytes: Uint8Array, opts: CompressOptions): Promise<CompressResult> {
  const profile = PROFILES[opts.level];
  const report = (p: number, label?: string) => opts.onProgress?.(p, label);
  const before = bytes.length;

  checkAbort(opts.signal);
  report(2, 'Opening PDF');

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/encrypt/i.test(msg)) {
      throw new Error('This PDF is password-protected. Remove the password with Unlock PDF first.');
    }
    throw new Error('This PDF could not be read. It may be damaged. Try Repair PDF first.');
  }

  const { candidates, seen } = findCandidates(doc);
  let recompressed = 0;

  for (let i = 0; i < candidates.length; i++) {
    checkAbort(opts.signal);
    const c = candidates[i];
    report(5 + (90 * i) / candidates.length, `Optimizing image ${i + 1} of ${candidates.length}`);

    const result = await recompressJpeg(c.contents, c.info, profile.quality, profile.maxDim);
    if (result && result.bytes.length < c.contents.length * KEEP_IF_SMALLER_THAN) {
      const dict = doc.context.obj({
        Type: 'XObject',
        Subtype: 'Image',
        Width: result.info.width,
        Height: result.info.height,
        ColorSpace: result.info.components === 1 ? 'DeviceGray' : 'DeviceRGB',
        BitsPerComponent: 8,
        Filter: 'DCTDecode',
        Length: result.bytes.length,
      });
      doc.context.assign(c.ref, PDFRawStream.of(dict, result.bytes));
      recompressed++;
    }
    await tick();
  }

  if (recompressed === 0) {
    return {
      bytes,
      method: 'unchanged',
      before,
      after: before,
      imagesSeen: seen,
      imagesRecompressed: 0,
      note: seen === 0 ? 'No images found to recompress.' : 'No JPEG images could be made smaller.',
    };
  }

  checkAbort(opts.signal);
  report(96, 'Saving PDF');
  const saved = await doc.save({ useObjectStreams: true });

  if (saved.length >= before) {
    return {
      bytes,
      method: 'unchanged',
      before,
      after: before,
      imagesSeen: seen,
      imagesRecompressed: 0,
      note: 'Recompressing did not make the file smaller.',
    };
  }

  return {
    bytes: saved,
    method: 'images',
    before,
    after: saved.length,
    imagesSeen: seen,
    imagesRecompressed: recompressed,
    note: `Recompressed ${recompressed} of ${seen} images. Text stays selectable.`,
  };
}
