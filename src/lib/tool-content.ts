// src/lib/tool-content.ts
// Complete hand-written content for all 42 tools in PDF Lovers Pro.
// Applied as an override over template-generated copy in tools-registry.ts.

import type { FaqItem } from './tools-registry';

export interface ToolContent {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2s: [string, string, string, string];
  paragraphs: [string, string, string, string];
  steps: string[];
  faqs: FaqItem[];
  keywords: string[];
}

const uploadFaq = (name: string): FaqItem => ({
  q: 'Are my files uploaded to a server?',
  a: `No. ${name} runs in your browser, so your files are processed on your device and are not sent to PDF Lovers Pro's servers. The site does show third-party ads (see the Privacy Policy), so avoid any online tool for documents that must never leave systems you control.`,
});

export const TOOL_CONTENT: Record<string, ToolContent> = {
  /* -------------------------------------------------------------------------- */
  /*                            1. CORE 10 TOOLS                                */
  /* -------------------------------------------------------------------------- */

  'merge-pdf': {
    metaTitle: 'Merge PDF Files Online, Free and No Upload',
    metaDescription: 'Combine multiple PDFs into one file in the order you choose. Runs in your browser, with no upload, no sign-up and no watermark.',
    h1: 'Merge PDF Files Online for Free',
    h2s: ['Combine PDFs into one document', 'What happens to your pages during a merge', 'Practical ways people use Merge PDF', 'Limits, bookmarks and privacy'],
    paragraphs: [
      `Merge PDF takes two or more PDF files and joins them into a single document. You add the files, put them in the order you want, and the tool produces one PDF whose pages run from the first file's first page to the last file's last page. There is no account to create and no watermark is added to the result. It is the quickest way to turn a folder of loose scans, exports and attachments into one file that is easy to send, print or archive.`,
      `Each file is opened inside your browser tab, and its pages are copied one at a time into a new document. Pages are copied rather than redrawn, so text stays selectable, images keep their original quality and embedded fonts stay embedded. The order in the list is the order in the output, and you can drag rows or use the arrow buttons to rearrange them before you start. You can combine up to 100 files in one run. The practical ceiling is your device's memory, so a phone copes with fewer large scans than a laptop does.`,
      `Merging is routine in office and student life. Finance teams combine a month of invoices into one statement for the accountant. Job applicants put a cover letter, CV and certificates into a single attachment so recruiters open one file instead of four. Students join lecture handouts into a study pack, and people applying for a visa or a loan merge ID scans, bank statements and forms into the single upload a portal allows. Property managers and lawyers use it to assemble bundles where every page must sit in a fixed sequence.`,
      `Decide the order before you merge, because changing it afterwards means running the tool again. Bookmarks, outlines and interactive form fields from the original files are not carried into the combined document, so flatten completed forms first if their contents matter. If your file asks for a password before it opens, remove that protection with a tool you trust first, and only do this for documents you are allowed to open. If the combined file is too big for an email limit, run it through Compress PDF afterwards. Your files are processed in your browser and are not uploaded to our servers, and closing the tab releases the memory they used.`,
    ],
    steps: [
      'Click the upload area or drag in two or more PDF files.',
      'Reorder the list by dragging rows or using the arrows. The top file supplies the first pages.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the combined PDF and check the page order before you share it.',
    ],
    faqs: [
      { q: 'How many PDF files can I merge at once?', a: `From two up to 100 files in one run. In practice your device's memory sets the limit, so a phone handles fewer large scans than a laptop.` },
      { q: 'Does merging lower the quality of my pages?', a: 'No. Pages are copied into the new file rather than redrawn, so text stays selectable and images keep their original quality.' },
      { q: 'Can I change the order after the files are merged?', a: 'Not inside the finished file. Reorder the list and run Merge PDF again, or use Extract Pages to pick pages in a new order.' },
      { q: 'Why are my bookmarks and form fields missing from the result?', a: 'Pages are copied without the document outline and interactive form data of the originals. Flatten completed forms first if their contents must survive.' },
      uploadFaq('Merge PDF'),
    ],
    keywords: ['merge pdf', 'combine pdf files', 'join pdf online', 'merge pdf free no upload', 'pdf merger'],
  },

  'split-pdf': {
    metaTitle: 'Split PDF by Page Range, Free and No Upload',
    metaDescription: 'Split a PDF by page ranges, every N pages, or one file per page. Files stay in your browser and results arrive in one ZIP.',
    h1: 'Split PDF Files Online for Free',
    h2s: ['Cut one PDF into smaller files', 'Three ways to split a document', 'Everyday reasons to split a PDF', 'Before you split: limits and privacy'],
    paragraphs: [
      `Split PDF breaks a single document into several smaller PDFs. You decide where the cuts go: by page ranges you type, in equal chunks of a fixed number of pages, or as one file per page. When the job produces more than one file, everything is delivered together in a ZIP archive, so you download once and nothing gets lost in your downloads folder. Your original file is never altered, and you can run the tool again with different settings as often as you like.`,
      `The three modes suit different jobs. Ranges mode takes groups written the way you would in a print dialog, for example 1-3, 4-6, 7, and turns each comma-separated group into its own file. Every N pages mode slices the document into equal parts, and the last file simply holds whatever pages remain. The every-page mode gives one PDF per page. Ranges may overlap, so a page listed in two groups is copied into both files. Keep your ranges inside the document's page count.`,
      `People split PDFs to share only what is needed. A scanned book can become one file per chapter. A signed page can be pulled out of a long contract. HR teams break a combined payslip run into one file per employee, so each person receives only their own. Large reports are cut into parts that fit under an email attachment limit, and a multi-invoice export becomes individual invoices that can be filed separately. Teachers split exam papers by section, and researchers separate one article from the journal issue it arrived in.`,
      `Open the file normally first to make sure it is not locked, because a protected document cannot be split until the protection has been removed by someone who is allowed to do so. Bookmarks, outlines and interactive form fields are not carried into the pieces, so keep the original if you still need them. Splitting a very long file into one file per page creates a very large number of files and needs more memory, so for long documents prefer ranges or chunks. Your document is processed in your browser and is not uploaded to our servers, and the ZIP is built on your device.`,
    ],
    steps: [
      'Add the PDF you want to split by dragging it in or clicking the upload area.',
      'Choose a split mode, then type your page ranges or the number of pages per file.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the ZIP and open a couple of the files to confirm the pages are right.',
    ],
    faqs: [
      { q: 'How do I write page ranges?', a: 'Use hyphens for runs and commas between groups. For example, 1-3, 4-6, 9 creates three files, and each group becomes its own PDF.' },
      { q: 'Can I save every page as a separate PDF?', a: 'Yes. Choose the every-page option and you receive one PDF per page, delivered together in a ZIP.' },
      { q: 'What does the Every N pages mode do?', a: 'It cuts the document into equal parts of N pages. The last file holds whatever pages remain.' },
      { q: 'Will the split files lose quality?', a: 'No. Pages are copied, not re-rendered. Bookmarks and interactive form fields are not carried into the pieces, though.' },
      uploadFaq('Split PDF'),
    ],
    keywords: ['split pdf', 'split pdf by page range', 'separate pdf pages', 'split pdf online free', 'divide pdf into multiple files'],
  },

  'compress-pdf': {
    metaTitle: 'Compress PDF Online, Free and No Upload',
    metaDescription: 'Reduce PDF size for email and forms. Lossless mode keeps text selectable, stronger modes shrink more. Runs in your browser.',
    h1: 'Compress PDF Online for Free',
    h2s: ['Make a PDF small enough to send', 'Lossless clean-up versus image-based compression', 'When compressing a PDF is worth it', 'Honest expectations and privacy'],
    paragraphs: [
      `Compress PDF reduces the size of a document so it fits an email attachment limit, an online application form or a messaging app. It does this inside your browser, with no upload and no waiting in a server queue. You choose between three levels. The gentlest keeps your text exactly as it is. The stronger two trade text selectability for a much smaller file. Compare the size of the result with your original before you decide which one to use.`,
      `Low mode rewrites the file's internal structure and packs its objects more efficiently without touching text, fonts or images. It is lossless, but the saving depends on how wastefully the file was written, and files that are already optimized may barely shrink. Medium and high modes work differently: each page is rendered in your browser and saved as a compressed JPEG inside a new PDF. That can cut scanned and photo-heavy documents dramatically, but the text on those pages becomes part of the picture, so it can no longer be selected, copied or searched.`,
      `Compression helps most with scans and documents full of photographs, which are large because of their images. Typical cases are a scanned contract that exceeds a ten megabyte upload limit, a brochure exported from a design tool at print resolution that is going onto a website, or a bundle of statements for a government portal with a strict size cap. Text-only documents are already small, so compressing them achieves little.`,
      `Start with low and check the size. Move to medium or high only if you need more, and keep your original, because image-based output cannot become selectable text again except through OCR. Occasionally the output is larger than the input, particularly for well-optimized files. In that case keep the original. Image-based modes also drop bookmarks and links, because pages are rebuilt. Everything runs in your browser and your file is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Pick a compression level. Start with low if you want to keep selectable text.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the result and compare its size with the original before using it.',
    ],
    faqs: [
      { q: 'Which compression level should I choose?', a: 'Try low first because it keeps text selectable. Use medium or high when you need a much smaller file and do not need to select or search the text.' },
      { q: 'Why can I not select text after compressing?', a: 'Medium and high modes rebuild each page as an image. Run OCR PDF on the result if you need searchable text again.' },
      { q: 'How much smaller will my file get?', a: 'It depends on the content. Scans and photo-heavy files shrink the most in the image-based modes. Text-only files barely change.' },
      { q: 'Can the compressed file be larger than the original?', a: 'Occasionally, for files that are already well optimized. If the result is larger, keep your original.' },
      uploadFaq('Compress PDF'),
    ],
    keywords: ['compress pdf', 'reduce pdf size', 'compress pdf online free', 'shrink pdf for email', 'pdf compressor no upload'],
  },

  'pdf-to-jpg': {
    metaTitle: 'PDF to JPG Converter, Free and No Upload',
    metaDescription: 'Convert PDF pages to JPG images at 1x to 3x resolution. Choose pages and quality. Results arrive in a ZIP, all in your browser.',
    h1: 'PDF to JPG Converter Online for Free',
    h2s: ['Turn PDF pages into JPG images', 'Resolution and quality settings explained', 'Where JPG pages come in handy', 'Memory, limits and privacy'],
    paragraphs: [
      `PDF to JPG converts the pages of a PDF into ordinary JPG pictures that you can post online, paste into a slide deck, attach to a chat or open on any device. You pick which pages to convert, how sharp the pictures should be and how strongly they are compressed. Results with more than one page are bundled into a single ZIP, so one download covers the whole job. No account is needed, and the conversion runs in your browser.`,
      `Each page is drawn onto a canvas by the PDF engine in your browser and then encoded as JPEG. The resolution setting multiplies the page's natural size. 1x suits quick screen previews, 2x is sharp on most displays, and 3x is aimed at print. The quality slider runs from 40 to 100. Around 85 balances sharpness and size, while lower values make smaller files with visible artefacts around small text. The canvas is cleared as soon as each page is saved, which keeps memory use steady on long documents.`,
      `Common jobs include posting one page of a brochure on social media, dropping a contract page into a presentation, sending a preview to someone who cannot open PDFs, making thumbnails for a document library, and capturing a form page to mark up in an image editor. If you want the pictures embedded inside a PDF rather than pictures of its pages, the Extract Images tool pulls each embedded picture out as its own file.`,
      `Convert only the pages you need, using a list such as 1-3, 8, because every extra page costs memory and download size. Very large pages are scaled down to stay within browser canvas limits, so a huge poster can come out smaller than the 3x setting suggests. JPG is lossy and has no transparency, so for crisp text and line art use PDF to PNG instead. Your PDF is rendered locally and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Choose a resolution and quality, and enter page numbers if you only want some pages.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the images, which arrive in a ZIP when there are several pages.',
    ],
    faqs: [
      { q: 'What resolution should I pick?', a: '2x suits most uses. Choose 3x when you plan to print the images and 1x for small previews.' },
      { q: 'Can I convert only some pages?', a: 'Yes. Enter a page list such as 1-3, 8 in the pages field and only those pages are converted.' },
      { q: 'Should I choose JPG or PNG?', a: 'JPG gives smaller files and suits photographs. PNG is lossless, so text and line art stay sharper.' },
      { q: 'Why is a very large page smaller than I expected?', a: 'Pages that would exceed browser canvas limits are scaled down automatically, so oversized pages can come out below the selected resolution.' },
      uploadFaq('PDF to JPG'),
    ],
    keywords: ['pdf to jpg', 'pdf to jpeg', 'convert pdf to image', 'pdf to jpg online free', 'pdf pages to images'],
  },

  'jpg-to-pdf': {
    metaTitle: 'JPG to PDF Converter, Free and No Upload',
    metaDescription: 'Turn JPG photos and scans into one PDF. Choose page size, orientation and margins. Photos stay sharp. Runs in your browser.',
    h1: 'JPG to PDF Converter Online for Free',
    h2s: ['Combine JPG photos into one PDF', 'Page size, orientation and margins', 'Typical uses for JPG to PDF', 'Order, limits and privacy'],
    paragraphs: [
      `JPG to PDF turns photographs and scans into a PDF document. Add a single picture or up to 200, arrange them in the order you want, and each image becomes one page. The result is one file that is easier to email, print and upload than a pile of separate images, and it opens the same way on every device. There is no account and no watermark is added.`,
      `JPEG photos are embedded directly where possible rather than re-encoded, so they keep their original quality inside the PDF. Page size can fit each image exactly, or be set to A4, US Letter, US Legal, A3 or A5. With automatic orientation each page follows the shape of its own image, so portrait and landscape photos can sit in the same document. You can also force one orientation. Margins are measured in points, where 72 points equal one inch, from 0 to 144.`,
      `People use it to gather phone photos of receipts into one expense file, turn photographed pages of a book or notes into a shareable document, assemble artwork into a quick portfolio, or send ID photos and proof of address as the single attachment a form allows. If your scans already exist as PDFs and you only need to join them, Merge PDF is the better route.`,
      `The page order follows the order of files in the list, so sort it before converting. Use the fit option to avoid white borders, or A4 with a modest margin for printing. Large phone photos use a lot of memory, so convert big batches in smaller groups if your device slows down, and use Compress PDF afterwards if the result is too big to send. This tool accepts .jpg and .jpeg files. For PNG images use PNG to PDF. Images are processed in your browser and are not uploaded to our servers.`,
    ],
    steps: [
      'Add your JPG files by dragging them in or clicking the upload area.',
      'Put them in the order you want, then choose page size, orientation and margin.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the PDF and scroll through it to check the page order.',
    ],
    faqs: [
      { q: 'Are my photos recompressed?', a: 'JPEG photos are embedded directly where possible, so they keep their original quality inside the PDF.' },
      { q: 'Can I mix portrait and landscape photos?', a: 'Yes. With automatic orientation each page follows the shape of its own image.' },
      { q: 'How many images can I convert at once?', a: `Up to 200 per run, as long as your device has enough memory. Convert big batches in smaller groups if it slows down.` },
      { q: 'Can I convert PNG or iPhone HEIC photos?', a: 'This tool accepts .jpg and .jpeg. Use PNG to PDF for PNG files, and export HEIC photos as JPG on your phone first.' },
      uploadFaq('JPG to PDF'),
    ],
    keywords: ['jpg to pdf', 'jpeg to pdf', 'photos to pdf', 'jpg to pdf converter free', 'combine images into pdf'],
  },

  'word-to-pdf': {
    metaTitle: 'Word to PDF Converter (DOCX), No Upload',
    metaDescription: 'Convert DOCX to PDF in your browser. Headings, lists, tables and images carry over, though complex layout is simplified.',
    h1: 'Word to PDF Converter Online for Free',
    h2s: ['Convert a DOCX file to PDF', 'What carries over and what does not', 'When this converter is the right choice', 'Layout limits and privacy'],
    paragraphs: [
      `Word to PDF converts a DOCX document into a PDF without installing Microsoft Office and without uploading the file to a server. Headings, paragraphs, lists, tables and embedded pictures are carried over and typeset onto A4 or US Letter pages, giving you a file that opens the same way on every phone, laptop and printer. It suits letters, CVs, assignments and reports where the content matters more than exact placement on the page.`,
      `A browser cannot run Word, so this tool takes a different route. The document is read by a converter in your tab, which extracts its structure (headings, paragraphs, lists, tables and images) and then lays that content out on pages itself. That is why the result is faithful to the content rather than a pixel-for-pixel copy. Page breaks may fall in different places, and styling that depends on Word's own layout engine is simplified. Only the modern .docx format is supported. An older .doc file must be re-saved as DOCX first.`,
      `Use it when you need a quick, shareable PDF of a text-led document: a CV to attach to an application, a report for an upload portal that insists on PDF, a letter that recipients should not edit by accident, or an archive copy of a draft. If exact fidelity is critical, for example a brochure with text boxes, columns and custom fonts, or a file going to a professional printer, use Word's own Save as PDF or Export option, which uses the original layout engine.`,
      `Open the PDF after conversion and look at the first and last pages, because that is the quickest way to confirm the layout is what you expected before you share it. Text boxes, multi-column sections, headers and footers, tracked changes and unusual fonts are the usual places where output differs from Word, and some of them may be simplified or left out. Custom fonts from the original are not guaranteed to be preserved. Your DOCX file is processed in your browser and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your DOCX file by dragging it in or clicking the upload area.',
      'Choose A4 or US Letter as the page size.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the PDF and check page breaks, tables and images before sending it.',
    ],
    faqs: [
      { q: 'Will the PDF look exactly like my Word document?', a: 'Not always. Content, headings, lists, tables and images are kept, but complex layout and fonts may differ because the conversion runs without Word.' },
      { q: 'Can I convert an old .doc file?', a: 'No. Open it in Word or a free office suite and save it as DOCX first.' },
      { q: 'Is the text in the PDF selectable?', a: 'Yes. The content is typeset as text, so you can select, copy and search it in the PDF.' },
      { q: 'When should I use Word itself instead?', a: `Use Word's Save as PDF when exact layout matters, such as columns, text boxes or custom fonts, or when the file is going to a professional printer.` },
      uploadFaq('Word to PDF'),
    ],
    keywords: ['word to pdf', 'docx to pdf', 'convert word document to pdf', 'word to pdf free no upload', 'docx to pdf converter'],
  },

  'pdf-to-word': {
    metaTitle: 'PDF to Word Converter, Free and No Upload',
    metaDescription: 'Convert PDF text into an editable DOCX file in your browser. Headings and paragraphs are rebuilt, with no upload and no sign-up.',
    h1: 'PDF to Word Converter Online for Free',
    h2s: ['Turn a PDF into an editable Word file', 'How paragraphs are rebuilt from a PDF', 'What to expect from the result', 'Scanned PDFs, limits and privacy'],
    paragraphs: [
      `PDF to Word creates an editable DOCX from your PDF. The text is read from each page and rebuilt as real Word content, so you can open the file in Word, LibreOffice or Google Docs, fix a typo, update a price or reuse a paragraph without retyping it. No account is needed, and the conversion happens in your browser rather than on a server.`,
      `A PDF does not store paragraphs the way a Word file does. It stores characters at positions on a page. The tool groups characters into lines by position, then groups lines into paragraphs and headings using spacing and font size, and writes the result as a Word document with page breaks. This is inference, not recovery, so quality depends on the source. Simple documents such as letters, articles and reports convert well.`,
      `Expect the wording to be correct and the layout to be simplified. Images, tables and multi-column designs are not rebuilt exactly, and fonts and spacing may differ. Treat the result as a head start: get the text out, then format it in Word. People use it to update a price list they only have as a PDF, reuse wording from a brochure, edit a contract draft, or let colleagues comment in a shared document. For plain text, PDF to Text is lighter, and PDF to PowerPoint keeps the look of each page.`,
      `Check the Word file after conversion, because a scanned page has no text to rebuild and will need OCR PDF first if you want editable words. Check numbers, names and special characters in the output before you rely on it. Keep the tab open until the Word file is ready to download, and save it under a new name so the original PDF stays untouched next to it. If the result will be edited by several people, share the Word file rather than the PDF, since the text can be changed in it without special software. Your PDF is processed in your browser and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Run the conversion. There are no settings to change for this tool.',
      'Wait for the progress bar to finish, then download the DOCX file.',
      'Open it in Word or a free office suite and tidy up the layout.',
    ],
    faqs: [
      { q: 'Will the layout match the PDF?', a: 'Text is carried over, but layout is simplified. Tables, columns and images are not reproduced exactly.' },
      { q: 'Does it work on scanned documents?', a: 'Only if they contain real text. For scans, use OCR PDF first to create a text layer, then convert the result.' },
      { q: 'Why are my tables and pictures not rebuilt?', a: 'A PDF has no concept of tables or paragraphs, only positioned text and graphics. This tool rebuilds text and structure but not tables or images.' },
      { q: 'Which programs can open the DOCX file?', a: 'Microsoft Word, LibreOffice Writer, Google Docs and most other word processors.' },
      uploadFaq('PDF to Word'),
    ],
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to word free no upload', 'pdf to editable word'],
  },

  'rotate-pdf': {
    metaTitle: 'Rotate PDF Pages Online, Free and No Upload',
    metaDescription: 'Rotate all or selected PDF pages by 90, 180 or 270 degrees and save the fixed file. No quality loss, runs in your browser.',
    h1: 'Rotate PDF Pages Online for Free',
    h2s: ['Fix sideways and upside-down pages', 'Rotation without re-rendering', 'Situations where rotating helps', 'Page selection, limits and privacy'],
    paragraphs: [
      `Rotate PDF fixes pages that were scanned sideways, saved upside down or exported in the wrong orientation. Pick a quarter turn clockwise, a half turn or a quarter turn counter-clockwise, apply it to every page or only the ones that are wrong, and download a copy that opens the right way up in any viewer. Nothing is uploaded and no account is needed.`,
      `A PDF page carries a rotation value, and viewers use it to decide how to display the page. This tool changes that value instead of redrawing the page, so text stays text, images keep their original quality and the file size barely changes. The turn you choose is added to whatever rotation the page already has, which means running the tool twice on the same page keeps turning it. If a page is upside down, choose 180 degrees rather than two quarter turns.`,
      `Rotation comes up constantly after scanning. A few sheets go through a document feeder sideways, a landscape table or drawing sits inside a portrait report, a phone app saves a receipt with the wrong orientation, or a fax-style file arrives upside down. Fixing orientation also helps before other steps. Correcting it before OCR PDF usually improves text recognition, and correcting it before Merge PDF means the combined document reads consistently.`,
      `Use the pages field to target specific pages, for example 3, 7-9, and leave it empty to rotate the whole document. Page numbers start at 1. The rotation is saved in the file, so pages appear turned in standard viewers, but a few specialised programs ignore it, so check the result in the app your recipient uses. Your original file is untouched, and processing happens in your browser without any upload. After running the tool, scroll through the result before you send it, because a single page turned the wrong way is easy to miss in a long file. Pages you did not select keep their original orientation, so you can fix only the sideways scans and leave the rest alone.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Choose the rotation and, optionally, the pages to turn. Leave pages empty for all.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the corrected PDF and scroll through it to confirm every page is upright.',
    ],
    faqs: [
      { q: 'Does rotating reduce quality?', a: 'No. Only the page rotation value changes, so text and images are not re-rendered or recompressed.' },
      { q: 'Can I rotate just one page?', a: 'Yes. Type the page number or range in the pages field and only those pages are rotated.' },
      { q: 'Why does a page keep turning when I run the tool again?', a: 'The new rotation is added to the one the page already has, so repeating the tool turns it further. Run it once on the original file.' },
      { q: 'Will the rotation show in every PDF viewer?', a: 'In standard viewers and browsers, yes. A few specialised programs ignore page rotation, so test in the app your recipient uses.' },
      uploadFaq('Rotate PDF'),
    ],
    keywords: ['rotate pdf', 'rotate pdf pages', 'turn pdf sideways', 'rotate pdf online free', 'fix upside down pdf'],
  },

  'protect-pdf': {
    metaTitle: 'Password Protect PDF, AES-256, No Upload',
    metaDescription: 'Add a password to a PDF using AES-256 encryption in your browser. Your file and password are never sent to our servers.',
    h1: 'Password Protect a PDF Online for Free',
    h2s: ['Lock a PDF behind a password', 'How the encryption is applied', 'Good uses and sensible limits', 'Choosing a password and staying safe'],
    paragraphs: [
      `Protect PDF adds a password to your document so that anyone opening it must type the password first. Choose a password, confirm it, and download an encrypted copy. Because the encryption is applied in your browser, this tool never transmits your document or your password to a server, which is the main reason to prefer it over upload-based services for private files.`,
      `The file is written with AES-256 encryption using the PDF 2.0 (Revision 6) scheme, built on the cryptography functions your browser provides. After encrypting, the tool reopens the result with your password to confirm that it works before offering the download, which catches most failures early. Passwords can be up to 127 characters long. Most current PDF viewers support this scheme, but older readers and older third-party software may not, so open the output in the viewer your recipient will use before you send it.`,
      `People use it to email payslips or contracts, store tax records in cloud folders, send medical or legal paperwork, and protect files on a USB stick that might be lost. It deters casual access and keeps a file private in transit. It is not a replacement for managed document security. Once someone has both the file and the password they can open it, copy it and remove the protection, and a weak password can be guessed by software.`,
      `Use a long, unique password. A passphrase of several unrelated words is easier to remember than random symbols. Send it through a different channel than the file. There is no recovery: the password exists only on your device, so if you forget it the file cannot be opened by us or by anyone else. This implementation has not been independently audited, so for highly sensitive material such as regulated financial or health data, use certified software and follow your organisation's policies. Keep the unencrypted original somewhere safe.`,
    ],
    steps: [
      'Add the PDF you want to protect by dragging it in or clicking the upload area.',
      'Type your password, then type it again to confirm it.',
      'Press the run button and wait while the file is encrypted and checked.',
      'Download the protected PDF, then open it with your password to test it before sending.',
    ],
    faqs: [
      { q: 'Can a forgotten password be recovered?', a: 'No. The password never leaves your device, so nobody can reset it for you. Keep it somewhere safe.' },
      { q: 'Which encryption does it use?', a: 'AES-256 with the PDF 2.0 scheme. The implementation is not independently audited, so choose certified tools for extremely sensitive files.' },
      { q: 'Will the protected PDF open in Adobe Reader and Chrome?', a: 'It is designed to, since most current viewers support this scheme, but older readers may not. Open the result in the viewer your recipient will use before sending.' },
      { q: 'Can I remove the password later?', a: 'Yes, with Unlock PDF, by entering the password. That tool rebuilds pages as images, so keep your original unprotected file if you need selectable text.' },
      uploadFaq('Protect PDF'),
    ],
    keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf', 'add password to pdf free', 'pdf aes-256 encryption'],
  },

  'unlock-pdf': {
    metaTitle: 'Unlock PDF When You Know the Password',
    metaDescription: 'Remove a PDF password when you know it. Enter the password and get an unprotected copy. No cracking, no upload.',
    h1: 'Unlock a Password-Protected PDF Online',
    h2s: ['Remove a PDF password you already know', 'What the unlock process actually does', 'Legitimate reasons to unlock a PDF', 'Important limits and privacy'],
    paragraphs: [
      `Unlock only files that belong to you or that you have permission to open, and keep the password at hand, because the tool needs the correct one before it can read the pages. Work on a copy if the file is important, and store the unlocked version somewhere private, since anyone who receives it can open it without a password.`,
      `The document is opened in your browser with the password you provide. Each page is then rendered and rebuilt into a new, unprotected PDF. Because pages are drawn rather than copied, restrictions on printing or copying attached to the original do not carry across, and the output is made of page images. The text looks the same but can no longer be selected, copied or searched. Up to 400 pages are supported in one run.`,
      `Typical reasons include removing the password from your own bank or utility statements before archiving them, preparing a file for software that cannot read encrypted PDFs, sharing a document with a colleague who would otherwise need the password, and removing friction from a file you protected yourself. If a document was restricted by someone else, make sure you have the right or permission to remove its protection.`,
      `Because the pages are rebuilt as images, the unlocked copy can be larger than the original and its text can no longer be selected or searched. Unlock only files that belong to you or that you have permission to open, and keep the password at hand, because the tool needs the correct one before it can read the pages. Work on a copy if the file is important, and store the unlocked version somewhere private, since anyone who receives it can open it without a password. Keep the unlocked copy only as long as you need it, and delete it from your device when the work is done so it does not stay around unprotected.`,
    ],
    steps: [
      'Add the protected PDF by dragging it in or clicking the upload area.',
      'Type the password that opens the file.',
      'Press the run button and wait for each page to be rebuilt.',
      'Download the unlocked PDF, and run OCR PDF if you need selectable text.',
    ],
    faqs: [
      { q: 'Can this crack a PDF if I forgot the password?', a: 'No. You must supply the correct password. The tool does not guess, bypass or crack passwords.' },
      { q: 'Why is the text not selectable afterwards?', a: 'Pages are rebuilt as images to produce a clean copy. Use OCR PDF to make the text searchable again.' },
      { q: 'Why is the unlocked file larger than the original?', a: 'Image-based pages usually take more space than the original text and vector content. Compress PDF can reduce the size.' },
      { q: 'Is it acceptable to unlock any PDF?', a: 'Removing protection from your own files is fine. For files owned by others, you need permission, and the rules vary by country. We cannot give legal advice.' },
      uploadFaq('Unlock PDF'),
    ],
    keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'unlock pdf with password', 'remove password from pdf online'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            2. STAGE 0 (8 TOOLS)                             */
  /* -------------------------------------------------------------------------- */

  'png-to-pdf': {
    metaTitle: 'PNG to PDF Converter, Free and Private',
    metaDescription: 'Combine up to 200 PNG screenshots, scans and graphics into one PDF in your browser. Choose page size and margin. Free, no sign-up.',
    h1: 'Convert PNG Images to PDF',
    h2s: ['When a PDF is better than a folder of PNGs', 'How your PNG files become pages', 'Getting a clean result', 'Limits worth knowing about'],
    paragraphs: [
      'PNG is a lossless format, which makes it the usual choice for screenshots, diagrams, logos and exported slides. The trouble starts when you have twenty of them. A folder of loose images is awkward to email, easy to put in the wrong order and tedious to print. Converting them into one PDF gives you a single file that opens the same way on every phone, laptop and printer. Recipients scroll through it page by page, and you only have one attachment to keep track of.',
      'Each PNG you add becomes its own page, and the pages follow the order shown in the file list, so check that order before you run the tool. You can add up to 200 images in one run. The page size can be fit to image, A4, US Letter, US Legal, A3 or A5, the orientation can be automatic, portrait or landscape, and the margin runs from 0 to 144 points. Fit to image avoids white borders around screenshots, and automatic orientation picks portrait or landscape for each image.',
      'A clean result starts with clean source images. PNG files are embedded without lossy recompression, but a PNG that is too small will still look soft when it is stretched across a page, and no converter can add detail that was never there. Very large screenshots do the opposite and produce a heavy PDF. If the finished file is bigger than you can send, run it through Compress PDF afterwards. If some of your images are JPG, use JPG to PDF for those and combine the two results with Merge PDF.',
      'All the work happens on your own device, so memory is the real limit. A handful of ordinary screenshots is no problem, but dozens of very large images can slow down an older phone or even stop the page from responding. If that happens, convert the images in smaller batches and join the resulting PDFs with Merge PDF. This tool reads PNG files only, so other image formats should go through the matching converter in our list.',
    ],
    steps: [
      'Add one or more PNG images, up to 200 per run.',
      'Put the files in the order you want the pages to appear.',
      'Pick a page size, orientation and margin, or keep the defaults, then press the run button.',
      'Download the PDF and open the first page to confirm it looks right.',
    ],
    faqs: [
      { q: 'How many PNG files can I convert at once?', a: 'Up to 200 images per run. Each image becomes one page, in the order shown in the file list.' },
      { q: 'Will my images lose quality?', a: 'PNG files are embedded without lossy recompression, so the PDF is as sharp as your originals. Small, low-resolution images still look soft when stretched across a full page.' },
      { q: 'What happens to transparent areas?', a: 'Transparent areas are kept and show the page background, which is normally white.' },
      { q: 'What can I do if the PDF is too large to send?', a: 'Run the finished file through Compress PDF. Large screenshots are the usual cause of heavy files.' },
      uploadFaq('PNG to PDF'),
    ],
    keywords: ['png to pdf', 'convert png to pdf', 'combine png images into pdf', 'png to pdf converter free', 'screenshots to pdf'],
  },

  'pdf-to-png': {
    metaTitle: 'PDF to PNG Converter, Free and Private',
    metaDescription: 'Convert PDF pages to lossless PNG images in your browser at 1x, 2x or 3x resolution, all pages or a selection. No sign-up.',
    h1: 'Convert PDF Pages to PNG Images',
    h2s: ['Why turn a PDF page into a PNG', 'What the converter actually does', 'PNG or JPG: which should you pick', 'Things that can look different'],
    paragraphs: [
      'Sometimes a PDF is the wrong container. You may want a slide for a presentation, a diagram for a web page, one page of a contract to drop into a chat, or a thumbnail for a document library. PNG suits these jobs because it is lossless: edges stay crisp, flat colours stay flat and small text remains readable. Converting a page to PNG gives you a plain picture that opens in any image viewer, editor or messaging app without needing a PDF reader.',
      'The tool opens your PDF in the browser, draws each page and saves it as a PNG. Choose 1x for screen previews, 2x for sharp images or 3x for print quality, and leave the pages field empty for every page or type a list such as 1-3, 8. The images are delivered together in a ZIP file. The output is a picture of the page, not the page itself, so text can no longer be selected, searched or copied, and links stop working. For the words, use PDF to Text, or OCR PDF first when the document is a scan.',
      'PNG and JPG solve different problems. PNG keeps text and line art sharp but produces larger files, especially for full-colour photographs. JPG compresses photographs far better and is usually the smarter pick when file size matters more than perfect edges. If your pages are mostly text, charts or logos, stay with PNG. If they are mostly photographs, try PDF to JPG and compare the two results side by side before choosing.',
      'Rendering depends on what is inside the PDF. Fonts that are not embedded in the file may be drawn with a substitute and look slightly different from the original. Pages are drawn on a white background, so the images are not transparent. Higher resolution uses more memory, and a poster-sized page at 3x may fail on an older phone while working fine on a computer, so for long documents choose only the pages you need. Open the first image and check it before you use the rest.',
    ],
    steps: [
      'Add the PDF you want to convert.',
      'Choose a resolution and, if you only need some pages, type a page list.',
      'Start the conversion and wait while each page is drawn.',
      'Download the ZIP and check the first image for fonts and layout.',
    ],
    faqs: [
      { q: 'Do I get one image per page?', a: 'Yes. Every page you convert becomes its own PNG image, so a ten-page file produces ten images, delivered in a ZIP.' },
      { q: 'Can I convert only some of the pages?', a: 'Yes. Type a page list such as 1-3, 8 in the pages field. Leave it empty to convert every page.' },
      { q: 'Can I copy text from the PNG?', a: 'No. A PNG is a picture. Use PDF to Text for text-based PDFs, or OCR PDF when the document is a scan.' },
      { q: 'Why does the image look different from my PDF viewer?', a: 'Fonts that are not embedded in the PDF may be replaced. Compare the image with the original at full zoom if exact appearance matters.' },
      uploadFaq('PDF to PNG'),
    ],
    keywords: ['pdf to png', 'convert pdf to png', 'pdf to png converter free', 'save pdf page as image', 'pdf pages to png images'],
  },

  'extract-pages': {
    metaTitle: 'Extract PDF Pages, Free and Private',
    metaDescription: 'Pull the pages you need out of a PDF and save them as a new file, in the order you list them. Runs in your browser, no sign-up.',
    h1: 'Extract Pages from a PDF',
    h2s: ['Keep only what you need', 'How page selection works', 'Extract, split or delete: which one', 'What may not carry over'],
    paragraphs: [
      'Most PDFs contain more than the person receiving them needs. A forty-page report may have one table your colleague wants, a scanned bundle may include a single page that must go to the tax office, and a long contract may need only its signature page. Extracting those pages into a new, smaller PDF is faster to send, easier to read and avoids sharing parts of the document that were never meant for the recipient.',
      'You tell the tool which pages to keep by typing numbers and ranges, for example 1-3, 7. The numbers refer to the position of the page in the file, not to any number printed on the page, so an unnumbered cover is still page 1. Pages appear in the new file in the order you list them, so 5, 1, 3 starts with page five, and repeating a number repeats the page. A number beyond the end of the file gives an error instead of being ignored. Your original file is not changed.',
      'Three tools sit close together and it helps to pick the right one. Extract Pages gives you one new file containing only the pages you name. Split PDF cuts a document into several pieces. Delete Pages removes unwanted pages and keeps everything else. If you want to keep a few pages from a large file, extract them. If you want to discard a few pages from a large file, delete them. The outcome is similar but the page list you type is shorter.',
      'A page copied into a new file brings its visible content with it, but features that connect pages do not follow. Bookmarks and interactive form fields are not carried into the new file, and internal links may stop working. If the PDF has a password, remove it first with Unlock PDF. Open the new file and flip through every page before you send it, and if the document is sensitive, do not rely on extraction alone to hide anything.',
    ],
    steps: [
      'Add the PDF that contains the pages you want.',
      'Type the page numbers or ranges to keep, such as 1-3, 7.',
      'Run the tool and wait for the new file to be built.',
      'Download the result and scroll through it to confirm the right pages are there.',
    ],
    faqs: [
      { q: 'How do I write the page list, and can I reorder pages?', a: 'Use page numbers separated by commas and ranges with a dash, for example 1-3, 7. Pages appear in the output in the order you list them, so you can also use this tool to reorder a short selection.' },
      { q: 'Does this change my original PDF?', a: 'No. Your original file is only read. The pages you choose are copied into a new PDF that you download.' },
      { q: 'What is the difference from Split PDF?', a: 'Extract Pages produces one file with the pages you name. Split PDF cuts the document into several separate files.' },
      { q: 'Will bookmarks and form fields survive?', a: 'No. Visible page content is kept, but bookmarks and interactive form fields are not carried into the new file. Check the result before you share it.' },
      uploadFaq('Extract Pages'),
    ],
    keywords: ['extract pages from pdf', 'extract pdf pages online', 'save selected pages of pdf', 'pull pages out of pdf', 'extract pages pdf free'],
  },

  'delete-pages': {
    metaTitle: 'Delete PDF Pages, Free and Private',
    metaDescription: 'Remove unwanted pages from a PDF and save a cleaner file. Works in your browser with no account and no installation needed.',
    h1: 'Delete Pages from a PDF',
    h2s: ['Why remove pages at all', 'Count pages the right way', 'Delete or extract: choosing the faster route', 'Check the result before you share'],
    paragraphs: [
      'Blank sheets from a scanner, a cover page you no longer need, a draft watermark page, or an appendix that should not leave the building: almost every PDF has a page that does not belong. Removing it makes the file shorter, lighter and more professional. It also stops people from printing pages they never needed, which saves paper when a document is going to a meeting or a client.',
      'The most common mistake is counting by the number printed on the page. The tool counts by position in the file. If the first two pages are a cover and a table of contents with no printed numbers, the page labelled 1 inside the document is actually page 3. Open your PDF in a viewer, read the page counter in its toolbar and use that number. You can enter single pages and ranges, such as 2, 5-6, and the tool removes exactly those positions.',
      'Delete Pages and Extract Pages reach similar results from opposite directions. If you want to drop three pages from a hundred-page file, deleting is quicker because you only type three numbers. If you want to keep three pages from the same file, extracting is quicker for the same reason. Either way the original on your device is untouched, and a new file is produced, so you can run the tool again with a different list if you made an error.',
      'After downloading, scroll through the new file from start to finish. Confirm that the page count is what you expect and that nothing important disappeared. Bookmarks and interactive form fields are not carried into the new file, so keep the original if you still need them. Removing a page also does not make the rest of the file confidential. If you need to hide information on a page you are keeping, use Redact PDF rather than relying on deletion.',
    ],
    steps: [
      'Add the PDF you want to clean up.',
      'Enter the page numbers or ranges to remove, using the page counter of your PDF viewer.',
      'Run the tool and wait for the new file.',
      'Download the result and scroll through it to check the page count.',
    ],
    faqs: [
      { q: 'Can I delete more than one page at once?', a: 'Yes. Enter several page numbers or ranges separated by commas, for example 2, 5-6.' },
      { q: 'Can I delete every page?', a: 'No. If you select every page, the tool stops with a message instead of producing an empty document. Leave at least one page in the file.' },
      { q: 'Why did the wrong page disappear?', a: 'Page numbers count from the first page of the file, not from the number printed on the page. Check the counter in your PDF viewer and try again.' },
      { q: 'Is my original file changed?', a: 'No. The tool builds a new file and your original stays as it was.' },
      uploadFaq('Delete Pages'),
    ],
    keywords: ['delete pages from pdf', 'remove pages from pdf online', 'delete pdf pages free', 'remove blank pages from pdf', 'cut pages out of pdf'],
  },

  'crop-pdf': {
    metaTitle: 'Crop PDF Pages, Free and Private',
    metaDescription: 'Trim a percentage from each edge of your PDF pages to remove scanner borders and wide margins. Runs in your browser, no sign-up.',
    h1: 'Crop the Pages of a PDF',
    h2s: ['When cropping helps', 'Trimming without redrawing the page', 'Cropping hides, it does not delete', 'Tips for a tidy result'],
    paragraphs: [
      'Scanned pages often come with wide grey borders, photocopies carry black edges from the glass, and slides exported to PDF can leave empty space around the content. Cropping removes that dead space so the useful part of the page fills the screen. This matters most on phones and e-readers, where wasted margin means smaller text. It also makes printed copies look cleaner and can help a document fit neatly into a binder or presentation.',
      'You enter how much to remove from the top, right, bottom and left, as a percentage of the page. Each side starts at 5 percent and can go up to 45 percent. The tool sets the page crop and trim boxes to the smaller area, which is what viewers use to decide what to show. It does not redraw the page, so text inside the visible area normally stays selectable and the file size stays about the same. Leave the pages field empty to crop every page, or type a list to crop only some.',
      'Be careful with one point. Cropping hides content, it does not delete it. Whatever lies outside the new boundary is still inside the file, and someone with PDF editing software could bring it back. If a page contains a name, number or paragraph that must not be seen, do not rely on cropping. Use Redact PDF with rasterizing switched on for that job, and check the output carefully.',
      'Start with small amounts, because trimming too much cuts into page numbers, headers or the last line of text. Check the first page, the last page and one from the middle, since scanners sometimes shift pages slightly. If your file mixes very different layouts, crop them in separate runs using the pages field. If you also need to change the overall paper size, Resize PDF is the better tool. Keep your original file until you are happy with the result.',
    ],
    steps: [
      'Add the PDF you want to crop.',
      'Set the percentage to remove from the top, right, bottom and left edges.',
      'Run the tool and wait for the cropped file to be built.',
      'Download the result and check the first, middle and last pages.',
    ],
    faqs: [
      { q: 'Does cropping delete the content I cut away?', a: 'No. The area is only hidden by the page boxes, and someone with editing software could restore it. To hide sensitive information, use Redact PDF instead.' },
      { q: 'Will the same crop apply to every page?', a: 'Yes. One set of percentages is applied to every page you select, and to all pages if the pages field is empty. For mixed layouts, run the tool again with a different page list.' },
      { q: 'Does cropping turn my text into an image?', a: 'No. The page is not redrawn, so text inside the visible area normally stays selectable.' },
      { q: 'Should I use Crop or Resize?', a: 'Use Crop to trim away edges. Use Resize PDF when you need to change the paper size, for example from Letter to A4.' },
      uploadFaq('Crop PDF'),
    ],
    keywords: ['crop pdf', 'crop pdf pages online', 'trim pdf margins', 'remove white space from pdf', 'crop pdf free'],
  },

  'watermark-pdf': {
    metaTitle: 'Watermark PDF, Free and Private',
    metaDescription: 'Stamp text such as DRAFT or CONFIDENTIAL across every page of a PDF, with your choice of size, colour, angle and opacity. No sign-up.',
    h1: 'Add a Watermark to a PDF',
    h2s: ['What a watermark is good for', 'Setting up a readable stamp', 'What a watermark cannot do', 'Language and font notes'],
    paragraphs: [
      'A watermark tells readers something about a document at a glance. DRAFT warns that the content is not final, CONFIDENTIAL reminds people to handle it carefully, and a company name or the word SAMPLE discourages casual reuse. Because the mark sits on every page, it still shows when someone prints a single sheet or shares a screenshot. Teams use it for review copies, internal reports, proposals sent to clients and course material.',
      'Type the wording, then set the font size (8 to 200 points), the opacity (5 to 100 percent), the rotation and the colour. The layout is either one mark in the centre or a tiled pattern across the page. The text is drawn on top of each page as a semi-transparent overlay, so the content underneath stays in place and the file stays searchable. Try a light setting first, because dark, opaque text over a table makes the numbers hard to read. Open a text-heavy page before you decide the result is acceptable.',
      'A watermark is a label, not protection. Someone with a PDF editor can remove or cover it, and it does nothing to stop a file being copied or read. Keep the wording short, since a long sentence repeated across a page becomes noise. If you need to hide specific information permanently, use Redact PDF and verify the output carefully. Treat the watermark as a label and nothing more.',
      'The watermark is drawn with a built-in font, so plain Latin letters, digits and common punctuation are the safe choice. Characters from other scripts, such as Arabic, Urdu, Chinese or Cyrillic, may appear as question marks. If you must stamp text in another language, test it on a single page first. There is no option to mark only some pages, so every page receives the watermark. Keep an unmarked original of the file.',
    ],
    steps: [
      'Add the PDF you want to mark.',
      'Type the watermark text, then set size, opacity, rotation, colour and layout.',
      'Run the tool and wait for every page to be stamped.',
      'Download the file and check a text-heavy page for readability.',
    ],
    faqs: [
      { q: 'Can the watermark be removed?', a: 'Yes, with PDF editing software. It deters casual reuse but is not a security feature, so keep your unmarked original.' },
      { q: 'Does a watermark protect my document?', a: 'No. It labels the document but does not stop copying or reading. To hide information permanently, use Redact PDF.' },
      { q: 'Why do some letters show as question marks?', a: 'The built-in font covers standard Latin characters. Text in other scripts may not render, so test a single page before processing the full file.' },
      { q: 'Does the watermark appear on every page?', a: 'Yes. There is no option to select pages, so every page of the file is stamped.' },
      uploadFaq('Watermark PDF'),
    ],
    keywords: ['watermark pdf', 'add watermark to pdf online', 'stamp text on pdf', 'pdf draft watermark', 'watermark pdf free'],
  },

  'page-numbers-pdf': {
    metaTitle: 'Add Page Numbers to PDF, Free',
    metaDescription: 'Number the pages of any PDF in your browser. Pick the position, format and starting number, and skip the cover. Free, no sign-up.',
    h1: 'Add Page Numbers to a PDF',
    h2s: ['Why numbering matters', 'Placing the numbers well', 'Cover pages and the first number', 'Related tools for formal documents'],
    paragraphs: [
      'A PDF without page numbers is hard to discuss. In a meeting, nobody can say turn to page twelve. In a review, comments like see the paragraph near the bottom waste time. When you merge several files into one, the original numbering usually breaks as well. Adding fresh numbers after the document is finished gives every reader the same reference points, makes printed copies easier to put back in order and makes long reports feel complete and professional.',
      'Pick one of six positions: bottom centre, bottom right, bottom left, or the three matching spots at the top. Then choose a format such as 1, Page 1, 1 of 10 or Page 1 of 10, a starting number and a font size. Choose a spot that is clear of your existing footer, logo or page border, then run the tool on the whole file. Look at several pages of the result, including one with a full-height table or a scan, since those are where a number is most likely to collide with content.',
      'Think about the front of your document before you start. A cover page often should not carry a number, so tick the option to skip the first page. The starting number decides what the first numbered page is called, which helps when a report continues from an earlier part or an appendix begins at a later number. In the n-of-total formats the total counts every page of the document. Check page two after running to confirm the numbering starts where you expect.',
      'Plain page numbers cover most needs, but legal and business paperwork sometimes asks for more. Bates Numbering adds sequential identifiers with a prefix, which courts and law firms commonly use to track evidence. Header & Footer lets you put a title, a date or a company name on every page alongside the number. Choose the tool that matches the instructions you were given rather than forcing one tool to do every job.',
    ],
    steps: [
      'Add the PDF that needs numbering.',
      'Choose the position, the number format, the starting number and whether to skip the cover.',
      'Run the tool and wait for every page to be processed.',
      'Download the file and check pages with tables, footers or scans.',
    ],
    faqs: [
      { q: 'Where on the page can the numbers go?', a: 'There are six positions: bottom centre, bottom right, bottom left, top centre, top right and top left. Pick one that does not overlap your footer, logo or border, then check the output.' },
      { q: 'Can numbering start from a different number?', a: 'Yes. Set the start value and the first numbered page gets that number, with the rest following in order.' },
      { q: 'Can I leave out the cover page?', a: 'Yes. Tick the option to skip the first page and it stays unnumbered. Check page two of the result to confirm the numbering looks right.' },
      { q: 'Is there a tool for legal numbering?', a: 'Yes. Bates Numbering adds sequential identifiers, and Header & Footer adds repeated text such as a title or date.' },
      uploadFaq('Add Page Numbers'),
    ],
    keywords: ['add page numbers to pdf', 'number pdf pages online', 'pdf page numbering', 'insert page numbers in pdf free', 'pdf page numbers tool'],
  },

  'pdf-to-txt': {
    metaTitle: 'PDF to Text Converter, Free and Private',
    metaDescription: 'Pull the text out of a PDF and save it as a plain TXT file in your browser. Scanned PDFs need OCR first. Free, no sign-up.',
    h1: 'Convert a PDF to Plain Text',
    h2s: ['When plain text is what you want', 'Only works on real text', 'Why the layout changes', 'Checking the output'],
    paragraphs: [
      'Plain text is the simplest format there is. It opens in any editor, pastes cleanly into emails and code, works with search tools and can be fed into spreadsheets, translation tools or note-taking apps without bringing along fonts, colours or page frames. If you only need the words from a report, an article or a contract, converting the PDF to a TXT file is quicker and tidier than copying page by page and fixing the formatting afterwards.',
      'The tool reads the text layer that already exists inside the PDF, groups the characters into lines by their position and writes the lines out in order, with each page separated. There are no settings to adjust. This works well for documents created on a computer, such as exported word-processor files and online statements. It does not work for scanned documents, because a scan is only a picture of text. If the output is empty, run OCR PDF on the file first, then convert the result.',
      'A TXT file has no columns, tables, images or fonts, so the visual layout cannot survive. Text from multi-column pages may come out in an unexpected reading order, table cells may run together on one line, and headers and footers may be repeated between paragraphs. Hyphenated words at line ends can also stay split. None of this is a fault of your file. It is the price of reducing a designed page to a plain stream of characters.',
      'Always skim the output before you rely on it. Look for garbled characters, which can happen when a PDF uses unusual font encodings, and check that numbers and names are intact. For documents where the layout matters, PDF to Word or PDF to Excel may give you a more useful starting point. For simple reading, searching, copying and archiving, plain text is hard to beat, and the file will be tiny compared with the PDF it came from.',
    ],
    steps: [
      'Add the PDF you want to read as text.',
      'No settings are needed, so go straight to the run button.',
      'Wait while the text is extracted from each page.',
      'Download the TXT file and open it to check for missing or garbled text.',
    ],
    faqs: [
      { q: 'Why is my TXT file empty?', a: 'The PDF is probably a scan, which contains pictures of text rather than real text. Run OCR PDF first, then convert the result.' },
      { q: 'Will tables and columns stay intact?', a: 'No. Plain text has no layout, so columns and tables may be merged or reordered. Try PDF to Excel for tables.' },
      { q: 'Why do I see strange characters?', a: 'Some PDFs use unusual font encodings that do not map back to normal letters. Try OCR PDF on the file as an alternative route.' },
      { q: 'Can I convert a password-protected PDF?', a: 'Remove the password with Unlock PDF first. That tool rebuilds pages as images, so follow it with OCR PDF to get text back.' },
      uploadFaq('PDF to Text'),
    ],
    keywords: ['pdf to txt', 'pdf to text converter', 'extract text from pdf', 'convert pdf to plain text', 'pdf to txt free online'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            3. STAGE A (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'txt-to-pdf': {
    metaTitle: 'Text to PDF Converter, Free Online',
    metaDescription: 'Convert TXT files to PDF, choose the font, size and page size, and combine up to 50 text files into one document.',
    h1: 'Convert Text Files to PDF',
    h2s: ['What Text to PDF does', 'How the layout is built', 'Where plain text PDFs help', 'Limits and what to check'],
    paragraphs: [
      'Text to PDF turns plain .txt files into a PDF that looks the same on every phone, laptop and printer. It is meant for people who have notes, logs, drafts or exported data in a simple text file and need something easier to share or archive. You do not need a word processor. Add one file or several, pick how the text should look, and the tool produces a paginated document that opens in any PDF viewer without caring which editor created the original.',
      'The text is read in your browser, wrapped to the width of the page and split across as many pages as it needs. You can pick Helvetica, Times or Courier, set the font size anywhere from 6 to 36 points, and choose A4 or US Letter. When you add more than one file, they are joined in the order shown in the list, with a page break between each file. Check that order before you press the run button, because the result follows the list exactly.',
      'Plain text PDFs are useful when the content matters more than the styling. Courier suits code listings and server logs, where every character should line up. Times gives a printed-letter feel to a draft or a speech, and Helvetica works for meeting notes and checklists. People also use it to archive a folder of small notes as one document, to hand over a config file to someone who cannot open it in an editor, or to print a long message thread that was copied into a text file.',
      'This tool keeps text only, so there is no bold, italic, image or table support, and you will not get a clickable table of contents. The standard fonts cover Latin characters, so text in other scripts, and some symbols, may appear as question marks. Always scroll through the result before sharing it. If you need formatting, convert a Word file with Word to PDF instead, and use PDF to Text to go the other way round. Rich Text files have their own tool, RTF to PDF.',
    ],
    steps: [
      'Add one or more .txt files and put them in the order you want them to appear.',
      'Choose a font, a font size and A4 or US Letter.',
      'Press the run button and let the conversion complete.',
      'Download the PDF and scroll through it to check line breaks and special characters.',
    ],
    faqs: [
      { q: 'How many text files can I combine?', a: 'You can add up to 50 .txt files in one run. They are joined in the order shown in the list, with a page break between files.' },
      { q: 'Which fonts and sizes can I choose?', a: 'Helvetica, Times and Courier, at sizes from 6 to 36 points. The page size can be A4 or US Letter.' },
      { q: 'Why do some characters show as question marks?', a: 'The built-in fonts support Latin characters only. Characters from other scripts, and some symbols, may be replaced by question marks in the PDF. Check the result before you share it.' },
      { q: 'Can I keep bold text or images?', a: 'No. A .txt file holds only plain text, so the PDF contains plain text too. For formatted documents, use Word to PDF.' },
      uploadFaq('Text to PDF'),
    ],
    keywords: ['text to pdf', 'txt to pdf converter', 'convert txt to pdf online', 'notes to pdf', 'combine text files into pdf'],
  },

  'rtf-to-pdf': {
    metaTitle: 'RTF to PDF Converter, Free Online',
    metaDescription: 'Convert Rich Text Format (.rtf) files to PDF in your browser, with A4 or US Letter pages and paragraphs kept in order.',
    h1: 'Convert RTF Files to PDF',
    h2s: ['What RTF to PDF is for', 'How an RTF file becomes a PDF', 'Typical uses for RTF conversion', 'What does not carry over'],
    paragraphs: [
      'RTF, short for Rich Text Format, was the common way to move documents between word processors for many years, and plenty of old letters, notes and exports still use it. RTF to PDF turns one of those files into a PDF that opens on any device without the program that created it. It is a good fit when you want a stable copy of a text document, for sharing or for the archive, and you do not have the original software installed anymore.',
      'The tool reads the RTF file in your browser and works through its control words to find the readable text and the paragraph breaks. Accented letters stored as Windows-1252 escapes are decoded into the right characters. The text is then set onto pages with even margins, and you pick between A4 and US Letter before running. One RTF file is converted per run, so for several documents, convert them one by one and join the results with Merge PDF.',
      'Typical jobs are simple ones. Someone finds a stack of letters saved by an old word processor and wants them in a format their phone can open. A small business exports a template or a report from legacy software that only offers RTF. A student receives a handout as RTF and wants to read or print it without installing anything. In each case the goal is the same: readable text, in a file that anyone can open later.',
      'Be realistic about what an RTF converter can do in a browser. Embedded images, tables and unusual code pages are not fully supported, and Latin text works best. Text in other scripts may appear as question marks. Fonts and exact spacing from the original program are not reproduced, so the PDF will look simpler than the source. Open the result and read through it before sending it on. If your file is plain text, use Text to PDF, and for Word files use Word to PDF.',
    ],
    steps: [
      'Add the .rtf file you want to convert.',
      'Choose A4 or US Letter as the page size.',
      'Start the conversion and wait until it reports that the file is ready.',
      'Download the PDF and read through it to check that nothing is missing.',
    ],
    faqs: [
      { q: 'Does it keep tables and images from my RTF file?', a: 'Not fully. The tool is built around text and paragraphs, and embedded images, tables and unusual code pages are not fully supported. Check the PDF against your original.' },
      { q: 'Which characters are supported?', a: 'Latin text, including accented letters stored in the Windows-1252 code page. Other scripts may show as question marks in the PDF.' },
      { q: 'Can I convert several RTF files at once?', a: 'No. One file is converted per run. To end up with one document, convert each file and combine the results with Merge PDF.' },
      uploadFaq('RTF to PDF'),
    ],
    keywords: ['rtf to pdf', 'convert rtf to pdf online', 'rich text format to pdf', 'rtf converter free', 'save rtf as pdf'],
  },

  'pdf-to-rtf': {
    metaTitle: 'PDF to RTF Converter, Free Online',
    metaDescription: 'Convert the text of a PDF into an editable RTF file you can open in most word processors. Scanned PDFs need OCR first.',
    h1: 'Convert PDF to RTF',
    h2s: ['Why convert a PDF to RTF', 'How the text is extracted', 'When RTF is the right format', 'What you will not get'],
    paragraphs: [
      'A PDF is built for reading, not for editing. When you only have the PDF but need to change the wording, RTF is one of the simplest ways out. PDF to RTF takes the text from your file and writes it as a Rich Text Format document, which most word processors, and many older programs, can open. It is useful for anyone who needs to quote, revise or reuse text from a report, letter or manual without typing it in again.',
      'The tool goes through the PDF page by page in your browser. It reads the text on each page, rebuilds lines in reading order from where the words sit, and writes them into the RTF file with special characters escaped correctly. Page breaks are kept, so the document follows the structure of the original. There are no settings to adjust. You add the file, run the tool and download the RTF when the progress bar is done.',
      'RTF is a good choice when compatibility matters more than polish. Some legacy publishing and records software only accepts RTF. Some people prefer it for quick edits because the files are simple and open almost anywhere. It also works as a middle step: pull text out of a PDF, tidy it in any editor, then turn it back into a clean PDF with RTF to PDF or Word to PDF. Choose PDF to Word instead if you specifically want a DOCX file.',
      'Only text comes across. Images, exact fonts, colours and complex layouts are not transferred, and pages with several columns can end up with lines mixed together because lines are rebuilt by position. If the RTF comes out empty, the PDF is most likely a scan made of images; run OCR PDF first to make it searchable, then convert that file. Always compare the RTF with the PDF before you rely on it, especially numbers and names. Check the last pages as well as the first, because layout problems often show up later in a long file.',
    ],
    steps: [
      'Add the PDF you want to turn into RTF.',
      'Check that the file has selectable text and is not only scanned images.',
      'Start the extraction and wait for it to finish.',
      'Download the RTF and open it in your word processor to review it.',
    ],
    faqs: [
      { q: 'Will images be included in the RTF file?', a: 'No. The output contains text only. If you need the pictures, use Extract Images.' },
      { q: 'Why is my RTF file empty or very short?', a: 'The PDF is probably a scan, so it has no text to read. Run OCR PDF on it first and convert the result.' },
      { q: 'Should I choose RTF or Word?', a: 'RTF opens in almost any word processor. If you specifically need a DOCX file, use PDF to Word.' },
      uploadFaq('PDF to RTF'),
    ],
    keywords: ['pdf to rtf', 'convert pdf to rtf online', 'pdf to rich text format', 'extract text from pdf to rtf', 'pdf to rtf converter free'],
  },

  'excel-to-pdf': {
    metaTitle: 'Excel to PDF Converter, Free Online',
    metaDescription: 'Convert XLSX, XLS and CSV spreadsheets to a printable PDF table, with one section per sheet and your choice of page size.',
    h1: 'Convert Excel and CSV to PDF',
    h2s: ['What Excel to PDF produces', 'How sheets become pages', 'Good reasons to convert a spreadsheet', 'Limits to know before you share'],
    paragraphs: [
      'Excel to PDF turns a spreadsheet into a document that anyone can open and print. It accepts XLSX and XLS workbooks as well as plain CSV exports, so it covers most of what people actually receive: budgets, price lists, class registers and data downloaded from other systems. The output is a table of cell values on clean pages. That makes it handy when the reader only needs to look at the numbers and does not need to edit, sort or recalculate anything. Everything is read in your browser.',
      'Your workbook is parsed in the browser and each sheet is drawn as a table that wraps to the width of the page. Every sheet starts on a new page, so the structure of the workbook stays easy to follow. You can choose landscape (the default) or portrait, and pick A4, US Letter or A3. Values appear as the cells display them. Each sheet is limited to 10,000 rows, which keeps the browser responsive on ordinary computers.',
      'Converting a spreadsheet to PDF is often about control. You can share a price list or a budget without handing over the formulas behind it. You can print a data export in a readable form for a meeting. Finance teams archive a monthly report as a fixed copy, and teachers send mark sheets to parents as a document rather than an editable file. A CSV from an app or a bank is also easier for a non-technical reader to open as a PDF than as a raw text file.',
      'The PDF shows values, not the full spreadsheet. Formulas appear as their results, and charts, images and cell styling such as colours are not reproduced. Very wide tables fit best on landscape A4 or A3, but you should still look at the column widths and page breaks before you send the file. Each sheet is limited to 10,000 rows, so split very large exports first. For the reverse job, pulling a table out of a PDF, use PDF to Excel, and for Word files use Word to PDF.',
    ],
    steps: [
      'Add your XLSX, XLS or CSV file.',
      'Choose landscape or portrait, and a page size of A4, US Letter or A3.',
      'Run the tool and wait while each sheet is drawn into the PDF.',
      'Download the PDF and check column widths and page breaks.',
    ],
    faqs: [
      { q: 'Does each sheet get its own page?', a: 'Yes. Every sheet starts on a new page, so a workbook with several sheets keeps its structure in the PDF.' },
      { q: 'Are formulas, charts and colours included?', a: 'Cell values are included as the cells display them. Formulas are replaced by their results, and charts, images and cell styling are not reproduced.' },
      { q: 'Is there a limit on spreadsheet size?', a: 'Each sheet is limited to 10,000 rows, so the browser stays responsive. Split very large exports into smaller files first.' },
      uploadFaq('Excel to PDF'),
    ],
    keywords: ['excel to pdf', 'xlsx to pdf converter', 'csv to pdf online', 'convert spreadsheet to pdf', 'print excel as pdf'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            4. STAGE B (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'pdf-to-excel': {
    metaTitle: 'PDF to Excel Converter, Free Online',
    metaDescription: 'Move the text of a PDF into an Excel workbook, one sheet per page, with columns guessed from spacing. Scanned PDFs need OCR first.',
    h1: 'Convert PDF Tables to Excel',
    h2s: ['Getting data out of a PDF', 'How rows and columns are guessed', 'Everyday jobs for this tool', 'Where the result needs a second look'],
    paragraphs: [
      'Tables locked inside a PDF are a familiar headache. A bank statement, a price list or a class register looks like a spreadsheet, but you cannot sort it, add it up or paste it into a formula. PDF to Excel gives you a starting point. It reads the text on each page and writes it into an XLSX workbook, so the numbers sit in cells you can select and calculate with. It suits anyone who needs the data from a PDF and does not want to retype it by hand.',
      'The tool reads every page in your browser and groups the text into rows by how high it sits on the page. Where it finds wide horizontal gaps inside a row, it starts a new cell, which is how columns are guessed. Each page goes onto its own sheet, and the workbook covers up to 150 pages. There are no settings to change. Add the file, run the tool and download the workbook when the progress bar finishes. Open it and compare a few rows with the PDF.',
      'Typical jobs are small and practical. Someone pulls a month of transactions from a statement to check them against their own records. A shop owner moves a supplier price list into a spreadsheet to compare costs. A teacher collects marks from a printed table, and an office worker gathers repeated forms into rows that can be sorted and totalled. In every case the conversion saves typing, but the sheet is a draft that needs a quick tidy before anyone relies on it.',
      'Column detection is a best guess from spacing, so expect to adjust some columns after conversion. Merged cells and ruled table lines are not detected, and a table with very uneven spacing may split in the wrong places. A scanned PDF has no text to read, so run OCR PDF first and check every figure by hand. Always compare totals with the original before you use the numbers. For plain reading use PDF to Text, and for the reverse job use Excel to PDF.',
    ],
    steps: [
      'Add the PDF that holds your table or list.',
      'No settings are needed, so go straight to the run button.',
      'Wait while each page is read and turned into a sheet.',
      'Download the XLSX and compare a few rows and totals with the PDF.',
    ],
    faqs: [
      { q: 'Will my tables be detected perfectly?', a: 'No. Columns are inferred from the spacing of the text, so complex tables may need cleaning in your spreadsheet program.' },
      { q: 'How many pages are supported?', a: 'Up to 150 pages. Each page is placed on its own sheet in the workbook.' },
      { q: 'Does it work on scanned PDFs?', a: 'A scan has no text to read. Run OCR PDF first to make the text searchable, convert that file, and check every figure by hand.' },
      { q: 'Are merged cells and borders kept?', a: 'No. Merged cells and ruled lines are not detected, so the workbook holds the text in plain cells.' },
      uploadFaq('PDF to Excel'),
    ],
    keywords: ['pdf to excel', 'pdf to xlsx converter', 'convert pdf table to excel', 'extract table from pdf', 'pdf to excel free online'],
  },

  'ppt-to-pdf': {
    metaTitle: 'PowerPoint to PDF Converter, Free Online',
    metaDescription: 'Convert PPTX presentations to PDF with one page per slide, showing slide text and pictures. Runs in your browser, no sign-up.',
    h1: 'Convert PowerPoint to PDF',
    h2s: ['Sharing slides without PowerPoint', 'What happens to each slide', 'Who converts presentations to PDF', 'A content copy, not a design copy'],
    paragraphs: [
      'A presentation is easy to present and awkward to send. The recipient may not have PowerPoint, may open it on a phone that scrambles the layout, or may only want to read the text. PowerPoint to PDF turns a PPTX file into a document with one page per slide. The text and pictures from each slide are carried across in order, giving you a light file that opens on any device. It works well for lecture notes, review copies and archives of finished decks.',
      'A PPTX file is really a package of XML and media files. The tool opens that package in your browser, reads the text and images on each slide in order and sets them onto PDF pages. It does not run PowerPoint itself, so there is no attempt to redraw your theme, transitions or animations. There are no options to choose. Add one file, run the tool and download the PDF. The page order in the result follows the slide order in the presentation.',
      'People use this for plain, practical reasons. A lecturer sends slides to students as a PDF they can read on any phone. A manager shares a deck for comments with colleagues who have no Office software. A team archives the content of a finished presentation in a stable form, and a freelancer sends proposal text to a client who just wants to read it. A content-first copy is also easier to scroll through on a small screen than a full slide deck.',
      'Expect a content-focused result, not a pixel-perfect copy of your design. Themes, backgrounds, animations, transitions and complex shapes are not reproduced, so slides may look plainer than they do in PowerPoint. Only PPTX files are supported, not the older PPT format, so save an old file as PPTX first. If the exact look of every slide matters, use the export function built into PowerPoint instead. Scroll through the result and check slides with charts or diagrams first.',
    ],
    steps: [
      'Add the PPTX file you want to convert.',
      'No settings are needed, so go straight to the run button.',
      'Wait while each slide is read and placed on a page.',
      'Download the PDF and compare a few slides with the original, especially ones with charts.',
    ],
    faqs: [
      { q: 'Will my slide design be preserved?', a: 'Not exactly. Text and pictures are carried over, but themes, animations, transitions and complex shapes are not reproduced.' },
      { q: 'Does each slide become one page?', a: 'Yes. The PDF has one page per slide, in the same order as the presentation.' },
      { q: 'Can I convert an old .ppt file?', a: 'Not directly. Open it in PowerPoint or a free office suite, save it as PPTX, then convert it here.' },
      { q: 'Are charts and diagrams included?', a: 'Pictures on the slides are carried over, but charts built from shapes may not appear as they do in PowerPoint. Check those slides in the result.' },
      uploadFaq('PowerPoint to PDF'),
    ],
    keywords: ['pptx to pdf', 'powerpoint to pdf converter', 'convert ppt to pdf online', 'slides to pdf', 'presentation to pdf free'],
  },

  'pdf-to-ppt': {
    metaTitle: 'PDF to PowerPoint Converter, Free Online',
    metaDescription: 'Turn each PDF page into a PowerPoint slide with the page as an image. Choose the image quality. Runs in your browser, no sign-up.',
    h1: 'Convert PDF to PowerPoint Slides',
    h2s: ['Why turn pages into slides', 'How pages become slides', 'Where this helps', 'What stays uneditable'],
    paragraphs: [
      'Sometimes you need to present from a PDF, or you want to build a talk around pages that already look right. PDF to PowerPoint turns every page into a slide. Each page is drawn as an image and placed on its own slide, so the look of the original is kept exactly. You end up with a PPTX file you can open in PowerPoint, present as it is or extend with your own slides, notes and transitions. It suits reports, brochures and designed handouts.',
      'The tool renders each page in your browser at the image quality you pick: 1x for a smaller file, 1.5x for a balanced result, which is the default, or 2x for sharper slides. The images are inserted into a PPTX file whose slide shape matches the page proportions. Up to 300 pages are supported, and each page is cleared from memory as soon as its slide is built, which keeps long documents manageable. Higher quality makes a bigger deck, so choose the lowest setting that still looks sharp.',
      'Useful cases are easy to find. A speaker has a PDF report from a colleague and wants to walk an audience through it in PowerPoint. A teacher turns a designed worksheet into slides for a class. A team sends reviewers a deck they can annotate with the comment tools in PowerPoint, and a student reuses a few designed pages in a presentation. Because the pages are pictures, the layout is the same everywhere, with no font surprises on the computer that shows the slides.',
      'The most important limit is that each slide holds a picture of a page, so the text on it cannot be edited in PowerPoint, selected or searched. If you need editable words, use PDF to Word and build your slides from that text, or PDF to Text for plain copy. A long document at 2x can make a heavy deck, so test with the 1.5x default first. Open the finished file, step through a few slides in presentation mode and keep the original PDF.',
    ],
    steps: [
      'Add the PDF you want to turn into slides.',
      'Choose an image quality: 1x, 1.5x or 2x.',
      'Run the tool and wait while each page becomes a slide.',
      'Download the PPTX and step through a few slides in PowerPoint.',
    ],
    faqs: [
      { q: 'Can I edit the text on the slides?', a: 'No. Each slide holds a picture of the page, so the text is not editable. For editable text, convert the PDF to Word instead.' },
      { q: 'How many pages can I convert?', a: 'Up to 300 pages per file. Each page becomes one slide.' },
      { q: 'Which image quality should I choose?', a: 'Start with the 1.5x default. Choose 2x for sharper slides, or 1x when you need a smaller file.' },
      { q: 'Why is my PowerPoint file so large?', a: 'Every slide contains an image of a full page. Run the tool again at 1x to get a smaller deck.' },
      uploadFaq('PDF to PowerPoint'),
    ],
    keywords: ['pdf to powerpoint', 'pdf to pptx converter', 'convert pdf to ppt online', 'pdf to slides', 'pdf to powerpoint free'],
  },

  'resize-pdf': {
    metaTitle: 'Resize PDF Page Size, Free Online',
    metaDescription: 'Change every page of a PDF to A4, Letter, A3 or another standard size, with the content scaled to fit. Runs in your browser.',
    h1: 'Change the Page Size of a PDF',
    h2s: ['When the paper size is wrong', 'How the new size is applied', 'Printing and filing problems it solves', 'Trade-offs to know about'],
    paragraphs: [
      'A document made for one paper size does not always print well on another. A US Letter report on an A4 printer gets scaled or clipped, a small flyer needs to be larger for a notice board, and a pile of scans in mixed sizes looks untidy once merged. Resize PDF changes every page to a standard size of your choice. The content is scaled to fit and centred, so the pages come out uniform and ready to print, send or combine with other files.',
      'Choose from eight sizes: A3, A4, A5, A6, US Letter, US Legal, Tabloid and Executive. Each original page is drawn onto a new blank page of that size. With the scaling option on, which is the default, the content grows or shrinks to fit while keeping its proportions. With it off, the page is placed at its original size in the middle of the new sheet. Pages are embedded as vector content, so text and line art stay sharp at the new size.',
      'Resizing solves everyday printing and filing problems. Prepare a Letter document for an A4 printer, or the other way round. Enlarge an A5 leaflet to A3 for a bigger print. Standardise mixed-size scans before using Merge PDF so that every page matches. Fit a wide drawing onto a size your office printer supports. Because the tool changes the paper size and not the content, it is a quick fix when a recipient or a printer insists on one particular format.',
      'Know the trade-offs before you start. Pages are embedded as drawings, so clickable links and interactive form fields on them stop working after resizing. If the new size has a different shape from the old one, you will see extra white bands at the sides or at the top and bottom. Open the result and look at several pages. If you only want to trim edges, use Crop PDF. To put several pages on one sheet, use N-Up PDF.',
    ],
    steps: [
      'Add the PDF whose page size you want to change.',
      'Choose the new page size and decide whether to scale the content to fit.',
      'Run the tool and wait for the pages to be placed on the new size.',
      'Download the PDF and check a few pages for white bands or cut-off edges.',
    ],
    faqs: [
      { q: 'Will the text stay sharp?', a: 'Yes. Pages are embedded as vector content, so text and line art stay crisp at the new size.' },
      { q: 'Do links and form fields still work?', a: 'No. Embedding the pages drops clickable links and interactive form fields, which is a limit of this method.' },
      { q: 'What does the scale option do?', a: 'With it on, the content is enlarged or shrunk to fit the new size. With it off, each page is placed at its original size in the middle of the new page.' },
      { q: 'Why do I see white bands on the sides?', a: 'The new size has a different shape from the original. The content keeps its proportions, so the leftover space stays empty.' },
      uploadFaq('Resize PDF'),
    ],
    keywords: ['resize pdf', 'change pdf page size', 'convert pdf to a4', 'resize pdf online free', 'change pdf paper size'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            5. STAGE C (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'n-up-pdf': {
    metaTitle: 'N-Up PDF: Multiple Pages per Sheet',
    metaDescription: 'Put 2, 4, 6 or 9 PDF pages on each sheet for handouts and draft copies. Choose sheet size, gaps and borders. Runs in your browser.',
    h1: 'Put Several PDF Pages on One Sheet',
    h2s: ['Printing less paper', 'How the grid is built', 'Handouts, proofs and review copies', 'Small cells, small text'],
    paragraphs: [
      'Printing one page per sheet wastes paper when the pages are only slides, drafts or reference material. N-Up PDF puts several pages onto each sheet, so a forty-slide deck fits on a handful of pages instead of forty. It is the classic way to make handouts, proof sheets and compact review copies. The result is a normal PDF, so you can print it, send it or keep it. Everything is arranged in your browser, and the original file is only read, never changed, which means you can try different layouts until one looks right.',
      'Pick two, four, six or nine pages per sheet, then choose the sheet size (A4, US Letter or A3) and portrait or landscape. Landscape is the default. Each source page is scaled to fit its cell in the grid, with a gap you can set from 0 to 60 points and an optional thin border around every page, which is switched on by default. Pages fill the sheet from left to right and then top to bottom, in the same order as the original, so the reading order stays natural for slides and notes.',
      'Handouts are the obvious use. Lecture slides at six per sheet give students room to write notes beside them. Beyond that, people make a quick proof sheet of a long document to judge its flow at a glance, print a draft of a brochure to check how the pages sit together, or cut the number of sheets in a copy they only need for marking up with a pen. Two per sheet on landscape paper is also a handy way to read a long report without turning so many pages.',
      'Smaller cells mean smaller text, and nine pages per sheet makes ordinary body text hard to read, so test with four first. Pages are embedded as drawings, so clickable links and interactive form fields on them are lost. If a page has an unusual shape, expect some empty space inside its cell. Open the result and zoom in on a text-heavy sheet before you print a large batch. For a different paper size without combining pages, use Resize PDF, and if the result is heavy, try Compress PDF.',
    ],
    steps: [
      'Add the PDF whose pages you want to combine.',
      'Choose pages per sheet, sheet size, orientation, gap and whether to draw borders.',
      'Run the tool and wait while the sheets are laid out.',
      'Download the PDF and zoom into a text page to check that it is still readable.',
    ],
    faqs: [
      { q: 'In what order are the pages placed?', a: 'Pages fill each sheet from left to right and then top to bottom, in the same order as the original document.' },
      { q: 'How many pages can I put on one sheet?', a: 'You can choose 2, 4, 6 or 9 pages per sheet, on A4, US Letter or A3, in portrait or landscape.' },
      { q: 'Can I remove the borders?', a: 'Yes. Untick the border option and the pages are placed with only the gap between them, which you can set from 0 to 60 points.' },
      { q: 'Do links and form fields still work?', a: 'No. Pages are embedded as drawings, so clickable links and interactive form fields on them are lost.' },
      uploadFaq('N-Up PDF'),
    ],
    keywords: ['n-up pdf', 'multiple pages per sheet pdf', 'pdf handout maker', 'put 4 pdf pages on one page', 'combine pdf pages on one sheet'],
  },

  'header-footer-pdf': {
    metaTitle: 'Add Header and Footer to PDF, Free',
    metaDescription: 'Add a header and footer to every PDF page, with page, total and date tokens, alignment and margin. Runs in your browser, no sign-up.',
    h1: 'Add a Header and Footer to a PDF',
    h2s: ['Text that belongs on every page', 'Tokens, alignment and margins', 'Everyday uses', 'Getting the layout right'],
    paragraphs: [
      'Headers and footers carry the information that every page of a document needs: a title, a date, a reference number or a confidentiality line. Adding them after a document is finished is often simpler than editing the source file, especially when the PDF came from someone else or was made by merging several files. Header & Footer writes your own text at the top and bottom of every page, and you can mix in page numbers and dates with simple tokens. Everything happens in your browser, and your original file stays untouched on your device.',
      'Type text into the header box, the footer box or both. Three tokens are replaced on each page: {page} for the page number, {total} for the page count and {date} for the date. The footer starts as Page {page} of {total}, and the header starts empty. Choose left, centre or right alignment, which applies to both lines, set a font size from 6 to 36 points and a margin from the page edge from 8 to 120 points. You can also skip the first page, which keeps a cover clean.',
      'Typical uses are practical. Put CONFIDENTIAL at the top of every page of an internal report, label a proposal with its title and the date it was prepared, print Page 3 of 12 on a contract so nothing goes missing, or add a document reference that an auditor can trace. Combined with Merge PDF, it gives a bundle of separate files one consistent look. If the pages already carry a number at the bottom, leave the footer empty and use only the header, so the two do not collide.',
      'Keep each line short so it fits on one line across the page. Choose a margin that clears the unprintable edge of your printer and any text already near the border of the page. The built-in font covers Latin characters, so text in other scripts may appear as question marks. After running the tool, look at several pages, including one with a full-height table or a scan. If you only need numbers, Add Page Numbers is simpler, and for legal identifiers use Bates Numbering.',
    ],
    steps: [
      'Add the PDF that needs a header or footer.',
      'Type the header and footer text, using {page}, {total} and {date} where you want them.',
      'Choose alignment, font size and margin, and tick the skip option if the cover should stay clean.',
      'Run the tool, download the PDF and check a few pages for overlaps.',
    ],
    faqs: [
      { q: 'Which tokens can I use?', a: 'Use {page} for the page number, {total} for the page count and {date} for the date, in either the header or the footer.' },
      { q: 'Can I add only a footer?', a: 'Yes. Leave the header empty and only the footer is drawn. The same works the other way round.' },
      { q: 'Can the cover page stay clean?', a: 'Yes. Tick the option to skip the first page and it receives no header or footer.' },
      { q: 'Why do some characters show as question marks?', a: 'The built-in font supports Latin characters only. Text in other scripts may not display, so test one page first.' },
      uploadFaq('Header & Footer'),
    ],
    keywords: ['pdf header and footer', 'add footer to pdf', 'add header to pdf online', 'pdf footer with page number and date', 'header and footer pdf free'],
  },

  'bates-numbering': {
    metaTitle: 'Bates Numbering for PDF, Free Online',
    metaDescription: 'Stamp sequential Bates numbers with a prefix and suffix across up to 50 PDF files, continuing the count between files. No sign-up.',
    h1: 'Add Bates Numbers to PDF Files',
    h2s: ['What Bates numbering is', 'Prefix, digits and start number', 'Who needs it', 'Order, passwords and checks'],
    paragraphs: [
      'Bates numbering gives every page in a set of documents its own unique identifier, such as CASE-000001. Law firms use it for discovery and evidence, and compliance and audit teams use it so that any page can be cited exactly and found again. An ordinary page number restarts with each file, but a Bates number runs on through the whole set. Bates Numbering stamps those identifiers in your browser, on one file or up to 50 at a time, and your original files are never changed.',
      'Set a prefix, an optional suffix, the number to start from and how many digits to pad with zeros, from 1 to 10. The defaults are the prefix DOC-, a start of 1 and six digits, which gives DOC-000001. Pick one of six positions on the page and a font size from 6 to 36 points. Files are handled in the order shown in the list, and the counter carries on from the last page of one file to the first page of the next without restarting. Each file comes back as its own PDF.',
      'Use it to prepare documents for disclosure in a legal case, to label an evidence bundle, to number pages across a batch of contracts before an audit, or to give every page of a due diligence set a reference that can be quoted in an email. Write down the last number used when you finish, so that a later batch can continue from it by setting the start number. Order matters, so arrange the list before you run the tool, not afterwards.',
      'Check the order of the files first, because the numbering follows the list exactly and a mistake means running the tool again. Encrypted files must be unlocked before they can be numbered. Choose a position that is clear of existing footers and stamps, and open the result to check pages with tables or scans. The built-in font covers Latin characters, so keep prefixes simple. For ordinary numbering use Add Page Numbers, and for repeated text on every page use Header & Footer.',
    ],
    steps: [
      'Add up to 50 PDF files and put them in the order they should be numbered.',
      'Set the prefix, suffix, start number, digits, position and font size.',
      'Run the tool and wait while every page is stamped.',
      'Download the results and note the last number used for your next batch.',
    ],
    faqs: [
      { q: 'Does numbering continue across files?', a: 'Yes. The counter carries on from the last page of one file to the first page of the next, in the order of the list.' },
      { q: 'Can I add a prefix and a suffix?', a: 'Yes. Both are optional, and the digits setting controls the zero padding of the number between them.' },
      { q: 'How do I continue a numbering sequence later?', a: 'Note the last number from the earlier batch and enter the next one as the start number when you run the tool again.' },
      { q: 'Can I number a password-protected file?', a: 'Encrypted files must be unlocked first. After unlocking, use the unlocked copy here.' },
      uploadFaq('Bates Numbering'),
    ],
    keywords: ['bates numbering', 'bates stamp pdf', 'bates numbering software free', 'legal document numbering', 'add bates numbers to pdf'],
  },

  'overlay-pdf': {
    metaTitle: 'Overlay One PDF on Another, Free',
    metaDescription: 'Place one PDF in front of or behind another for letterheads, stamps and templates. Set opacity and page matching. Runs in your browser.',
    h1: 'Overlay One PDF on Another',
    h2s: ['Two documents, one page', 'Placement, pages and opacity', 'Letterheads, stamps and templates', 'When the page counts differ'],
    paragraphs: [
      'Sometimes the content of one PDF needs to sit on top of, or underneath, another. A company letterhead goes behind a letter, an APPROVED stamp goes over a finished form, and a ruled template goes under scanned pages. Overlay PDF combines two documents page by page so you do not have to rebuild either one. You add exactly two files: the first is the base and the second is the overlay. The work is done in your browser, and both of your original files are left unchanged.',
      'Choose whether the overlay goes in front of the base or behind it. Then choose how overlay pages are used: the first overlay page can be repeated on every base page, which suits a letterhead or a stamp, or pages can be matched one by one for multi-page templates. An opacity setting from 5 to 100 percent controls how strongly the overlay shows, and 100 is the default. Check the order in the file list before you run the tool, since swapping the files changes which one is the base.',
      'Common jobs include printing letters on a digital letterhead, adding a company footer or logo to generated invoices, stamping finished pages, and combining a ruled or branded template with scanned content. A school can add a crest to a set of certificates, and an office can mark a stack of forms as received. Because the base file keeps its own pages, you can reuse the same overlay again and again on different documents without editing any of them.',
      'In match mode, base pages beyond the last overlay page get no overlay, so use the first-page mode when one overlay should cover everything. An overlay placed in front can hide the base content, so lower the opacity or use an overlay with open space. Look at the first page and a busy page in the result before you use it. This tool combines pages visually. To simply join documents end to end, use Merge PDF, and for a text stamp use Watermark PDF.',
    ],
    steps: [
      'Add the base PDF first and the overlay PDF second.',
      'Choose front or back placement, how overlay pages are used, and the opacity.',
      'Run the tool and wait while the pages are combined.',
      'Download the PDF and check the first page and one with a lot of content.',
    ],
    faqs: [
      { q: 'Which file is the base?', a: 'The first file in the list is the base and the second is the overlay. Use the arrows in the list to swap them.' },
      { q: 'What if the base has more pages than the overlay?', a: 'In match mode the extra base pages get no overlay. Choose the first-page mode to repeat one overlay page on all of them.' },
      { q: 'Can the overlay go behind the base?', a: 'Yes. Choose the behind option for letterheads and templates, or in front for stamps and marks.' },
      { q: 'Can I make the overlay see-through?', a: 'Yes. Lower the opacity, anywhere from 5 to 100 percent, so the content beneath stays readable.' },
      uploadFaq('Overlay PDF'),
    ],
    keywords: ['overlay pdf', 'pdf letterhead overlay', 'put one pdf over another', 'merge pdf layers', 'stamp pdf with another pdf'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            6. STAGE D (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'grayscale-pdf': {
    metaTitle: 'Convert PDF to Grayscale, Free Online',
    metaDescription: 'Convert a colour PDF to grayscale to save ink and cut file size. Pages become images. Choose scale and quality. Runs in your browser.',
    h1: 'Convert a PDF to Grayscale',
    h2s: ['Why remove the colour', 'How the conversion works', 'Printing and testing uses', 'What you give up'],
    paragraphs: [
      'Colour costs money when you print, and it adds weight to files that do not need it. Grayscale PDF converts every page to shades of grey, which suits monochrome printers, saving ink and documents where colour carries no meaning. Think of internal reports with decorative headers, scanned forms, or brochures you only need to read. It runs in your browser, so the original colour file stays as it was, and you can compare the two results before you decide which one to keep or send.',
      'Each page is drawn in your browser, its colours are converted to shades of grey, and the result is saved as a compressed JPEG image inside a new PDF. Two settings control the balance. Render scale can be 1x, 1.5x, 2x or 3x, with 1.5x as the default, and JPEG quality runs from 40 to 95, starting at 80. Higher values keep more detail and give a bigger file. Lower values give a smaller file but can blur fine print and thin lines.',
      'Use it to print a report cheaply, to prepare forms for a submission that only accepts black and white, to shrink a photo-heavy brochure, or to check how a colourful chart reads once the colour is gone. A designer can test whether a diagram still makes sense in a black and white print run before paying for one. If you want a smaller file without changing any colours, Compress PDF is usually the better choice for that job.',
      'Because pages become images, the text is no longer selectable or searchable, and links stop working. Keep your original if you need either. Thin lines and small print can soften at low settings, so for office documents try 1.5x with quality near 80 and zoom into the result before you print. If you need searchable text again afterwards, run OCR PDF. Very long documents at 3x use a lot of memory, so test with a few pages first.',
    ],
    steps: [
      'Add the colour PDF you want to convert.',
      'Choose a render scale and a JPEG quality, or keep the defaults.',
      'Run the tool and wait while each page is converted.',
      'Download the PDF and zoom into small print to check it is still readable.',
    ],
    faqs: [
      { q: 'Will the text still be selectable?', a: 'No. Pages are rebuilt as images, so text is not selectable or searchable in the grayscale result.' },
      { q: 'Does grayscale reduce file size?', a: 'Often, yes, but the biggest effect comes from the scale and quality settings you choose.' },
      { q: 'Which settings should I start with?', a: 'A render scale of 1.5x with JPEG quality around 80 is a good balance for office documents. Raise both for small print.' },
      { q: 'Can I get the colours back?', a: 'No. The colour information is gone from the new file, so keep your original.' },
      uploadFaq('Grayscale PDF'),
    ],
    keywords: ['grayscale pdf', 'convert pdf to grayscale', 'pdf to black and white', 'make pdf black and white online', 'save ink pdf grayscale'],
  },

  'invert-pdf-colors': {
    metaTitle: 'Invert PDF Colors, Dark Mode PDF',
    metaDescription: 'Invert the colours of a PDF for a dark-mode copy that is easier to read at night. Pages become images. Runs in your browser.',
    h1: 'Invert the Colors of a PDF',
    h2s: ['A dark version of a bright page', 'What happens to each page', 'Night reading and scan fixes', 'Photos, text and quality'],
    paragraphs: [
      'White pages are bright, and reading a long paper on a screen late at night with the lights off can be uncomfortable. Invert PDF Colors flips every colour, turning white backgrounds black and dark text light, so you get a dark-mode copy of a document that has no dark theme of its own. It also helps in the other direction, turning a white-on-black scan into dark-on-white. The conversion runs in your browser, and your original file is not changed in any way.',
      'Each page is drawn in your browser, every pixel is replaced by its opposite colour, and the inverted images are saved as compressed JPEGs inside a new PDF. Render scale (1x, 1.5x, 2x or 3x, with 1.5x as the default) sets how sharp the pages are, and JPEG quality (40 to 95, default 80) sets how hard each page is compressed. Raise both for small text, and lower both for a lighter file. The result has the same number of pages as the original.',
      'Typical uses are simple. Read papers and manuals at night without glare, turn a negative-looking scan back into black text on white, or save ink on a document with heavy dark backgrounds by reversing it before printing. Students use it for lecture notes, and developers use it for long specifications. If you only need dark mode on screen, your PDF viewer may already have a night theme that needs no new file, so it is worth trying that first.',
      'Expect photographs to look like film negatives, because every colour is reversed and that is simply how the effect works. Because pages become images, text can no longer be selected or searched. Inverting an inverted file restores the colours, but some quality is lost on each pass, so keep the original instead. Check the first page and one with a chart at full zoom. For black and white without reversing, use Grayscale PDF, and for a smaller size use Compress PDF.',
    ],
    steps: [
      'Add the PDF you want to turn into a dark version.',
      'Choose a render scale and a JPEG quality, or keep the defaults.',
      'Run the tool and wait while each page is inverted.',
      'Download the PDF and read a page of text at full zoom to check it.',
    ],
    faqs: [
      { q: 'Why do the pictures look strange?', a: 'Inversion reverses every colour, so photos look like film negatives. That is how the effect works.' },
      { q: 'Can I get the original colours back?', a: 'Run the tool on the inverted file to flip it again, though some quality is lost each time. Keeping the original is better.' },
      { q: 'Will I be able to select the text?', a: 'No. Pages are saved as images, so text is not selectable or searchable. Use OCR PDF if you need that afterwards.' },
      { q: 'Is there a faster way to read in dark mode?', a: 'Many PDF viewers have a night theme that changes the display only. This tool is for when you want an actual dark copy of the file.' },
      uploadFaq('Invert PDF Colors'),
    ],
    keywords: ['invert pdf colors', 'pdf dark mode', 'dark mode pdf converter', 'negative pdf', 'invert pdf online free'],
  },

  'remove-annotations': {
    metaTitle: 'Remove PDF Annotations, Free Online',
    metaDescription: 'Remove highlights, notes, drawings and links from a PDF, or only the markup. Form fields are kept. Runs in your browser, no sign-up.',
    h1: 'Remove Annotations from a PDF',
    h2s: ['A clean copy after review', 'Three ways to clean a file', 'When a clean copy is needed', 'What cannot be removed'],
    paragraphs: [
      'A PDF that has been through a review round is often full of marks: yellow highlights, sticky notes, pen drawings and comment bubbles. Before you send it on, you may want a clean copy without any of that feedback. Remove Annotations strips those marks in one go, or removes only the links, and leaves the page content as it was. It works in your browser, your original file is not changed, and you can run it again with a different mode if the first result is not what you wanted.',
      'There are three modes. The first removes every annotation except form fields. The second, markup only, removes highlights, notes and drawings but leaves links working. The third removes only clickable links and leaves the markup in place. The tool goes through the annotation list of each page and deletes the entries that match your choice. Form fields are always kept because they are part of the document and not review marks, and the page content is not redrawn, so text stays selectable.',
      'Use it to send a final copy after a review, to remove stray highlights from a textbook before printing, to strip tracking links from a newsletter PDF, or to clean up a shared file before archiving it. A manager can circulate a tidy version of a contract once all comments have been resolved, and a student can reset a borrowed study file. Choose markup only if you want clickable links to keep working after the clean-up, and keep the marked-up original in case you need the comments again.',
      'Only real annotation objects are removed. Marks that were flattened into the page, or text that was typed straight into the content, are part of the page and cannot be removed this way. A clean-looking file is not the same as a confidential one, so review the result before you share it, and use Redact PDF if sensitive information must disappear for good. To turn form fields into fixed content, use Flatten PDF. For a smaller file, try Compress PDF.',
    ],
    steps: [
      'Add the PDF that contains the comments or links.',
      'Choose what to remove: all annotations, markup only or links only.',
      'Run the tool and wait while each page is cleaned.',
      'Download the PDF and scroll through it to confirm the marks are gone.',
    ],
    faqs: [
      { q: 'Are form fields removed too?', a: 'No. Form fields are kept in every mode. Use Flatten PDF if you want to turn them into fixed content.' },
      { q: 'Can I keep the links and remove only comments?', a: 'Yes. Choose markup only, which removes highlights, notes and drawings but leaves links working.' },
      { q: 'Can it remove marks that were burned into the page?', a: 'No. Only real annotation objects are removed, not marks that were already merged into the page content.' },
      { q: 'Is my original file changed?', a: 'No. A new file is created and your original keeps all of its comments.' },
      uploadFaq('Remove Annotations'),
    ],
    keywords: ['remove annotations from pdf', 'remove pdf comments', 'delete highlights from pdf', 'strip links from pdf', 'clean pdf comments free'],
  },

  'flatten-pdf': {
    metaTitle: 'Flatten PDF Forms and Pages, Free',
    metaDescription: 'Flatten PDF form fields so answers become fixed page content, or turn whole pages into images. Runs in your browser, no sign-up.',
    h1: 'Flatten a PDF',
    h2s: ['From form to fixed page', 'Forms only or full', 'When flattening is the right step', 'Permanent, not protective'],
    paragraphs: [
      'A filled-in form is still a form. Fields can be edited, they can look different in different viewers, and someone can change an answer after you have finished with it. Flatten PDF turns interactive content into fixed page content. Fill in a form, flatten it, and the answers become part of the page. A full mode goes further and turns each page into a picture. It runs in your browser, so the original editable file stays safely on your device, ready for another round of changes.',
      'Forms only mode draws the current value of every form field onto the page and removes the field, so the rest of the text stays selectable. Full mode renders each page to an image and rebuilds the document from those images. In full mode you can pick the image quality: 1x, 1.5x, 2x or 3x, with 2x as the default. Higher settings give sharper pages and bigger files. Forms only is the default mode and is the right choice for most completed forms.',
      'Use it to lock a completed application before sending it, to make sure a form looks identical in every viewer, to archive a signed contract so answers are not changed by accident, or to remove editable layers from a design proof. Teachers flatten worksheets after marking them, and offices flatten forms before filing. Check that every answer sits in the right place before you send the result on, because what you see in the flattened file is exactly what the reader gets.',
      'Flattening cannot be undone, so keep an editable copy. Full mode makes text non-selectable and unsearchable and usually makes the file larger, although it also stops text being copied out. Neither mode is a security feature, because someone with the right software can still alter a PDF, so treat flattening as a finishing step and not as protection. If a scanned result needs searchable text, use OCR PDF. To remove review marks instead, use Remove Annotations.',
    ],
    steps: [
      'Add the PDF with the filled-in form or the pages you want to fix.',
      'Choose forms only or full mode, and the image quality if you chose full.',
      'Run the tool and wait while the pages are processed.',
      'Download the PDF and check that every answer appears where it should.',
    ],
    faqs: [
      { q: 'What is the difference between the two modes?', a: 'Forms only converts form fields to static content and keeps text selectable. Full turns every page into an image, which also fixes text and graphics.' },
      { q: 'Can I make flattened forms editable again?', a: 'No. Flattening is permanent for that file, so keep your editable original.' },
      { q: 'Will I still be able to select text?', a: 'In forms only mode, yes. In full mode no, because pages become images. Use OCR PDF if you need searchable text afterwards.' },
      { q: 'Does flattening make a PDF secure?', a: 'No. It fixes the content in place, but it is not protection, and a determined person with PDF software could still change the file.' },
      uploadFaq('Flatten PDF'),
    ],
    keywords: ['flatten pdf', 'flatten pdf form', 'make pdf form uneditable', 'flatten pdf online free', 'convert fillable pdf to flat pdf'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            7. STAGE E (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'extract-images-pdf': {
    metaTitle: 'Extract Images from PDF Online Free',
    metaDescription: 'Pull the pictures out of a PDF and download them as PNG or JPG in one ZIP. Skip tiny graphics, no sign-up, runs in your browser.',
    h1: 'Extract Images from a PDF',
    h2s: ['How image extraction works', 'PNG or JPG: which to choose', 'Why some images are skipped', 'When extraction finds nothing'],
    paragraphs: [
      'This tool goes through the PDF and finds every image object stored inside it, such as photos, logos and scanned pictures. Each one is saved as its own file and all of them are packed into a single ZIP. Files are numbered by page, so you can tell which page an image came from. It is a quick way to recover a photo from a brochure, grab the logo from a report or collect all the figures from a paper without taking screenshots.',
      'You can save the images as PNG or JPG. PNG is lossless, which suits logos, diagrams and screenshots with sharp edges, and it is the default. JPG gives smaller files and works well for photographs. Note that the tool re-encodes each image into the format you pick, so you do not receive the exact original bytes that were embedded in the PDF. If you need whole pages as pictures instead of the images inside them, use PDF to JPG or PDF to PNG.',
      'The minimum size setting skips images smaller than a number of pixels on their shortest side. The default is 50, and you can set anything from 0 to 2000. A higher value filters out the tiny decorative bullets, lines and icons that many documents contain, while 0 keeps everything. Stencil masks are skipped too, and the summary tells you how many were left out. A single run collects up to 1000 images into one ZIP.',
      'Some PDFs contain no extractable images. A page that looks like a picture may actually be a vector drawing, which is not stored as an image object. A scanned PDF usually stores each page as one large image, so you will get the page scans back rather than separate photos. If nothing is found, the tool explains why instead of handing you an empty ZIP. For words rather than pictures, use PDF to Text, and to inspect the typefaces in a file try Extract Fonts.',
    ],
    steps: [
      'Upload the PDF that contains the images you want.',
      'Choose PNG for lossless quality or JPG for smaller files.',
      'Set the minimum size to skip tiny decorative graphics.',
      'Run the tool and download the ZIP of numbered images.',
    ],
    faqs: [
      { q: 'Do I get the original image files from the PDF?', a: 'Not byte for byte. Each image is decoded and saved again as PNG or JPG, so the picture looks the same but the file is newly encoded. JPG output is compressed again, which can lower quality slightly, so choose PNG when quality matters.' },
      { q: 'Why are some images missing from the ZIP?', a: 'Images smaller than your minimum size are filtered out, and stencil masks are skipped. Set the minimum size to 0 to keep everything, and read the summary to see how many masks were left out.' },
      { q: 'What if my PDF is a scan?', a: 'A scanned PDF usually holds each page as one large image, so you will get page pictures back rather than separate photos. If you want the text instead, run OCR PDF.' },
      uploadFaq('Extract Images'),
    ],
    keywords: ['extract images from pdf', 'pdf image extractor', 'save pdf images as png', 'pdf images to zip', 'extract pictures from pdf'],
  },

  'extract-fonts-pdf': {
    metaTitle: 'Extract Fonts from PDF Online Free',
    metaDescription: 'List the fonts used in a PDF and download the embedded font files in a ZIP with a report. Free, no sign-up, works in your browser.',
    h1: 'Extract Fonts from a PDF',
    h2s: ['What the font extractor does', 'Embedded and non-embedded fonts', 'Reading the font report', 'Licences and subset fonts'],
    paragraphs: [
      'This tool inspects the font dictionaries inside a PDF and copies out every font that is embedded in the file. It detects the format of each one, such as TrueType, OpenType, CFF or Type 1, and puts the font files into a ZIP. Designers use it to find out which typeface a document uses, and print teams use it to check what is actually included in a file before it goes to a press.',
      'Fonts are listed once per document, not once per page, so a typeface used on fifty pages appears a single time. Fonts that are not embedded cannot be extracted because the PDF only stores their name, and the tool lists those by name only. That is useful on its own, since a font that is not embedded means the file may look different on a computer that does not have it installed. Type 3 fonts are not extracted.',
      'The report option is switched on by default and adds a text summary to the ZIP. It names the fonts found in the document, including the ones that could not be extracted. Keep it on if you want a record of the file, and switch it off if you only need the font files. You can also use the report alongside Compare PDF Versions when you want to see whether a revision changed the typefaces.',
      'Extracted fonts are very often subsets, which means they contain only the characters used in the document, not the full alphabet. A subset font may be missing letters you want to type later. Fonts are also protected by licences, so check the terms before installing or reusing any file you extract. If a PDF will not open properly at all, try Repair PDF first, and for pictures inside the file use Extract Images.',
    ],
    steps: [
      'Upload the PDF whose fonts you want to inspect.',
      'Keep the report option on if you want a written font list.',
      'Run the tool and wait for the ZIP to be built.',
      'Download the ZIP and check the report for embedded and missing fonts.',
    ],
    faqs: [
      { q: 'Why does the report list a font with no file?', a: 'That font is not embedded in the PDF. The file stores only its name, so there is nothing to copy out. Type 3 fonts are also not extracted.' },
      { q: 'Can I install the extracted fonts?', a: 'You may be able to, but many are subsets with only some characters, and most fonts are covered by licences that limit reuse. Check the licence from the font creator before installing or sharing any of them.' },
      { q: 'Does it show fonts page by page?', a: 'No. Fonts are listed for the whole document, so a font used on many pages appears once.' },
      uploadFaq('Extract Fonts'),
    ],
    keywords: ['extract fonts from pdf', 'pdf font extractor', 'list fonts in pdf', 'embedded fonts pdf', 'find font used in pdf'],
  },

  'compare-pdf': {
    metaTitle: 'Compare Two PDF Files Online Free',
    metaDescription: 'Compare two PDFs by text or by image and see added, removed and changed content in a report. Free, no sign-up, in your browser.',
    h1: 'Compare Two PDF Files',
    h2s: ['Text mode and visual mode', 'Reading the visual comparison', 'Setting the sensitivity', 'Limits of comparing PDFs'],
    paragraphs: [
      'Upload an original PDF and a revised PDF, then pick how they should be compared. Text mode extracts the words from both files, lines up the matching pages and lists the lines that were added or removed in a TXT report. It is the better choice for contracts, manuals and articles where you want to know what wording changed, and it is the default mode. The report is plain text, so you can keep it with the two files, search it for a name or a number and send it to a colleague who needs to approve the changes.',
      'Visual mode renders each pair of pages as an image and marks the pixels that differ. It writes a summary and a PNG for each page that has differences. Red marks content that appears only in the original, and green marks content that appears only in the revised file. This catches changes that text mode cannot see, such as a moved logo, a new chart or a changed colour. Because the result is a set of images, you can open them side by side with your own files, and only the pages that actually differ get an image, so a long document with one edit does not flood you with output.',
      'The sensitivity setting runs from 1 to 10, with 5 as the default, and it only applies to visual mode. It controls how small a difference has to be before it is marked. Start in the middle, look at the result, and run again with a different value if you see too many marks from harmless rendering noise or too few to be useful.',
      'Be aware of the limits. If a page was inserted into the revised file, every later page pair shifts in visual mode, so most pages will look different. In that case use text mode, or remove the extra page first with Delete Pages. Text mode also needs real text, so a scanned file must go through OCR PDF first. For a document-level report that covers properties and fonts, see Compare PDF Versions.',
    ],
    steps: [
      'Upload the original PDF first and the revised PDF second.',
      'Choose text mode for wording changes or visual mode for layout changes.',
      'In visual mode, adjust the sensitivity if needed.',
      'Run the comparison and download the report or the PNG images.',
    ],
    faqs: [
      { q: 'Which mode should I use?', a: 'Use text mode when you care about changed wording, because it aligns matching pages and lists added and removed lines. Use visual mode for design, images and layout, where the text may be identical but the page looks different.' },
      { q: 'What do the red and green marks mean?', a: 'In visual mode, red shows content that exists only in the original PDF and green shows content that exists only in the revised PDF.' },
      { q: 'Can I compare two scanned PDFs?', a: 'Text mode cannot read a scan because there is no real text to extract. Run OCR PDF on both files first, or use visual mode to compare the page images directly.' },
      { q: 'How is this different from Compare PDF Versions?', a: 'This tool looks at page content, either as text lines or as coloured pixels. The other tool writes a document-level report that adds properties, page dimensions and fonts.' },
      uploadFaq('Compare PDF'),
    ],
    keywords: ['compare pdf files', 'pdf diff online', 'compare two pdfs', 'find differences between pdfs', 'pdf comparison tool'],
  },

  'compare-pdf-versions': {
    metaTitle: 'Compare PDF Versions Online Free',
    metaDescription: 'Compare an older and a newer PDF and get a report on properties, page sizes, fonts and text changes. Free, runs in your browser.',
    h1: 'Compare Two Versions of a PDF',
    h2s: ['A document-level change report', 'What the report covers', 'The metadata option', 'When to use another tool'],
    paragraphs: [
      'This tool is built for tracking a document through revisions. Upload the older version and the newer version, and it produces a single TXT report describing what changed between them. Instead of marking pixels on the page, it looks at the structure of both files and reads their text, so you get a written trail that is easy to keep, search and attach to an email or a review ticket. Because it is a text file, it works well as a record: save it next to the two versions, and you can later point to it when someone asks what changed from one release to the next.',
      'The report covers document properties such as the title and producer, the dimensions of each page, the fonts used and the text changes page by page. Text changes are aligned using exact content, so only real differences in wording should be listed. This makes it handy for checking that an export from a new program did not quietly change the page size or swap a typeface. Use it when you receive a file back from a client or colleague and want a quick, written answer to the question of what was touched, before you decide whether a closer visual check is needed.',
      'The include metadata option is on by default. It adds the comparison of document properties, such as title and producer, to the report. Turn it off if you only care about pages, fonts and text, for example when two files were exported by different software and you already expect the producer line to differ. Either way the report is plain text, so you can open it in any editor.',
      'Scanned PDFs contain no real text, so their text changes section will be empty. Run OCR PDF first if you need wording differences. If you want to see layout or image changes, use Compare PDF in visual mode, which marks differing pixels in red and green. For a plain text copy of a single file, PDF to Text is the simpler tool.',
    ],
    steps: [
      'Upload the older version of the document first.',
      'Upload the newer version of the document second.',
      'Keep include metadata on if you want properties compared too.',
      'Run the tool and download the TXT report.',
    ],
    faqs: [
      { q: 'What is the difference from Compare PDF?', a: 'Compare PDF marks changes inside the pages, as text lines or as coloured pixels. This tool writes a report about the whole document, with properties, page dimensions and fonts next to the page-by-page text changes.' },
      { q: 'Why is the text changes section empty?', a: 'The file is probably a scan, so it has no real text to compare. Run OCR PDF on both versions first and then compare again.' },
      { q: 'Can it show me visual differences?', a: 'Not in this tool, which reports on text and structure. Use Compare PDF in visual mode to get page images with red and green marks.' },
      uploadFaq('Compare PDF Versions'),
    ],
    keywords: ['compare pdf versions', 'pdf version comparison', 'pdf revision report', 'compare old and new pdf', 'pdf change report'],
  },

  /* -------------------------------------------------------------------------- */
  /*                            8. STAGE F (4 TOOLS)                            */
  /* -------------------------------------------------------------------------- */

  'ocr-pdf': {
    metaTitle: 'OCR PDF Online Free - Searchable PDF',
    metaDescription: 'Turn scanned PDFs and images into a searchable PDF or plain text with OCR in 11 languages including Urdu. Free, runs in your browser.',
    h1: 'OCR PDF: Make Scans Searchable',
    h2s: ['What OCR does to a scanned file', 'Choosing the right language', 'Searchable PDF or plain text', 'Speed, accuracy and first-use download'],
    paragraphs: [
      'OCR stands for optical character recognition. A scanned PDF is really a set of pictures, so you cannot search it, select a word or copy a paragraph. This tool reads the pictures and works out the text. In searchable PDF mode it keeps the page looking as scanned and adds an invisible text layer on top, so search and copy start to work. You can upload a PDF, or a PNG, JPG or JPEG image. The same applies to image files, so a phone photo of a page can be turned into a searchable PDF or a text file in the same way.',
      'Pick the language that matches the document before you run it. The list has English, Urdu, Arabic, Hindi, French, German, Spanish, Italian, Portuguese, Russian and Turkish, with English as the default. Accuracy depends heavily on this choice, so a page in Urdu read as English will come out as nonsense. Straight pages and sharp, high-resolution scans give the best results, while skewed, faded or blurry scans give more mistakes.',
      'Output mode lets you choose a searchable PDF, which is the default, or a plain TXT file. Choose TXT when you only need the words, for example to paste into another document. The scale setting offers 2, which is faster and is the default, or 3, which is more accurate but slower. Try 2 first and switch to 3 if small print is misread. For a PDF that already has real text, PDF to Text is quicker.',
      'The recognition engine is Tesseract, running as WebAssembly inside your browser. The first time you use a language, its language data is downloaded and then cached by the browser, so the first run is slower and later runs are quicker. Long documents take a while because every page is processed on your device, so keep the tab open. Always proofread important text, since OCR is never perfect. Afterwards, PDF to Word can build an editable file. Keep your original scan as well, so you can run the process again with a different language or scale if the first result is not good enough.',
    ],
    steps: [
      'Upload a scanned PDF or an image of a document.',
      'Select the language that matches the text on the page.',
      'Choose searchable PDF or TXT, and pick scale 2 or 3.',
      'Run OCR, wait for all pages to finish and download the result.',
    ],
    faqs: [
      { q: 'Why was the first run slow?', a: 'The language data has to be downloaded the first time you use a language. After that your browser keeps a copy, so later runs with the same language start faster. Only the language data is downloaded, your document is not uploaded.' },
      { q: 'Why is the recognised text wrong?', a: 'Check that the language matches the page first. Then try scale 3, and if you can, rescan the document straight and at a higher resolution. Skewed, blurry or low-contrast pages cause most mistakes.' },
      { q: 'Does it read handwriting?', a: 'Printed text works best. Handwriting is generally recognised poorly by this kind of engine, so expect many errors and check the output carefully.' },
      uploadFaq('OCR PDF'),
    ],
    keywords: ['ocr pdf online', 'scanned pdf to searchable pdf', 'urdu ocr pdf', 'make pdf searchable', 'extract text from scanned pdf'],
  },

  'sign-pdf': {
    metaTitle: 'Sign PDF Online Free - Draw or Upload',
    metaDescription: 'Add your handwritten signature to a PDF by drawing it or uploading an image. Choose the page and position. Free, in your browser.',
    h1: 'Sign a PDF with Your Signature',
    h2s: ['Draw or upload your signature', 'Choose the page and position', 'Set the signature size', 'What an image signature is and is not'],
    paragraphs: [
      'You can create a signature in two ways. Draw it directly on the screen with a mouse, a trackpad or your finger on a phone, or upload a PNG or JPG picture of a signature you already have. The tool crops the empty space around your ink and saves the result as a transparent image, so the signature sits cleanly on the page without a white box behind it. A signature is required before the tool will run.',
      'Next decide where it goes. The target setting places the signature on the last page, which is the default, on the first page, on every page, or on a custom page number that you type in. Position offers six places on the page, and bottom right is the default. Last page and bottom right suit most letters and contracts, while all pages suits documents that need a mark on every sheet.',
      'Width controls how large the signature appears, as a percentage of the page width, from 5 to 80 with 25 as the default. A small value looks neat on a form line, while a larger one is easier to see on a letter. If the result is too big or too small, run the tool again on the original file with a new width. For a text stamp across the page, Watermark PDF is the better choice.',
      'It is important to understand what this adds. The result is a picture of your signature placed on the page. It is not a cryptographic digital signature, so it does not prove who signed and it cannot detect later changes to the document. Some contracts and official processes require a certified digital signature, so check first. If the document has form fields, Flatten PDF can turn the answers into normal page content before you sign.',
    ],
    steps: [
      'Upload the PDF you need to sign.',
      'Draw your signature or upload a PNG or JPG image of it.',
      'Choose the target page, position and width.',
      'Run the tool and download the signed PDF.',
    ],
    faqs: [
      { q: 'Is this a legally binding digital signature?', a: 'This tool places an image of your signature on the page. It is not a cryptographic digital signature and it does not verify identity. Whether an image signature is accepted depends on the document and the rules that apply, so ask the receiving party if you are unsure.' },
      { q: 'Can I sign more than one page?', a: 'Yes. Set the target to all pages to place it on every page, or choose custom and type the page number. The default is the last page.' },
      { q: 'Will my signature be saved for next time?', a: 'No. The signature exists only in the browser tab while you work, so you will need to draw or upload it again on your next visit.' },
      uploadFaq('Sign PDF'),
    ],
    keywords: ['sign pdf online', 'add signature to pdf', 'draw signature on pdf', 'sign pdf without printing', 'pdf signature image'],
  },

  'redact-pdf': {
    metaTitle: 'Redact PDF Online Free - Remove Text',
    metaDescription: 'Search a PDF for words or phrases and cover them with solid boxes. The rasterize option removes the text underneath. Free, in your browser.',
    h1: 'Redact Text in a PDF',
    h2s: ['How search-based redaction works', 'Rasterize: the setting that matters', 'Matching, case and colour', 'Always review the result'],
    paragraphs: [
      'Type the words or phrases you want hidden, separated by commas or on new lines, and the tool searches the text of every page and covers each match with a solid box. This is useful for names, account numbers, email addresses or any phrase you must remove before sharing a document. Because matches are found through the text layer of the page, the tool works on PDFs that have real, selectable text. Keep your original file safe and share only the redacted copy, because that copy is the one meant to leave your hands.',
      'The rasterize option is on by default and it is the most important setting. When it is on, the pages are rebuilt as images with the boxes burned in, which truly removes the text underneath because there is no text layer left. When it is off, the boxes are only drawn on top, and the hidden text may still be selectable and copyable by anyone who opens the file. Leave it on for anything sensitive.',
      'Matching is not case sensitive by default, so a search for smith also finds Smith and SMITH. Turn on case sensitive matching if you need exact capitalisation. You can also change the box colour, which is black by default. Write each term the way it appears in the document, and add spelling variants as separate terms, because a search for one spelling will not find another. If none of your terms is found anywhere in the file, the tool stops and tells you so rather than returning an unchanged copy that looks as if it had been redacted.',
      'A scanned PDF has no text layer, so nothing can be matched until you run OCR PDF on it. Even then, recognition errors can cause a word to be missed, so open the finished file and check every page yourself. Search for your terms again and try to select text under the boxes. Also look at the file properties, because this tool works on page text. Flatten PDF is a different tool and is not a substitute for redaction.',
    ],
    steps: [
      'Upload the PDF that contains the information to hide.',
      'Type the words or phrases to redact, separated by commas or new lines.',
      'Keep rasterize on, and set case matching and box colour as needed.',
      'Run the tool, then open the result and check every page.',
    ],
    faqs: [
      { q: 'Is the hidden text really gone?', a: 'With rasterize on, the pages become images, so no text layer remains for the covered words. With rasterize off, the text may still be copyable under the boxes. After running, try selecting and searching the file to confirm.' },
      { q: 'Why did the tool say nothing matched?', a: 'The search found none of your terms in the page text. Check the spelling and the case setting, and if the PDF is a scan, run OCR PDF first because a scan has no text to search.' },
      { q: 'Will the result still be searchable?', a: 'With rasterize on, the pages are images, so the file is no longer searchable or selectable. Run OCR PDF on the result if you need a text layer again, and keep the boxes in place since they are part of the image.' },
      uploadFaq('Redact PDF'),
    ],
    keywords: ['redact pdf online', 'black out text in pdf', 'remove sensitive text from pdf', 'pdf redaction tool', 'hide text in pdf'],
  },

  'repair-pdf': {
    metaTitle: 'Repair PDF Online Free - Fix Broken PDFs',
    metaDescription: 'Try to fix a PDF that will not open or shows errors. The tool rebuilds the file structure, or renders readable pages as images. Free.',
    h1: 'Repair a Damaged PDF',
    h2s: ['How the repair works', 'The image fallback', 'What repair cannot do', 'Check the result before deleting the original'],
    paragraphs: [
      'A PDF can become unreadable after an interrupted download, a failed save, a bad email attachment or a faulty export. This tool makes two attempts to recover it. First it loads the file and saves it again with the internal structure rebuilt. When the damage is limited to the index that tells viewers where each page is stored, this clean re-save can be enough, and the text and layout stay as they were.',
      'If the first attempt fails, the tool falls back to a second method. It renders every page it can still read and puts those pictures together into a new PDF. You get a working file with the readable pages, but because each page is now an image, the text can no longer be selected, searched or copied. Run OCR PDF on the repaired file to get a text layer back. There are no options to set, so the tool chooses the method for you.',
      'Repair cannot bring back data that is truly gone. If part of the file was cut off, pages or images inside that part are lost, and no tool can recreate them. Pages that cannot be read at all are left out of the fallback result. A file that is not a PDF in the first place, such as a renamed document, will not be fixed. Expect the best results when the file is mostly intact and only its structure is damaged.',
      'Always keep the original file and compare the repaired one with it. Check that the page count matches any other copy you have and scroll through every page, since a missing page is easy to overlook. If the result is large because it fell back to images, Compress PDF can reduce the size. If your PDF opens but has odd annotations or form fields, Flatten PDF may be the better tool.',
    ],
    steps: [
      'Upload the PDF that will not open or shows errors.',
      'Run the tool and let it try the structure rebuild first.',
      'Download the repaired PDF and open it in your viewer.',
      'Check the page count and scroll through every page before deleting the original.',
    ],
    faqs: [
      { q: 'Why can I not select text in the repaired file?', a: 'The tool probably used its fallback, which turns each readable page into an image. Run OCR PDF on the result to add a text layer.' },
      { q: 'Can it recover pages that are missing?', a: 'No. Repair rebuilds the structure and renders what is still readable, but it cannot restore content that was lost from the file.' },
      { q: 'Does repair change my original file?', a: 'No. You download a new file and your original stays on your device untouched, so keep it until you have checked the result.' },
      uploadFaq('Repair PDF'),
    ],
    keywords: ['repair pdf online', 'fix corrupted pdf', 'recover damaged pdf', 'pdf will not open', 'fix broken pdf free'],
  },
};
