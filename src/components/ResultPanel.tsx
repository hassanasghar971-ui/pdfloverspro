'use client';

import { useEffect, useRef, useState } from 'react';
import { downloadResultFiles, formatBytes } from '@/lib/pdf-engine';
import type { ToolResult } from '@/lib/pdf-engine';

const MAX_PREVIEWS = 12;

export interface ResultPanelProps {
  result: ToolResult;
  zipName: string;
  onReset: () => void;
}

export default function ResultPanel({ result, zipName, onReset }: ResultPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [copied, setCopied] = useState(false);

  const files = result.files;
  const total = files.reduce((n, f) => n + f.blob.size, 0);
  const reportText =
    result.report === undefined || result.report === null
      ? ''
      : typeof result.report === 'string'
        ? result.report
        : JSON.stringify(result.report, null, 2);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // One object URL per file, created after mount and revoked on reset/unmount.
  useEffect(() => {
    const made = files.map((f) => URL.createObjectURL(f.blob));
    setUrls(made);
    return () => {
      for (const u of made) URL.revokeObjectURL(u);
    };
  }, [files]);

  const ready = urls.length === files.length;

  const previews = files
    .map((f, i) => ({ name: f.name, mime: f.mime, url: urls[i] }))
    .filter((p) => p.url && p.mime.startsWith('image/'))
    .slice(0, MAX_PREVIEWS);

  const imageCount = files.filter((f) => f.mime.startsWith('image/')).length;

  const saveAll = async () => {
    setProblem('');
    setBusy(true);
    try {
      await downloadResultFiles(files, zipName);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'The ZIP file could not be created.');
    } finally {
      setBusy(false);
    }
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setProblem('Copy is not available in this browser. Select the text and copy it manually.');
    }
  };

  const multi = files.length > 1;

  return (
    <div className="card space-y-4 border-green-300 p-4 sm:p-6" aria-live="polite">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-green-800 outline-none">
          Done &mdash; {files.length} {files.length === 1 ? 'file' : 'files'} ready ({formatBytes(total)})
        </h2>
        <p className="mt-1 text-sm text-gray-600">Created in your browser. Nothing was uploaded.</p>
      </div>

      {result.note ? (
        <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {result.note}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {multi ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={saveAll} disabled={busy}>
            {busy ? 'Building ZIP…' : `Download all (ZIP, ${files.length} files)`}
          </button>
        ) : ready ? (
          <a
            className="btn btn-primary btn-lg text-center no-underline"
            href={urls[0]}
            download={files[0].name}
          >
            Download {files[0].name}
          </a>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" disabled>
            Preparing…
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-lg" onClick={onReset}>
          Start over
        </button>
      </div>

      {!multi && ready ? (
        <p className="text-sm text-gray-600">
          Nothing happened?{' '}
          <a
            className="font-semibold text-blue-700 underline"
            href={urls[0]}
            target="_blank"
            rel="noopener"
          >
            Open the file in a new tab
          </a>{' '}
          and save it from there.
        </p>
      ) : null}

      {problem ? (
        <p role="alert" className="text-sm text-red-700">
          {problem}
        </p>
      ) : null}

      {multi && (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200" aria-label="Result files">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium" title={f.name}>
                  {f.name}
                </span>
                <span className="text-xs text-gray-500">{formatBytes(f.blob.size)}</span>
              </span>
              {urls[i] ? (
                <a
                  className="btn btn-secondary shrink-0 text-sm no-underline"
                  href={urls[i]}
                  download={f.name}
                >
                  Download
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {previews.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Preview{imageCount > previews.length ? ` (first ${previews.length})` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {previews.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${p.name}-${i}`}
                src={p.url}
                alt={p.name}
                loading="lazy"
                className="h-28 w-auto rounded border border-gray-200 bg-white object-contain"
              />
            ))}
          </div>
        </div>
      )}

      {reportText ? (
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-700">Summary</p>
            <button type="button" className="btn btn-ghost text-sm" onClick={copyReport}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed">
            {reportText}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
