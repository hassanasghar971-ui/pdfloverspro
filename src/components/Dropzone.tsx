'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { snapshotFiles } from '@/lib/engine/snapshot-files';

const MIME_EXT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/rtf': ['.rtf'],
  'text/rtf': ['.rtf'],
};

const EXT_IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
};

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];

export function normalizeAccept(accept: unknown): string[] {
  const raw: unknown[] = Array.isArray(accept) ? accept : typeof accept === 'string' ? accept.split(',') : [];
  return raw
    .map((s) => String(s).trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function matchesAccept(file: File, accept: string[]): boolean {
  if (accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.some((tok) => {
    if (tok.startsWith('.')) return name.endsWith(tok);
    if (tok.endsWith('/*')) {
      if (type) return type.startsWith(tok.slice(0, -1));
      return tok === 'image/*' && IMAGE_EXT.some((e) => name.endsWith(e));
    }
    if (tok.includes('/')) {
      if (type === tok) return true;
      return (MIME_EXT[tok] ?? []).some((e) => name.endsWith(e));
    }
    return false;
  });
}

export function acceptLabel(accept: string[]): string {
  const out: string[] = [];
  for (const tok of accept) {
    let label: string;
    if (tok.startsWith('.')) label = tok.slice(1).toUpperCase();
    else if (tok === 'image/*') label = 'Images';
    else if (MIME_EXT[tok]) label = MIME_EXT[tok][0].slice(1).toUpperCase();
    else label = tok;
    if (!out.includes(label)) out.push(label);
  }
  return out.join(', ');
}

/**
 * Value for <input accept>. Image-only tools get MIME types so phones open the
 * photo picker (Gallery / Photos) instead of the generic file browser.
 * Every other tool keeps its extensions unchanged. Files are still validated by matchesAccept().
 */
export function inputAccept(accept: string[]): string {
  if (accept.length > 0 && accept.every((tok) => EXT_IMAGE_MIME[tok] !== undefined)) {
    return Array.from(new Set(accept.map((tok) => EXT_IMAGE_MIME[tok]))).join(',');
  }
  return accept.join(',');
}

export interface DropzoneProps {
  accept: string[];
  multiple: boolean;
  disabled?: boolean;
  compact?: boolean;
  title?: string;
  onFiles: (accepted: File[], rejected: File[]) => void;
}

function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

export default function Dropzone({ accept, multiple, disabled = false, compact = false, title, onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [active, setActive] = useState(false);
  const [readingLabel, setReadingLabel] = useState('');
  const [readProblems, setReadProblems] = useState<string[]>([]);
  const label = acceptLabel(accept);
  const reading = readingLabel !== '';
  const off = disabled || reading;

  /** `picked` must already be a plain array (copied synchronously from the event). */
  const deliver = async (picked: File[]): Promise<void> => {
    if (picked.length === 0) return;
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of picked) (matchesAccept(f, accept) ? accepted : rejected).push(f);

    setReadProblems([]);
    if (accepted.length === 0) {
      onFiles([], rejected);
      return;
    }

    setReadingLabel('Reading your files…');
    try {
      const { files, failed } = await snapshotFiles(accepted, {
        onProgress: (done, total) => {
          if (total > 1 && done < total) setReadingLabel(`Reading your files… ${done + 1} of ${total}`);
        },
      });
      if (failed.length > 0) setReadProblems(failed.map((f) => f.reason));
      if (files.length > 0 || rejected.length > 0) onFiles(files, rejected);
    } catch {
      // Unexpected failure while reading ahead: fall back to the original references.
      onFiles(accepted, rejected);
    } finally {
      setReadingLabel('');
    }
  };

  const open = () => {
    if (!off) inputRef.current?.click();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const picked = Array.from(input.files ?? []); // copy the references first
    // Clear the input only after the files have been read into memory.
    void deliver(picked).finally(() => {
      input.value = '';
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (off || !hasFiles(e)) return;
    e.preventDefault();
    depth.current += 1;
    setActive(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (off || !hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setActive(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current = 0;
    setActive(false);
    if (off) return;
    void deliver(Array.from(e.dataTransfer.files)); // copied synchronously
  };

  const heading =
    title ?? (multiple ? `Drop ${label || 'your'} files here` : `Drop your ${label || ''} file here`.replace('  ', ' '));

  return (
    <>
      <div
        className="dropzone"
        data-active={active ? 'true' : 'false'}
        role="button"
        tabIndex={off ? -1 : 0}
        aria-disabled={off}
        aria-label={`${heading}. Press Enter to browse files.`}
        onClick={open}
        onKeyDown={onKeyDown}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={off ? { opacity: 0.6, cursor: reading ? 'progress' : 'not-allowed' } : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          multiple={multiple}
          accept={inputAccept(accept)}
          disabled={off}
          onChange={onChange}
        />
        <div className={compact ? 'flex items-center justify-center gap-3 py-1' : 'flex flex-col items-center gap-2 py-6'}>
          <svg
            width={compact ? 22 : 40}
            height={compact ? 22 : 40}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-brand-600"
          >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
          </svg>
          <div className="text-center">
            <p className={compact ? 'text-sm font-semibold' : 'text-lg font-semibold'}>{reading ? readingLabel : heading}</p>
            {!compact && !reading && (
              <p className="mt-1 text-sm text-gray-600">
                or <span className="font-semibold text-brand-700 underline">click to browse</span>
                {label ? <> &middot; accepts {label}</> : null}
              </p>
            )}
          </div>
        </div>
      </div>

      {readProblems.length > 0 ? (
        <ul role="alert" className="mt-2 space-y-1 text-sm text-red-700">
          {readProblems.map((m, i) => (
            <li key={`${i}-${m.slice(0, 24)}`}>{m}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
