/* =============================================================================
 * PDF Lovers Pro – Snapshot picked files into memory
 *
 * Mobile browsers hand out File references backed by a content:// URI. If the
 * file is read late (or lives in a cloud-only folder) the read fails with
 * NotReadableError. snapshotFiles() reads every file once, immediately after
 * selection, and returns memory-backed File objects that never expire.
 * ========================================================================== */

export interface SnapshotFailure {
  name: string;
  reason: string;
}

export interface SnapshotResult {
  files: File[];
  failed: SnapshotFailure[];
}

export interface SnapshotOptions {
  /** Stop keeping files in RAM beyond this many bytes. Default 600 MB. */
  maxTotalBytes?: number;
  onProgress?: (done: number, total: number, name: string) => void;
  signal?: AbortSignal;
}

const DEFAULT_MAX_TOTAL = 600 * 1024 * 1024;
const RETRY_DELAYS_MS = [0, 250, 700];

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

function readWithFileReader(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error('Unexpected FileReader result.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed.'));
    reader.onabort = () => reject(new Error('Read aborted.'));
    reader.readAsArrayBuffer(blob);
  });
}

async function readOnce(file: File, strategy: number): Promise<ArrayBuffer> {
  if (strategy === 0 && typeof file.arrayBuffer === 'function') return file.arrayBuffer();
  if (strategy === 1) return readWithFileReader(file);
  return new Response(file).arrayBuffer();
}

/** Tries arrayBuffer -> FileReader -> Response, with short pauses between rounds. */
async function readBytes(file: File, signal?: AbortSignal): Promise<ArrayBuffer> {
  let lastError: unknown = null;
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay);
    for (let strategy = 0; strategy < 3; strategy++) {
      throwIfAborted(signal);
      try {
        return await readOnce(file, strategy);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e;
        lastError = e;
      }
    }
  }
  throw lastError ?? new Error('The file could not be read.');
}

type Sniffed = 'jpeg' | 'png' | 'pdf' | 'heic' | 'unknown';

function sniff(buf: ArrayBuffer): Sniffed {
  const b = new Uint8Array(buf, 0, Math.min(buf.byteLength, 16));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf';
  if (b.length >= 12) {
    const brand = String.fromCharCode(b[4], b[5], b[6], b[7]);
    if (brand === 'ftyp') {
      const sub = String.fromCharCode(b[8], b[9], b[10], b[11]);
      if (['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heim', 'heis'].includes(sub)) return 'heic';
    }
  }
  return 'unknown';
}

const MIME: Record<Exclude<Sniffed, 'heic' | 'unknown'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
};

function friendlyReason(error: unknown, name: string): string {
  const errName = error instanceof Error ? error.name : '';
  if (errName === 'NotReadableError' || errName === 'NotFoundError' || errName === 'SecurityError') {
    return `"${name}" could not be read from your device. If it is stored in Google Photos or a cloud folder, download it to the phone first, or pick it again from the Gallery or Files app.`;
  }
  return `"${name}" could not be read. Please pick the file again.`;
}

/**
 * Reads files one at a time (low peak memory) and returns memory-backed copies.
 * Files that cannot be read are listed in `failed`; the rest still succeed.
 */
export async function snapshotFiles(picked: File[], options: SnapshotOptions = {}): Promise<SnapshotResult> {
  const maxTotal = options.maxTotalBytes ?? DEFAULT_MAX_TOTAL;
  const files: File[] = [];
  const failed: SnapshotFailure[] = [];
  let kept = 0;

  for (let i = 0; i < picked.length; i++) {
    throwIfAborted(options.signal);
    const file = picked[i];
    options.onProgress?.(i, picked.length, file.name);

    if (kept + file.size > maxTotal) {
      failed.push({
        name: file.name,
        reason: `"${file.name}" was skipped because the selected files together are too large for your device's memory. Process them in smaller batches.`,
      });
      continue;
    }

    try {
      const buffer = await readBytes(file, options.signal);
      if (buffer.byteLength === 0) {
        failed.push({
          name: file.name,
          reason: `"${file.name}" is empty. If it is stored in the cloud, download it to the phone first.`,
        });
        continue;
      }
      const kind = sniff(buffer);
      if (kind === 'heic') {
        failed.push({
          name: file.name,
          reason: `"${file.name}" is a HEIC photo, which browsers cannot convert here. Change the camera format to "Most Compatible" (JPG), or export the photo as JPG first.`,
        });
        continue;
      }
      const type = file.type || (kind !== 'unknown' ? MIME[kind] : '');
      files.push(new File([buffer], file.name, { type, lastModified: file.lastModified }));
      kept += buffer.byteLength;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e;
      failed.push({ name: file.name, reason: friendlyReason(e, file.name) });
    }
  }

  options.onProgress?.(picked.length, picked.length, '');
  return { files, failed };
}
