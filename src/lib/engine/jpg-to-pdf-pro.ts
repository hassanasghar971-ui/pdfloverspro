import { PDFDocument } from 'pdf-lib';
import { FileIntakeError, readFileBytes, sniffType } from './file-intake';

export type PageSizeName = 'fit' | 'a4' | 'letter' | 'legal' | 'a3';
export type OrientationName = 'auto' | 'portrait' | 'landscape';

export type ImagesToPdfOptions = {
  pageSize?: PageSizeName;
  orientation?: OrientationName;
  marginMm?: number;
  jpegQuality?: number;
  maxPixels?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
};

const MM_TO_PT = 72 / 25.4;

const PAGE_SIZES: Record<Exclude<PageSizeName, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
};

export function readJpegOrientation(bytes: Uint8Array): number {
  const b = (i: number): number => bytes[i] ?? 0;
  if (b(0) !== 0xff || b(1) !== 0xd8) return 1;
  let off = 2;
  while (off + 4 < bytes.length) {
    if (b(off) !== 0xff) return 1;
    const marker = b(off + 1);
    const len = (b(off + 2) << 8) | b(off + 3);
    if (marker === 0xda) return 1;
    const isExif =
      marker === 0xe1 && len >= 8 &&
      b(off + 4) === 0x45 && b(off + 5) === 0x78 && b(off + 6) === 0x69 && b(off + 7) === 0x66;
    if (isExif) {
      const t = off + 10;
      const little = b(t) === 0x49;
      const u16 = (p: number): number =>
        little ? b(p) | (b(p + 1) << 8) : (b(p) << 8) | b(p + 1);
      const u32 = (p: number): number =>
        little
          ? (b(p) | (b(p + 1) << 8) | (b(p + 2) << 16) | (b(p + 3) << 24)) >>> 0
          : ((b(p) << 24) | (b(p + 1) << 16) | (b(p + 2) << 8) | b(p + 3)) >>> 0;
      const ifd = t + u32(t + 4);
      if (ifd + 2 > bytes.length) return 1;
      const count = u16(ifd);
      for (let i = 0; i < count; i++) {
        const e = ifd + 2 + i * 12;
        if (e + 12 > bytes.length) break;
        if (u16(e) === 0x0112) {
          const v = u16(e + 8);
          return v >= 1 && v <= 8 ? v : 1;
        }
      }
      return 1;
    }
    off += 2 + len;
  }
  return 1;
}

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed (image too large for this device).'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject);
      },
      'image/jpeg',
      quality
    );
  });
}

async function decodeToJpeg(
  file: File,
  quality: number,
  maxPixels: number
): Promise<Uint8Array> {
  let bitmap: ImageBitmap | null = null;
  let canvas: HTMLCanvasElement | null = null;
  try {
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      throw new FileIntakeError(
        'WRONG_TYPE',
        file.name + ' could not be decoded. Convert it to JPG or PNG first.',
        file.name
      );
    }
    const scale = Math.min(1, Math.sqrt(maxPixels / (bitmap.width * bitmap.height)));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new FileIntakeError('OUT_OF_MEMORY', 'The browser could not create a drawing surface.', file.name);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    return await canvasToJpegBytes(canvas, quality);
  } finally {
    if (bitmap) bitmap.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

function pageDimensions(
  size: PageSizeName,
  orientation: OrientationName,
  imgW: number,
  imgH: number,
  marginPt: number
): [number, number] {
  if (size === 'fit') {
    const w = Math.min(14400, imgW * 0.75 + marginPt * 2);
    const h = Math.min(14400, imgH * 0.75 + marginPt * 2);
    return [Math.max(w, 36), Math.max(h, 36)];
  }
  const [bw, bh] = PAGE_SIZES[size];
  const landscape =
    orientation === 'landscape' || (orientation === 'auto' && imgW > imgH);
  return landscape ? [bh, bw] : [bw, bh];
}

export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions = {}
): Promise<Uint8Array> {
  const pageSize = options.pageSize ?? 'a4';
  const orientation = options.orientation ?? 'auto';
  const marginPt = Math.min(50, Math.max(0, options.marginMm ?? 10)) * MM_TO_PT;
  const quality = Math.min(1, Math.max(0.3, options.jpegQuality ?? 0.92));
  const maxPixels = options.maxPixels ?? 40_000_000;
  const signal = options.signal;

  if (files.length === 0) {
    throw new FileIntakeError('EMPTY', 'Add at least one image.');
  }

  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    if (signal?.aborted) throw new FileIntakeError('ABORTED', 'Cancelled.', file.name);

    let bytes: Uint8Array | null = await readFileBytes(file, signal);
    const kind = sniffType(bytes);
    let image;

    if (kind === 'jpeg' && readJpegOrientation(bytes) === 1) {
      try {
        image = await doc.embedJpg(bytes);
      } catch {
        image = undefined;
      }
    } else if (kind === 'png') {
      try {
        image = await doc.embedPng(bytes);
      } catch {
        image = undefined;
      }
    } else if (kind === 'pdf' || kind === 'zip' || kind === 'unknown') {
      if (kind !== 'unknown') {
        throw new FileIntakeError('WRONG_TYPE', file.name + ' is not an image.', file.name);
      }
    }

    if (!image) {
      const jpeg = await decodeToJpeg(file, quality, maxPixels);
      image = await doc.embedJpg(jpeg);
    }
    bytes = null;

    const [pw, ph] = pageDimensions(pageSize, orientation, image.width, image.height, marginPt);
    const page = doc.addPage([pw, ph]);
    const availW = Math.max(1, pw - marginPt * 2);
    const availH = Math.max(1, ph - marginPt * 2);
    const scale = Math.min(availW / image.width, availH / image.height);
    const dw = image.width * scale;
    const dh = image.height * scale;
    page.drawImage(image, {
      x: (pw - dw) / 2,
      y: (ph - dh) / 2,
      width: dw,
      height: dh,
    });

    options.onProgress?.(i + 1, files.length);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  return doc.save();
}
