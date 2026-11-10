export type FileKind = 'pdf' | 'jpeg' | 'png' | 'webp' | 'gif' | 'zip' | 'unknown';

export type FileIntakeCode =
  | 'EMPTY'
  | 'TOO_LARGE'
  | 'TOO_MANY'
  | 'WRONG_TYPE'
  | 'UNREADABLE'
  | 'ENCRYPTED'
  | 'CORRUPT'
  | 'OUT_OF_MEMORY'
  | 'ABORTED';

export class FileIntakeError extends Error {
  readonly code: FileIntakeCode;
  readonly fileName?: string;

  constructor(code: FileIntakeCode, message: string, fileName?: string) {
    super(message);
    this.name = 'FileIntakeError';
    this.code = code;
    this.fileName = fileName;
  }
}

export type IntakeRules = {
  allowed: FileKind[];
  maxFileBytes?: number;
  maxTotalBytes?: number;
  maxFiles?: number;
};

export type RejectedFile = { file: File; code: FileIntakeCode; message: string };

export function sniffType(bytes: Uint8Array): FileKind {
  const b = (i: number): number => bytes[i] ?? 0;
  if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return 'pdf';
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'jpeg';
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return 'png';
  if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46) return 'gif';
  if (b(0) === 0x50 && b(1) === 0x4b && (b(2) === 0x03 || b(2) === 0x05)) return 'zip';
  if (
    b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 &&
    b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50
  ) {
    return 'webp';
  }
  return 'unknown';
}

export function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

export function validateFiles(
  files: File[],
  rules: IntakeRules
): { accepted: File[]; rejected: RejectedFile[] } {
  const accepted: File[] = [];
  const rejected: RejectedFile[] = [];
  let total = 0;

  for (const file of files) {
    if (rules.maxFiles !== undefined && accepted.length >= rules.maxFiles) {
      rejected.push({
        file,
        code: 'TOO_MANY',
        message: 'Only ' + rules.maxFiles + ' files are allowed at once.',
      });
      continue;
    }
    if (file.size === 0) {
      rejected.push({ file, code: 'EMPTY', message: file.name + ' is empty (0 bytes).' });
      continue;
    }
    if (rules.maxFileBytes !== undefined && file.size > rules.maxFileBytes) {
      rejected.push({
        file,
        code: 'TOO_LARGE',
        message:
          file.name + ' is ' + formatBytes(file.size) + '. The limit is ' +
          formatBytes(rules.maxFileBytes) + ' on this device.',
      });
      continue;
    }
    if (rules.maxTotalBytes !== undefined && total + file.size > rules.maxTotalBytes) {
      rejected.push({
        file,
        code: 'TOO_LARGE',
        message: 'Total size would exceed ' + formatBytes(rules.maxTotalBytes) + '.',
      });
      continue;
    }
    total += file.size;
    accepted.push(file);
  }
  return { accepted, rejected };
}

export async function readFileBytes(file: File, signal?: AbortSignal): Promise<Uint8Array> {
  if (signal?.aborted) throw new FileIntakeError('ABORTED', 'Cancelled.', file.name);
  try {
    const buf = await file.arrayBuffer();
    if (signal?.aborted) throw new FileIntakeError('ABORTED', 'Cancelled.', file.name);
    return new Uint8Array(buf);
  } catch (err) {
    if (err instanceof FileIntakeError) throw err;
    if (err instanceof DOMException) {
      if (err.name === 'NotFoundError') {
        throw new FileIntakeError(
          'UNREADABLE',
          file.name + ' was moved or deleted after you selected it. Select it again.',
          file.name
        );
      }
      if (err.name === 'NotReadableError' || err.name === 'SecurityError') {
        throw new FileIntakeError(
          'UNREADABLE',
          'The browser cannot read ' + file.name +
            '. It may be in cloud storage, changed on disk, or permission was lost. Save a copy on this device and select it again.',
          file.name
        );
      }
    }
    if (err instanceof RangeError) {
      throw new FileIntakeError(
        'OUT_OF_MEMORY',
        'Not enough memory to open ' + file.name + '. Close other tabs or try a smaller file.',
        file.name
      );
    }
    throw new FileIntakeError('UNREADABLE', 'Could not read ' + file.name + '.', file.name);
  }
}

export async function loadPdfSafe(bytes: Uint8Array, fileName: string) {
  const { PDFDocument } = await import('pdf-lib');
  if (sniffType(bytes) !== 'pdf') {
    throw new FileIntakeError('WRONG_TYPE', fileName + ' is not a PDF file.', fileName);
  }
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (msg.indexOf('encrypt') !== -1) {
      throw new FileIntakeError(
        'ENCRYPTED',
        fileName + ' is password protected. Unlock it first.',
        fileName
      );
    }
    throw new FileIntakeError(
      'CORRUPT',
      fileName + ' looks damaged. Try the Repair PDF tool first.',
      fileName
    );
  }
}
