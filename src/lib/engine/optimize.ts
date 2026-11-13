// Optimize tools: compress PDF.

import { ToolError } from './types';
import type { HandlerMap } from './types';
import {
  formatBytes,
  pdfResultFile,
  sizeChange,
} from './shared';
import {
  bytesOf,
  optStr,
  progress,
  pdfFileName,
} from './handler-utils';
import { compressPdf } from './compression-helper';
import { rasterizeToPdf } from './raster-helper'; // or appropriate rasterization helper

const COMPRESS_PRESETS: Record<
  string,
  { level: 'low' | 'medium' | 'high'; raster?: { scale: number; quality: number } }
> = {
  low: { level: 'low' },
  medium: { level: 'medium', raster: { scale: 1.5, quality: 0.7 } },
  high: { level: 'high', raster: { scale: 1.0, quality: 0.5 } },
};

export const handlers: HandlerMap = {
  'compress-pdf': async (ctx, mem) => {
    const file = ctx.files[0];
    const levelKey = optStr(ctx.options, 'level', 'medium');
    const preset = COMPRESS_PRESETS[levelKey] ?? COMPRESS_PRESETS['medium'];

    progress(ctx, 4, 'Reading PDF');
    const original = await bytesOf(file);

    let best: Uint8Array | null = null;
    let imagesSeen = 0;
    let imagesDone = 0;

    // Pass 1: recompress JPEG images only. Text stays selectable.
    try {
      const r = await compressPdf(original, {
        level: preset.level,
        rasterFallback: false,
        signal: ctx.signal,
        onProgress: (percent, label) =>
          progress(ctx, 5 + (percent / 100) * (preset.raster ? 35 : 87), label ?? 'Optimizing images'),
      });
      imagesSeen = r.imagesSeen;
      imagesDone = r.imagesRecompressed;
      if (r.after < r.before) best = r.bytes;
    } catch (e) {
      const name = (e as { name?: string } | null)?.name;
      if (ctx.signal?.aborted || name === 'AbortError') throw new ToolError('Cancelled.', 'aborted');
      if (!preset.raster) {
        throw new ToolError(e instanceof Error ? e.message : 'Could not compress this PDF.', 'invalid-pdf');
      }
    }

    // Pass 2 (medium/high only): re-render pages as images. Text becomes unselectable.
    let usedRaster = false;
    const base = best ? best.length : original.length;
    if (preset.raster && (!best || best.length > original.length * 0.75)) {
      progress(ctx, 42, 'Re-rendering pages');
      const raster = await rasterizeToPdf(ctx, mem, file, original, {
        scale: preset.raster.scale,
        quality: preset.raster.quality,
        filter: 'none',
        from: 42,
        to: 94,
        label: 'Compressing pages',
        tolerant: false,
      });
      if (raster.bytes.length < base * 0.85) {
        best = raster.bytes;
        usedRaster = true;
      }
    }

    if (!best || best.length >= original.length) {
      return {
        files: [pdfResultFile(original, pdfFileName(file, 'compressed'))],
        note:
          'This PDF is already well optimized, so it could not be made smaller. ' +
          `Your original (${formatBytes(original.length)}) is returned unchanged.`,
      };
    }

    const detail = usedRaster
      ? ' Pages were converted to images to reach this size, so text can no longer be selected or searched.'
      : ` ${imagesDone} of ${imagesSeen} images were re-compressed. Text is unchanged.`;

    return {
      files: [pdfResultFile(best, pdfFileName(file, 'compressed'))],
      note: `${sizeChange(original.length, best.length)}.${detail} Method: ${usedRaster ? 'raster' : 'images'}.`,
    };
  },
};
