/* Pure merge logic. Runs inside the worker, or on the main thread as a fallback. */
import { PDFDocument } from 'pdf-lib';

export interface MergeInput {
  name: string;
  bytes: Uint8Array;
}

export type MergeProgress = (percent: number, label: string) => void;

export async function mergePdfBytes(inputs: MergeInput[], onProgress?: MergeProgress): Promise<Uint8Array> {
  if (inputs.length < 2) throw new Error('Select at least two PDF files to merge.');

  const out = await PDFDocument.create();
  out.setProducer('PDF Lovers Pro');

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    onProgress?.((i / inputs.length) * 90, `Merging ${input.name} (${i + 1} of ${inputs.length})`);

    let src: PDFDocument;
    try {
      src = await PDFDocument.load(input.bytes, { updateMetadata: false, throwOnInvalidObject: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/encrypt/i.test(msg)) {
        throw new Error(`"${input.name}" is password-protected. Remove the password with Unlock PDF first.`);
      }
      throw new Error(`"${input.name}" could not be read. It may be damaged or not a real PDF.`);
    }

    if (src.getPageCount() === 0) throw new Error(`"${input.name}" has no pages.`);

    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) out.addPage(page);
  }

  onProgress?.(92, 'Saving merged PDF');
  return out.save({ useObjectStreams: true });
}
