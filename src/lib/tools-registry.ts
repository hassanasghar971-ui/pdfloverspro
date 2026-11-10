// src/lib/tools-registry.ts
/* ============================================================================
 * PDF Lovers Pro: tools registry
 * Single source of truth for all 42 tools: metadata, options, SEO copy, JSON-LD.
 * The universal runner (src/app/tools/[slug]/page.tsx) and the engine
 * (src/lib/pdf-engine.ts) are both driven entirely from this file.
 * ========================================================================== */

import { TOOL_CONTENT } from './tool-content';
import { SITE_URL } from './site-url';

/* --------------------------------- Types ---------------------------------- */

export type OptionValue = string | number | boolean;

export type ToolOptionType =
  | 'text'
  | 'number'
  | 'select'
  | 'range'
  | 'password'
  | 'color'
  | 'checkbox'
  | 'signature';

export interface ToolOptionChoice {
  value: string;
  label: string;
}

export interface ToolOption {
  key: string;
  label: string;
  type: ToolOptionType;
  default: OptionValue;
  required?: boolean;
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  choices?: ToolOptionChoice[];
  showWhen?: { key: string; equals: OptionValue };
}

export type CategoryId =
  | 'organize'
  | 'optimize'
  | 'to-pdf'
  | 'from-pdf'
  | 'edit'
  | 'security'
  | 'analyze';

export interface Category {
  id: CategoryId;
  name: string;
  label: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  icon: string;
  accept: string[];
  output: string;
  multiple: boolean;
  minFiles: number;
  maxFiles: number;
  fileLabels?: string[];
  options: ToolOption[];
  url: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  paragraphs: string[];
  steps: string[];
  faqs: FaqItem[];
  keywords: string[];
  related: string[];
}

/* ---------------------------------- Site ---------------------------------- */

export const SITE = {
  name: 'PDF Lovers Pro',
  shortName: 'PDF Lovers',
  url: SITE_URL,
  tagline: 'Free, private PDF tools that run entirely in your browser',
  description:
    'PDF Lovers Pro offers 42 free PDF tools (merge, split, compress, convert, edit, sign, OCR and more) that run 100% in your browser. Files are processed in your browser, not uploaded to our servers.',
  founder: 'Hassan Asghar',
  founderTitle: 'Lead Architect & Founder',
  email: 'hassanasghar7868686@gmail.com',
  whatsappPrimary: '03451098607',
  whatsappPrimaryLink: 'https://wa.me/923451098607',
  whatsappSecondary: '03497726469',
  whatsappSecondaryLink: 'https://wa.me/923497726469',
  whatsapp: [
    { label: 'WhatsApp (primary)', number: '03451098607', link: 'https://wa.me/923451098607' },
    { label: 'WhatsApp (secondary)', number: '03497726469', link: 'https://wa.me/923497726469' },
  ],
  googleVerification: 'pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI',
} as const;

export interface LegalPageInfo {
  slug: string;
  path: string;
  url: string;
  title: string;
  label: string;
  description: string;
}

const legal = (slug: string, title: string, description: string): LegalPageInfo => ({
  slug,
  path: `/${slug}`,
  url: `${SITE.url}/${slug}`,
  title,
  label: title,
  description,
});

export const LEGAL_PAGES: LegalPageInfo[] = [
  legal('privacy-policy', 'Privacy Policy', 'How PDF Lovers Pro handles your files, data, cookies and advertising.'),
  legal('terms-and-conditions', 'Terms & Conditions', 'The rules for using PDF Lovers Pro and its free PDF tools.'),
  legal('dmca-notice', 'DMCA Notice', 'How to report copyright concerns related to PDF Lovers Pro.'),
  legal('about-us', 'About Us', 'Who built PDF Lovers Pro and why it processes everything in your browser.'),
  legal('contact-us', 'Contact Us', 'Reach the PDF Lovers Pro team by email or WhatsApp.'),
];

/* ------------------------------- Categories ------------------------------- */

export const CATEGORY_ORDER: CategoryId[] = [
  'organize',
  'optimize',
  'to-pdf',
  'from-pdf',
  'edit',
  'security',
  'analyze',
];

export const CATEGORIES: Record<CategoryId, Category> = {
  organize: {
    id: 'organize',
    name: 'Organize PDF',
    label: 'Organize PDF',
    description: 'Merge, split, rotate, crop, reorder and resize pages.',
    icon: '🗂️',
  },
  optimize: {
    id: 'optimize',
    name: 'Optimize PDF',
    label: 'Optimize PDF',
    description: 'Shrink, repair, flatten and restyle your documents.',
    icon: '⚡',
  },
  'to-pdf': {
    id: 'to-pdf',
    name: 'Convert to PDF',
    label: 'Convert to PDF',
    description: 'Turn images, Office files and text into PDF.',
    icon: '📥',
  },
  'from-pdf': {
    id: 'from-pdf',
    name: 'Convert from PDF',
    label: 'Convert from PDF',
    description: 'Export PDF pages as images, text, Word, Excel or slides.',
    icon: '📤',
  },
  edit: {
    id: 'edit',
    name: 'Edit PDF',
    label: 'Edit PDF',
    description: 'Watermark, number, sign, stamp and overlay your pages.',
    icon: '✏️',
  },
  security: {
    id: 'security',
    name: 'PDF Security',
    label: 'PDF Security',
    description: 'Protect, unlock and permanently redact documents.',
    icon: '🔒',
  },
  analyze: {
    id: 'analyze',
    name: 'Analyze & Extract',
    label: 'Analyze & Extract',
    description: 'Compare files and pull out images and fonts.',
    icon: '🔍',
  },
};

/* ------------------------------ Small helpers ----------------------------- */

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

type Extra = Partial<Omit<ToolOption, 'key' | 'label' | 'type' | 'default'>>;

const toChoices = (c: ReadonlyArray<readonly [string, string]>): ToolOptionChoice[] =>
  c.map(([value, label]) => ({ value, label }));

const optSelect = (
  key: string,
  label: string,
  def: string,
  choices: ReadonlyArray<readonly [string, string]>,
  extra: Extra = {},
): ToolOption => ({ key, label, type: 'select', default: def, choices: toChoices(choices), ...extra });

const optText = (key: string, label: string, def = '', extra: Extra = {}): ToolOption => ({
  key,
  label,
  type: 'text',
  default: def,
  ...extra,
});

const optNumber = (
  key: string,
  label: string,
  def: number,
  min: number,
  max: number,
  extra: Extra = {},
): ToolOption => ({ key, label, type: 'number', default: def, min, max, ...extra });

const optRange = (
  key: string,
  label: string,
  def: number,
  min: number,
  max: number,
  step = 1,
  extra: Extra = {},
): ToolOption => ({ key, label, type: 'range', default: def, min, max, step, ...extra });

const optCheck = (key: string, label: string, def: boolean, extra: Extra = {}): ToolOption => ({
  key,
  label,
  type: 'checkbox',
  default: def,
  ...extra,
});

const optPassword = (key: string, label: string, extra: Extra = {}): ToolOption => ({
  key,
  label,
  type: 'password',
  default: '',
  required: true,
  ...extra,
});

const optColor = (key: string, label: string, def: string, extra: Extra = {}): ToolOption => ({
  key,
  label,
  type: 'color',
  default: def,
  ...extra,
});

/* Shared option fragments */

const PAGES_OPT = optText('pages', 'Pages', '', {
  placeholder: 'All pages, or e.g. 1-3, 5, 8-10',
  help: 'Leave empty to apply to every page.',
});

const POS6: ReadonlyArray<readonly [string, string]> = [
  ['bottom-center', 'Bottom center'],
  ['bottom-right', 'Bottom right'],
  ['bottom-left', 'Bottom left'],
  ['top-center', 'Top center'],
  ['top-right', 'Top right'],
  ['top-left', 'Top left'],
];

const SCALE_CHOICES: ReadonlyArray<readonly [string, string]> = [
  ['1', '1x (smaller, faster)'],
  ['1.5', '1.5x (balanced)'],
  ['2', '2x (sharper)'],
  ['3', '3x (largest)'],
];

const PAGE_SIZE_IMG: ReadonlyArray<readonly [string, string]> = [
  ['fit', 'Fit to image'],
  ['a4', 'A4'],
  ['letter', 'US Letter'],
  ['legal', 'US Legal'],
  ['a3', 'A3'],
  ['a5', 'A5'],
];

const PAGE_SIZE_DOC: ReadonlyArray<readonly [string, string]> = [
  ['a4', 'A4'],
  ['letter', 'US Letter'],
];

const ORIENT_AUTO: ReadonlyArray<readonly [string, string]> = [
  ['auto', 'Automatic'],
  ['portrait', 'Portrait'],
  ['landscape', 'Landscape'],
];

/* ------------------------------ Tool specs -------------------------------- */

interface Spec {
  slug: string;
  name: string;
  cat: CategoryId;
  icon: string;
  accept: readonly string[];
  out: string;
  files?: readonly [number, number];
  labels?: string[];
  opts?: ToolOption[];
  blurb: string;
  kw: readonly [string, string];
  intro: string;
  how: string;
  uses: string;
  tip: string;
  faq: readonly [readonly [string, string], readonly [string, string]];
  rel: readonly [string, string, string];
}

const PDF = ['.pdf'] as const;

const SPECS: Spec[] = [
  /* ------------------------------- Organize ------------------------------- */
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    cat: 'organize',
    icon: '🔗',
    accept: PDF,
    out: 'PDF',
    files: [2, 100],
    blurb: `Combine several PDF files into one document in the order you choose, right in your browser.`,
    kw: ['combine pdf files', 'join pdf'],
    intro: `Merge PDF joins two or more PDF files into a single document without sending any of them to a server. Drop your files in, arrange them in the order you want the pages to appear, and the tool stitches them together while keeping each original page exactly as it was.`,
    how: `Each file is read inside your browser and its pages are copied one by one into a new document, following the order shown in the list. You can drag rows or use the arrow buttons to reorder them, and the final file contains every page of every input.`,
    uses: `People merge PDFs to bundle invoices into one monthly statement, attach scanned receipts to an expense report, combine chapters of a thesis, or put a cover letter, CV and certificates into one tidy job application that is easy to send.`,
    tip: `Set the order before you press merge. Bookmarks and form fields from the originals are not carried into the combined file, and changing the order afterwards means running the tool again.`,
    faq: [
      [`How many files can I merge?`, `You can combine between two and one hundred PDF files at once, as long as each file is under 250 MB and your device has enough memory.`],
      [`Will the merged PDF keep my page order?`, `Yes. Pages follow the order of the files in the list, and each file keeps its own internal page order.`],
    ],
    rel: ['split-pdf', 'compress-pdf', 'extract-pages'],
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    cat: 'organize',
    icon: '✂️',
    accept: PDF,
    out: 'PDF files (ZIP)',
    opts: [
      optSelect('mode', 'Split mode', 'ranges', [
        ['ranges', 'By page ranges'],
        ['every-n', 'Every N pages'],
        ['each', 'Every page separately'],
      ]),
      optText('ranges', 'Page ranges', '1-3, 4-6', {
        placeholder: 'e.g. 1-3, 4-6, 7',
        help: 'Each comma-separated group becomes its own PDF.',
        showWhen: { key: 'mode', equals: 'ranges' },
      }),
      optNumber('n', 'Pages per file', 2, 1, 500, { showWhen: { key: 'mode', equals: 'every-n' } }),
    ],
    blurb: `Split a PDF into separate files by page ranges, fixed chunks or one file per page.`,
    kw: ['separate pdf pages', 'split pdf by page'],
    intro: `Split PDF cuts one large document into smaller files. You can define exact page ranges, break the file into equal chunks, or save every page as its own PDF. Several results are delivered together in a single ZIP so nothing gets lost.`,
    how: `The tool opens your document locally, copies the pages that belong to each group into new PDF files, and packs them into an archive. Ranges are written the way you would type them in a print dialog, such as 1-3, 4-6, 7.`,
    uses: `Split a scanned book into chapters, pull a signed page out of a contract, send each employee only their own payslip from a combined file, or break a huge report into parts small enough to attach to an email.`,
    tip: `Check the page count first and keep ranges inside it. Splitting drops bookmarks and interactive form fields from the pieces, so export those separately if you still need them.`,
    faq: [
      [`Can I split every page into its own file?`, `Yes. Choose the option to split every page separately and you will receive one PDF per page, bundled into a ZIP.`],
      [`What happens if my ranges overlap?`, `Overlapping ranges are allowed. A page that appears in two groups is simply copied into both files.`],
    ],
    rel: ['merge-pdf', 'extract-pages', 'delete-pages'],
  },
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    cat: 'organize',
    icon: '🔄',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('angle', 'Rotation', '90', [
        ['90', '90° clockwise'],
        ['180', '180°'],
        ['270', '90° counter-clockwise'],
      ]),
      PAGES_OPT,
    ],
    blurb: `Rotate all or selected PDF pages by 90, 180 or 270 degrees and save the corrected file.`,
    kw: ['turn pdf pages', 'fix sideways pdf'],
    intro: `Rotate PDF fixes pages that were scanned sideways or upside down. Choose a quarter turn or a half turn, apply it to the whole document or only to selected pages, and download a file that opens the right way up everywhere.`,
    how: `Rotation is stored as a page property rather than by redrawing the content, so text, images and quality are untouched. The turn you choose is added to any rotation the page already has, which means repeating the tool keeps turning it further.`,
    uses: `It is handy after scanning a stack of paper where a few sheets went through the feeder sideways, when a landscape table sits on a portrait report, or when a phone camera app saved receipts with the wrong orientation.`,
    tip: `Use the page field to target only the wrong pages, for example 3, 7-9, and leave it empty to turn the whole file. Viewers that ignore page rotation are rare, but check the result in yours.`,
    faq: [
      [`Does rotating reduce quality?`, `No. Only the page rotation value changes, so the text and images inside the page are not re-rendered or recompressed.`],
      [`Can I rotate just one page?`, `Yes. Type the page number or range in the pages field and only those pages are rotated.`],
    ],
    rel: ['crop-pdf', 'resize-pdf', 'delete-pages'],
  },
  {
    slug: 'crop-pdf',
    name: 'Crop PDF',
    cat: 'organize',
    icon: '📐',
    accept: PDF,
    out: 'PDF',
    opts: [
      optNumber('top', 'Crop top (%)', 5, 0, 45, { step: 0.5 }),
      optNumber('right', 'Crop right (%)', 5, 0, 45, { step: 0.5 }),
      optNumber('bottom', 'Crop bottom (%)', 5, 0, 45, { step: 0.5 }),
      optNumber('left', 'Crop left (%)', 5, 0, 45, { step: 0.5 }),
      PAGES_OPT,
    ],
    blurb: `Trim margins from PDF pages by percentage on each side to remove borders and empty space.`,
    kw: ['trim pdf margins', 'cut pdf pages'],
    intro: `Crop PDF trims the edges of your pages. Enter how much to remove from the top, right, bottom and left as a percentage of the page, and the visible area shrinks to what remains. It is a quick way to lose scanner borders and wide margins.`,
    how: `The tool sets the page crop and trim boxes to the smaller area, which is what viewers use to decide what to show. The original content is not deleted, only hidden, so the file size usually stays about the same.`,
    uses: `Remove black scanner edges, cut away headers and footers before presenting a slide, make a wide-margin article fit a small screen better, or tighten up a diagram so it can be dropped into a document.`,
    tip: `Because cropping only hides content, do not use it to remove confidential material. Use the redact tool with rasterizing for that. Keep percentages modest, since each side can remove at most 45 percent.`,
    faq: [
      [`Does cropping permanently delete the outside area?`, `No. The area is hidden by the page boxes. Someone with PDF editing software could restore it, so never rely on cropping for secrecy.`],
      [`Can I crop only some pages?`, `Yes. Enter a page list in the pages field and the other pages are left exactly as they were.`],
    ],
    rel: ['resize-pdf', 'rotate-pdf', 'redact-pdf'],
  },
  {
    slug: 'extract-pages',
    name: 'Extract Pages',
    cat: 'organize',
    icon: '📑',
    accept: PDF,
    out: 'PDF',
    opts: [
      optText('pages', 'Pages to extract', '', {
        required: true,
        placeholder: 'e.g. 1-3, 5, 8-10',
        help: 'Pages are copied into a new PDF in the order you list them.',
      }),
    ],
    blurb: `Pull selected pages out of a PDF and save them as a new, smaller document.`,
    kw: ['select pdf pages', 'save specific pages'],
    intro: `Extract Pages lets you keep only the pages you need. Type a list such as 1-3, 5, 9 and the tool builds a new PDF containing just those pages, leaving your original file untouched on your device.`,
    how: `The selected pages are copied from the source into a fresh document in the order you typed them, so 5, 1, 3 produces a file that starts with page five. Page numbers beyond the end of the file are reported as an error rather than ignored.`,
    uses: `Share one chapter of a long manual, send only the signature page of an agreement, pick the pages you want to print, or build a short handout from a larger presentation without opening an editor.`,
    tip: `Repeating a page number repeats the page, which can be useful for duplicating a form. Bookmarks and form fields are not carried into the new file, so flatten or re-create them if you need them.`,
    faq: [
      [`Can I reorder pages while extracting?`, `Yes. Pages appear in the output in the order you list them, so you can use this tool to reorder a short selection.`],
      [`Is my original file changed?`, `No. A new file is created and your original is never modified or uploaded anywhere.`],
    ],
    rel: ['delete-pages', 'split-pdf', 'merge-pdf'],
  },
  {
    slug: 'delete-pages',
    name: 'Delete Pages',
    cat: 'organize',
    icon: '🗑️',
    accept: PDF,
    out: 'PDF',
    opts: [
      optText('pages', 'Pages to delete', '', {
        required: true,
        placeholder: 'e.g. 2, 4-6',
        help: 'All other pages are kept in their original order.',
      }),
    ],
    blurb: `Remove unwanted pages from a PDF and download the cleaned-up document.`,
    kw: ['remove pdf pages', 'cut pages from pdf'],
    intro: `Delete Pages removes the pages you do not want and keeps everything else. Enter the page numbers or ranges to drop, and you get a clean copy of the document without them, while the original file stays safely on your device.`,
    how: `The tool works out which pages are left after your selection and copies them, in their original order, into a new file. If you try to delete every page it stops with a message instead of producing an empty document.`,
    uses: `Take out blank pages left by a duplex scanner, remove a cover sheet before sharing, drop confidential appendices from a report you are forwarding, or trim an ebook down to the part you actually need.`,
    tip: `Look at the document in your viewer first so you are sure which page numbers to type. Deleting pages also drops bookmarks and interactive form fields, so keep a copy of the original.`,
    faq: [
      [`Can I delete several ranges at once?`, `Yes. Separate them with commas, for example 1, 4-6, 12, and every page in those groups is removed.`],
      [`Can I undo a deletion?`, `Your original file is never changed, so you can always run the tool again with a different selection.`],
    ],
    rel: ['extract-pages', 'split-pdf', 'merge-pdf'],
  },
  {
    slug: 'resize-pdf',
    name: 'Resize PDF',
    cat: 'organize',
    icon: '📏',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('size', 'Page size', 'a4', [
        ['a3', 'A3'],
        ['a4', 'A4'],
        ['a5', 'A5'],
        ['a6', 'A6'],
        ['letter', 'US Letter'],
        ['legal', 'US Legal'],
        ['tabloid', 'Tabloid'],
        ['executive', 'Executive'],
      ]),
      optCheck('scaleContent', 'Scale content to fit the new size', true, {
        help: 'Turn off to place pages at their original size, centered.',
      }),
    ],
    blurb: `Change the page size of a PDF to A4, Letter, A3 and more, scaling the content to fit.`,
    kw: ['change pdf page size', 'convert pdf to a4'],
    intro: `Resize PDF changes every page to a standard paper size such as A4, US Letter or A3. The content is scaled to fit and centered, so a document made for one country prints neatly on the paper used in another.`,
    how: `Each original page is drawn onto a new blank page of the chosen size. When scaling is on, the content shrinks or grows to fit while keeping its proportions. When it is off, the page is placed at its original size in the middle.`,
    uses: `Prepare a Letter document for an A4 printer, enlarge a small flyer to A3, standardize a pile of mixed-size scans before merging them, or fit a wide drawing onto a size your office printer supports.`,
    tip: `Pages are embedded as drawings, so links and interactive form fields on them stop working after resizing. If the aspect ratio differs a lot, expect extra white bands on the sides or at the top and bottom.`,
    faq: [
      [`Will the text stay sharp?`, `Yes. Pages are embedded as vector content, so text and line art stay crisp at the new size.`],
      [`Do links still work after resizing?`, `No. Embedding pages drops clickable links and form fields, which is a limit of this method.`],
    ],
    rel: ['crop-pdf', 'n-up-pdf', 'rotate-pdf'],
  },
  {
    slug: 'n-up-pdf',
    name: 'N-Up PDF',
    cat: 'organize',
    icon: '🔲',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('perSheet', 'Pages per sheet', '4', [
        ['2', '2 pages'],
        ['4', '4 pages'],
        ['6', '6 pages'],
        ['9', '9 pages'],
      ]),
      optSelect('orientation', 'Sheet orientation', 'landscape', [
        ['portrait', 'Portrait'],
        ['landscape', 'Landscape'],
      ]),
      optSelect('pageSize', 'Sheet size', 'a4', [
        ['a4', 'A4'],
        ['letter', 'US Letter'],
        ['a3', 'A3'],
      ]),
      optNumber('gap', 'Gap between pages (pt)', 8, 0, 60),
      optCheck('border', 'Draw a thin border around each page', true),
    ],
    blurb: `Place 2, 4, 6 or 9 PDF pages on a single sheet to save paper when printing handouts.`,
    kw: ['multiple pages per sheet', 'pdf handout maker'],
    intro: `N-Up PDF arranges several pages onto one sheet. Pick two, four, six or nine pages per sheet, choose the paper size and orientation, and the tool lays them out in a tidy grid. It is the classic way to print handouts without wasting paper.`,
    how: `Every source page is scaled to fit its cell in the grid, with an optional gap and thin border. Pages fill the sheet from left to right, then top to bottom, so reading order stays natural for slides and notes.`,
    uses: `Print lecture slides six to a page, make a compact proof sheet of a long document, review the flow of a brochure at a glance, or cut the number of sheets in a draft you only need for markup.`,
    tip: `Landscape sheets suit slides, while portrait sheets suit text pages. Pages are embedded as drawings, so links and form fields on them are lost. Nine per sheet makes small text hard to read, so test with four first.`,
    faq: [
      [`In what order are the pages placed?`, `Pages fill each sheet from left to right and then top to bottom, in the same order as the original document.`],
      [`Can I remove the borders?`, `Yes. Untick the border option and the pages are placed with only the gap between them.`],
    ],
    rel: ['resize-pdf', 'compress-pdf', 'merge-pdf'],
  },

  /* ------------------------------- Optimize ------------------------------- */
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    cat: 'optimize',
    icon: '🗜️',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('level', 'Compression level', 'medium', [
        ['low', 'Low (lossless, keeps text selectable)'],
        ['medium', 'Medium (balanced, pages become images)'],
        ['high', 'High (smallest, pages become images)'],
      ]),
    ],
    blurb: `Reduce PDF file size for email and uploads with lossless or image-based compression.`,
    kw: ['reduce pdf size', 'shrink pdf'],
    intro: `Compress PDF makes your document smaller so it fits email limits and upload forms. Choose a gentle lossless clean-up that keeps text selectable, or a stronger mode that rebuilds each page as an optimized image for a much smaller file.`,
    how: `Low mode rewrites the file structure and packs objects more efficiently without touching content. Medium and high render each page and save it as a compressed JPEG inside a new PDF, trading text selectability for size.`,
    uses: `Squeeze a scan below a ten megabyte attachment limit, shrink a photo-heavy brochure for a website download, or reduce the size of a bundle of statements before uploading them to a government portal.`,
    tip: `Start with low and compare the size. Only move to medium or high if you need more, because those modes make text non-selectable and unsearchable. Files that are already well compressed may barely change.`,
    faq: [
      [`Which level should I choose?`, `Try low first because it keeps text selectable. Use medium or high when you need a much smaller file and do not need to select or search the text.`],
      [`Can compression make a file bigger?`, `Occasionally, for files that are already optimized. If the result is larger than your original, keep the original.`],
    ],
    rel: ['grayscale-pdf', 'merge-pdf', 'repair-pdf'],
  },
  {
    slug: 'repair-pdf',
    name: 'Repair PDF',
    cat: 'optimize',
    icon: '🛠️',
    accept: PDF,
    out: 'PDF',
    blurb: `Try to recover a damaged or corrupted PDF by rebuilding its structure, with an image-based fallback.`,
    kw: ['fix corrupted pdf', 'recover pdf'],
    intro: `Repair PDF attempts to rescue documents that refuse to open or show errors in your viewer. It reads the file as leniently as it can and writes a clean, well-formed copy, which fixes many broken cross-reference tables and truncated structures.`,
    how: `First the tool tries to reload and re-save the document with its structure rebuilt. If that fails, it falls back to rendering whatever pages can still be read and assembling them into a new PDF made of page images.`,
    uses: `Recover a file that stopped downloading halfway, open an attachment an email system damaged, rescue a document from a failing drive, or fix a PDF that one viewer opens and another rejects.`,
    tip: `No tool can restore data that is truly missing, so expect partial results from badly damaged files. If the fallback is used, text in the result is not selectable. Always keep the original and compare the page count.`,
    faq: [
      [`Can it recover every damaged PDF?`, `No. It handles common structural damage, but missing data cannot be recreated and some files are beyond repair.`],
      [`Why is the repaired text not selectable?`, `That happens when the fallback mode is used. Pages are rebuilt as images, which preserves the look but not the text layer.`],
    ],
    rel: ['compress-pdf', 'flatten-pdf', 'ocr-pdf'],
  },
  {
    slug: 'flatten-pdf',
    name: 'Flatten PDF',
    cat: 'optimize',
    icon: '🧱',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('mode', 'Flatten mode', 'forms', [
        ['forms', 'Form fields only (keeps text)'],
        ['full', 'Full (everything becomes an image)'],
      ]),
      optSelect('scale', 'Image quality', '2', SCALE_CHOICES, { showWhen: { key: 'mode', equals: 'full' } }),
    ],
    blurb: `Flatten PDF form fields or whole pages so filled-in content can no longer be edited.`,
    kw: ['make pdf uneditable', 'flatten pdf forms'],
    intro: `Flatten PDF turns interactive content into fixed page content. Fill in a form, flatten it, and the answers become part of the page so nobody can change them. A full mode goes further and turns the entire page into a picture.`,
    how: `Forms mode draws every field's current value onto the page and removes the field, so text elsewhere stays selectable. Full mode renders each page to an image and rebuilds the document from those images at the quality you select.`,
    uses: `Lock a completed application before sending it, make sure a form looks the same in every viewer, remove editable layers from a design proof, or archive a filled contract in a form that cannot be altered by accident.`,
    tip: `Choose forms mode unless you need maximum protection against editing. Full mode makes text non-selectable and the file larger, but it also prevents copying text out. Flattening cannot be reversed, so keep an editable copy.`,
    faq: [
      [`What is the difference between the two modes?`, `Forms mode only converts form fields to static content. Full mode turns every page into an image, which also locks text and graphics.`],
      [`Can I make flattened forms editable again?`, `No. Flattening is permanent for that file, so keep your editable original.`],
    ],
    rel: ['protect-pdf', 'remove-annotations', 'compress-pdf'],
  },
  {
    slug: 'grayscale-pdf',
    name: 'Grayscale PDF',
    cat: 'optimize',
    icon: '⚫',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('scale', 'Render scale', '1.5', SCALE_CHOICES),
      optRange('quality', 'JPEG quality', 80, 40, 95, 1),
    ],
    blurb: `Convert a colour PDF to black and white tones to save ink and shrink the file.`,
    kw: ['pdf to black and white', 'convert pdf to grayscale'],
    intro: `Grayscale PDF converts every page of a colour document to shades of grey. It is ideal for printing on a monochrome printer, saving ink, or producing a smaller file when colour carries no meaning.`,
    how: `Each page is rendered in your browser, its colours are converted to luminance, and the result is saved as a compressed image inside a new PDF. Higher scale and quality settings keep more detail but give a larger file.`,
    uses: `Print a report cheaply, prepare scanned forms for fax-style submission, reduce the size of a photo-rich brochure, or check how a colourful design reads when colour is removed entirely.`,
    tip: `Because pages become images, text is no longer selectable or searchable, so keep your original if you need that. A render scale of 1.5 with quality around 80 is a good balance for office documents.`,
    faq: [
      [`Will the text still be selectable?`, `No. Pages are rebuilt as images, so text is not selectable or searchable in the grayscale result.`],
      [`Does grayscale reduce file size?`, `Often, yes, but the biggest saving comes from the scale and quality settings you choose.`],
    ],
    rel: ['invert-pdf-colors', 'compress-pdf', 'flatten-pdf'],
  },
  {
    slug: 'invert-pdf-colors',
    name: 'Invert PDF Colors',
    cat: 'optimize',
    icon: '🌓',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('scale', 'Render scale', '1.5', SCALE_CHOICES),
      optRange('quality', 'JPEG quality', 80, 40, 95, 1),
    ],
    blurb: `Invert PDF colours to create a dark-mode version that is easier on the eyes at night.`,
    kw: ['pdf dark mode', 'negative pdf'],
    intro: `Invert PDF Colors flips every colour on every page, turning white backgrounds black and black text white. The result is a dark-mode copy that is more comfortable to read on a screen in a dim room.`,
    how: `Pages are rendered in your browser, each pixel is replaced by its opposite colour, and the inverted images are assembled into a new PDF. Scale controls sharpness and quality controls the compression applied to each page.`,
    uses: `Read long papers at night without glare, convert a scanned white-on-black diagram into black-on-white, or save ink on a document with heavy dark backgrounds by reversing it before printing.`,
    tip: `Photos will look like negatives, which is expected. Pages become images, so text is no longer selectable. If you only need dark mode on screen, your viewer's night theme may be a better choice than a new file.`,
    faq: [
      [`Why do the pictures look strange?`, `Inversion reverses every colour, so photos look like film negatives. That is how the effect works.`],
      [`Can I get the original colours back?`, `Run the tool on the inverted file to flip it again, though a little quality is lost each time. Keeping the original is better.`],
    ],
    rel: ['grayscale-pdf', 'compress-pdf', 'flatten-pdf'],
  },
  {
    slug: 'remove-annotations',
    name: 'Remove Annotations',
    cat: 'optimize',
    icon: '🧹',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('mode', 'What to remove', 'all', [
        ['all', 'All annotations (keeps form fields)'],
        ['markup', 'Markup only (highlights, notes, drawings)'],
        ['links', 'Links only'],
      ]),
    ],
    blurb: `Strip comments, highlights, sticky notes and links from a PDF to produce a clean copy.`,
    kw: ['remove pdf comments', 'delete highlights from pdf'],
    intro: `Remove Annotations strips review marks from a document. Clear highlights, sticky notes, pen drawings and comments in one go, or remove only the clickable links, and share a clean version that carries none of the feedback.`,
    how: `The tool walks through each page's annotation list and deletes the entries that match your choice. Form fields are always kept, because they are part of the document rather than review marks, and page content is not redrawn.`,
    uses: `Send a final copy after a review round, remove stray highlights from a textbook before printing, strip tracking links from a newsletter PDF, or clean up a shared file before archiving it.`,
    tip: `Choose markup if you want to keep links working. Annotations that were flattened into the page are part of the content and cannot be removed this way. Review the result before sending it on.`,
    faq: [
      [`Are form fields removed too?`, `No. Form fields are kept in every mode. Use the flatten tool if you want to turn them into fixed content.`],
      [`Can it remove marks that were burned into the page?`, `No. Only real annotation objects are removed, not marks that were already merged into the page content.`],
    ],
    rel: ['flatten-pdf', 'redact-pdf', 'compress-pdf'],
  },

  /* -------------------------------- To PDF -------------------------------- */
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    cat: 'to-pdf',
    icon: '🖼️',
    accept: ['.jpg', '.jpeg'],
    out: 'PDF',
    files: [1, 200],
    opts: [
      optSelect('pageSize', 'Page size', 'a4', PAGE_SIZE_IMG),
      optSelect('orientation', 'Orientation', 'auto', ORIENT_AUTO),
      optNumber('margin', 'Margin (pt)', 24, 0, 144),
    ],
    blurb: `Convert one or many JPG photos into a single PDF with your choice of page size and margin.`,
    kw: ['jpeg to pdf', 'photos to pdf'],
    intro: `JPG to PDF turns photos and scans into a PDF document. Add one picture or up to two hundred, put them in the order you like, and choose between fitting each page to its image or placing images on standard paper sizes.`,
    how: `Each image becomes one page. JPEG data is embedded directly where possible, so photos are not recompressed and stay sharp. Automatic orientation picks portrait or landscape per image, and margins are measured in points.`,
    uses: `Combine phone photos of receipts into one expense file, turn a set of photographed pages into a shareable document, build a quick portfolio from artwork, or submit ID photos as a single attachment.`,
    tip: `Use the fit option to keep each page exactly the size of its photo, or A4 with a small margin for printing. Sort the list before converting, because the page order follows the order of your files.`,
    faq: [
      [`Are my photos recompressed?`, `JPEG photos are embedded directly where possible, so they keep their original quality inside the PDF.`],
      [`Can I mix portrait and landscape photos?`, `Yes. With automatic orientation each page follows the shape of its own image.`],
    ],
    rel: ['png-to-pdf', 'merge-pdf', 'compress-pdf'],
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    cat: 'to-pdf',
    icon: '🎨',
    accept: ['.png'],
    out: 'PDF',
    files: [1, 200],
    opts: [
      optSelect('pageSize', 'Page size', 'a4', PAGE_SIZE_IMG),
      optSelect('orientation', 'Orientation', 'auto', ORIENT_AUTO),
      optNumber('margin', 'Margin (pt)', 24, 0, 144),
    ],
    blurb: `Convert PNG screenshots and graphics into a PDF, keeping transparency and sharp edges.`,
    kw: ['image to pdf', 'screenshot to pdf'],
    intro: `PNG to PDF packs screenshots, diagrams and graphics into a document. Sharp lines and text in your images stay crisp, and you decide whether each page matches the image size or uses a standard paper size with margins.`,
    how: `PNG files are embedded without lossy recompression, so edges stay clean. Each image occupies its own page, scaled to fit inside the margins you set, and the pages follow the order shown in your file list.`,
    uses: `Collect screenshots into a bug report, turn exported slides into a printable handout, bundle scanned signatures and stamps, or create a PDF version of a design mockup to send to a client.`,
    tip: `Very large PNGs can use a lot of memory, so convert big batches in smaller groups if your device slows down. Use the fit page size to avoid white borders around screenshots.`,
    faq: [
      [`Is PNG transparency kept?`, `Transparent areas are preserved in the PDF and appear as the page background, which is normally white.`],
      [`How many images can I convert at once?`, `Up to two hundred images per run, as long as your device has enough memory for them.`],
    ],
    rel: ['jpg-to-pdf', 'merge-pdf', 'compress-pdf'],
  },
  {
    slug: 'txt-to-pdf',
    name: 'Text to PDF',
    cat: 'to-pdf',
    icon: '📝',
    accept: ['.txt'],
    out: 'PDF',
    files: [1, 50],
    opts: [
      optSelect('font', 'Font', 'helvetica', [
        ['helvetica', 'Helvetica (sans-serif)'],
        ['times', 'Times (serif)'],
        ['courier', 'Courier (monospace)'],
      ]),
      optNumber('fontSize', 'Font size (pt)', 12, 6, 36),
      optSelect('pageSize', 'Page size', 'a4', PAGE_SIZE_DOC),
    ],
    blurb: `Turn plain text files into a neatly paginated PDF with your choice of font and page size.`,
    kw: ['txt to pdf converter', 'notes to pdf'],
    intro: `Text to PDF converts plain text files into a readable document. Choose a font, a size and a paper format, and long lines are wrapped and paginated for you. Several files can be combined into one PDF in a single step.`,
    how: `The text is decoded in your browser, wrapped to the page width and laid out page by page with consistent margins. When you add several files they are joined in the listed order with a page break between them.`,
    uses: `Archive log files and notes in a stable format, print code listings in a monospace font, turn a draft written in a simple editor into a shareable file, or collect several text files into one reading copy.`,
    tip: `The built-in fonts cover Latin characters only. Other scripts need a Unicode font file at /fonts/NotoSans-Regular.ttf on your site, otherwise unsupported characters show as question marks.`,
    faq: [
      [`Can I convert several text files together?`, `Yes. Add up to fifty files and they are joined into one PDF in the order listed, with a page break between files.`],
      [`Why do some characters appear as question marks?`, `The standard fonts only support Latin characters. Other scripts need a Unicode font to be available on the site.`],
    ],
    rel: ['pdf-to-txt', 'rtf-to-pdf', 'word-to-pdf'],
  },
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    cat: 'to-pdf',
    icon: '📘',
    accept: ['.docx'],
    out: 'PDF',
    opts: [optSelect('pageSize', 'Page size', 'a4', PAGE_SIZE_DOC)],
    blurb: `Convert DOCX documents to PDF in your browser, keeping headings, lists, tables and images.`,
    kw: ['docx to pdf', 'convert word document to pdf'],
    intro: `Word to PDF converts a DOCX file into a PDF you can share with confidence. Headings, paragraphs, lists, tables and embedded pictures are carried over, and the finished file opens the same way on every device.`,
    how: `The document is read by a converter running in your browser, turned into structured content, and typeset onto pages of the size you select. Because a browser cannot run Microsoft Word, layout is content-centric rather than pixel-identical.`,
    uses: `Send a CV or report that the recipient cannot accidentally edit, prepare an assignment for an upload portal that wants PDF, or create an archive copy of a letter without installing office software.`,
    tip: `Complex layouts such as text boxes, columns, headers and exotic fonts may look different from Word. Check the result, and use Word's own Save as PDF when exact layout matters. Only DOCX files are supported, not the older DOC.`,
    faq: [
      [`Will the PDF look exactly like my Word document?`, `Not always. Content, headings, lists, tables and images are kept, but complex layout and fonts may differ because the conversion runs without Word.`],
      [`Does it support old .doc files?`, `No. Open the file in Word or a free office suite and save it as DOCX first.`],
    ],
    rel: ['pdf-to-word', 'rtf-to-pdf', 'txt-to-pdf'],
  },
  {
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    cat: 'to-pdf',
    icon: '📗',
    accept: ['.xlsx', '.xls', '.csv'],
    out: 'PDF',
    opts: [
      optSelect('orientation', 'Orientation', 'landscape', [
        ['landscape', 'Landscape'],
        ['portrait', 'Portrait'],
      ]),
      optSelect('pageSize', 'Page size', 'a4', [
        ['a4', 'A4'],
        ['letter', 'US Letter'],
        ['a3', 'A3'],
      ]),
    ],
    blurb: `Convert Excel and CSV spreadsheets into a printable PDF table, one section per sheet.`,
    kw: ['xlsx to pdf', 'csv to pdf'],
    intro: `Excel to PDF turns spreadsheets into printable documents. Workbooks in XLSX or XLS format and plain CSV files are laid out as clean tables, with each sheet starting on a new page so the structure of your workbook stays easy to follow.`,
    how: `The workbook is parsed in your browser and each sheet's cell values are drawn into a table that wraps to the page width. Values are shown as the cells display them, and each sheet is limited to ten thousand rows.`,
    uses: `Share a price list or budget without exposing formulas, print a data export in a readable form, archive a monthly report, or send a CSV to someone who just wants to read it rather than open a spreadsheet.`,
    tip: `Wide tables fit best on landscape A4 or A3. Formulas appear as their results, and charts, images and cell styling are not reproduced. Check column widths in the output before sending it to anyone.`,
    faq: [
      [`Are formulas and charts included?`, `Cell values are included as shown, but formulas are replaced by their results, and charts and images are not reproduced.`],
      [`Is there a size limit for sheets?`, `Each sheet is limited to ten thousand rows so the browser stays responsive.`],
    ],
    rel: ['pdf-to-excel', 'word-to-pdf', 'ppt-to-pdf'],
  },
  {
    slug: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    cat: 'to-pdf',
    icon: '📙',
    accept: ['.pptx'],
    out: 'PDF',
    blurb: `Convert PPTX presentations into a PDF with one page per slide, showing slide text and pictures.`,
    kw: ['pptx to pdf', 'slides to pdf'],
    intro: `PowerPoint to PDF turns a PPTX presentation into a document with one page per slide. The text and pictures on each slide are extracted and laid out in order, giving you a lightweight copy that is easy to read and share.`,
    how: `A PPTX file is a package of XML and media files. The tool opens that package in your browser, reads each slide's text and images, and typesets them onto pages. It does not run PowerPoint, so animations and theme styling are not reproduced.`,
    uses: `Send lecture notes to students, share a deck for review on devices without office software, create a text-first handout, or archive the content of a presentation in a stable, searchable form.`,
    tip: `Expect a content-focused result rather than a pixel-perfect copy of your design. For exact slide appearance, use PowerPoint's own export. Only PPTX files are supported, not the older PPT format.`,
    faq: [
      [`Will my slide design be preserved?`, `Not exactly. Text and pictures are carried over, but themes, animations, transitions and complex shapes are not reproduced.`],
      [`Can I convert an old .ppt file?`, `Not directly. Save it as PPTX in PowerPoint or a free office suite, then convert it here.`],
    ],
    rel: ['pdf-to-ppt', 'word-to-pdf', 'excel-to-pdf'],
  },
  {
    slug: 'rtf-to-pdf',
    name: 'RTF to PDF',
    cat: 'to-pdf',
    icon: '📃',
    accept: ['.rtf'],
    out: 'PDF',
    opts: [optSelect('pageSize', 'Page size', 'a4', PAGE_SIZE_DOC)],
    blurb: `Convert Rich Text Format files into a clean PDF with paragraphs and basic formatting kept.`,
    kw: ['rich text to pdf', 'convert rtf'],
    intro: `RTF to PDF converts Rich Text Format documents into PDF. Paragraphs and basic text structure are read from the file and set onto pages of the size you choose, producing a stable copy that no longer depends on the program that created it.`,
    how: `The tool decodes the RTF control words in your browser, extracts the readable text and paragraph breaks, and typesets it with consistent margins. Escaped characters in the Windows-1252 code page are decoded correctly.`,
    uses: `Convert documents saved by older word processors, archive notes exported from legacy software, prepare text from an RTF template for sharing, or turn simple letters into a format any phone can open.`,
    tip: `Complex objects such as embedded images, tables and unusual code pages are not fully supported. Latin text works best, and other scripts need a Unicode font at /fonts/NotoSans-Regular.ttf to display.`,
    faq: [
      [`Is formatting like bold and tables preserved?`, `Text and paragraph structure are preserved. Rich elements such as tables and embedded images are not fully reproduced.`],
      [`Which characters are supported?`, `Latin text, including accented letters from the Windows-1252 code page. Other scripts require a Unicode font on the site.`],
    ],
    rel: ['pdf-to-rtf', 'txt-to-pdf', 'word-to-pdf'],
  },

  /* ------------------------------- From PDF ------------------------------- */
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    cat: 'from-pdf',
    icon: '📸',
    accept: PDF,
    out: 'JPG images (ZIP)',
    opts: [
      optSelect('scale', 'Resolution', '2', [
        ['1', '1x (screen)'],
        ['2', '2x (sharp)'],
        ['3', '3x (print quality)'],
      ]),
      optRange('quality', 'JPEG quality', 85, 40, 100, 1),
      PAGES_OPT,
    ],
    blurb: `Convert PDF pages to high-quality JPG images, all pages or a selection, delivered as a ZIP.`,
    kw: ['pdf to image', 'pdf to jpeg'],
    intro: `PDF to JPG renders your pages as pictures. Choose the resolution and quality, pick all pages or just some, and get a JPG for each page. When there are several pages the images arrive together in one ZIP file.`,
    how: `Each page is drawn onto a canvas by the PDF engine in your browser, then encoded as JPEG at the quality you set. The canvas is cleared as soon as the page is saved, which keeps memory use low even on long documents.`,
    uses: `Post a page of a brochure on social media, insert a PDF page into a slide deck, send a preview image of a contract page, or create thumbnails for a catalogue of documents.`,
    tip: `Use 2x for most screens and 3x for printing. Higher resolution makes bigger files and uses more memory, so for long documents select only the pages you need. Very large pages are scaled down to stay within browser limits.`,
    faq: [
      [`What resolution should I choose?`, `2x suits most uses. Choose 3x when you plan to print the images, and 1x for small previews.`],
      [`Can I convert only some pages?`, `Yes. Enter a page list such as 1-3, 8 in the pages field and only those pages are converted.`],
    ],
    rel: ['pdf-to-png', 'jpg-to-pdf', 'extract-images-pdf'],
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    cat: 'from-pdf',
    icon: '🖼️',
    accept: PDF,
    out: 'PNG images (ZIP)',
    opts: [
      optSelect('scale', 'Resolution', '2', [
        ['1', '1x (screen)'],
        ['2', '2x (sharp)'],
        ['3', '3x (print quality)'],
      ]),
      PAGES_OPT,
    ],
    blurb: `Convert PDF pages to lossless PNG images with crisp text and graphics, bundled in a ZIP.`,
    kw: ['pdf to png converter', 'export pdf pages as images'],
    intro: `PDF to PNG saves your pages as lossless images. Text, line art and logos stay perfectly sharp, which makes PNG the better choice than JPG for documents with fine detail. Multiple pages are delivered in a single ZIP.`,
    how: `Pages are rendered in your browser at the resolution you pick and encoded without lossy compression. Each canvas is purged right after its page is saved, so memory is released step by step rather than at the end.`,
    uses: `Capture diagrams for documentation, extract slides for a presentation, produce crisp images of forms for web pages, or keep pixel-accurate previews of pages that contain small text.`,
    tip: `PNG files are larger than JPG, particularly at 3x for photo-heavy pages. If size matters more than perfect sharpness, use the JPG tool instead. For long files, choose a page range to keep the ZIP manageable.`,
    faq: [
      [`Why choose PNG over JPG?`, `PNG is lossless, so text and line art stay sharp. JPG gives smaller files for photographs.`],
      [`Are pages with transparency supported?`, `Pages are rendered on a white background, so the images are opaque.`],
    ],
    rel: ['pdf-to-jpg', 'png-to-pdf', 'extract-images-pdf'],
  },
  {
    slug: 'pdf-to-txt',
    name: 'PDF to Text',
    cat: 'from-pdf',
    icon: '🔤',
    accept: PDF,
    out: 'TXT',
    blurb: `Extract the text from a PDF into a plain TXT file, page by page, without uploading anything.`,
    kw: ['pdf to text converter', 'extract text from pdf'],
    intro: `PDF to Text pulls the readable text out of a PDF and saves it as a plain TXT file. Lines are rebuilt in reading order and each page is separated, so you can copy, search or process the content in any editor.`,
    how: `The PDF engine reads the text objects on every page, groups characters into lines by their position, and writes the lines out in order. Scanned documents contain no text objects, so they need the OCR tool instead.`,
    uses: `Copy quotes from a report, feed a document into a search or analysis tool, check what a file really contains, or make content accessible to software that cannot read PDF layouts directly.`,
    tip: `Multi-column layouts can come out interleaved, because lines are rebuilt by position. If the result is empty, the PDF is probably a scan, and the OCR PDF tool will recognize its text from images instead.`,
    faq: [
      [`Why is my text file empty?`, `The PDF is probably a scan made of images. Use the OCR PDF tool to recognize text from the page pictures.`],
      [`Is the formatting preserved?`, `Only the text and its line breaks. Fonts, colours and images are not part of a plain text file.`],
    ],
    rel: ['ocr-pdf', 'pdf-to-word', 'txt-to-pdf'],
  },
  {
    slug: 'pdf-to-rtf',
    name: 'PDF to RTF',
    cat: 'from-pdf',
    icon: '🗒️',
    accept: PDF,
    out: 'RTF',
    blurb: `Convert PDF text into an RTF document you can open and edit in almost any word processor.`,
    kw: ['pdf to rich text', 'convert pdf to rtf'],
    intro: `PDF to RTF converts the text of your PDF into Rich Text Format, a widely supported editable format. Open the result in nearly any word processor to revise, reformat or copy the content without retyping it.`,
    how: `Text is read page by page in your browser, lines are rebuilt in reading order, and the content is written as RTF with proper escaping for special characters. Page breaks are kept so the document follows the original structure.`,
    uses: `Edit text from a report you only have as a PDF, move content into software that prefers RTF, prepare quotes for a letter, or recover the wording of a document whose source file has been lost.`,
    tip: `Only text is transferred. Images, exact fonts and complex layouts are not, and multi-column pages may mix their lines. Scanned PDFs have no text to read, so recognize them with the OCR tool first.`,
    faq: [
      [`Will images be included?`, `No. The RTF output contains text only. Use the extract images tool if you need the pictures.`],
      [`Why not Word format?`, `RTF is simpler and opens everywhere. If you prefer DOCX, use the PDF to Word tool.`],
    ],
    rel: ['pdf-to-word', 'pdf-to-txt', 'rtf-to-pdf'],
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    cat: 'from-pdf',
    icon: '📄',
    accept: PDF,
    out: 'DOCX',
    blurb: `Convert PDF text and structure into an editable Word DOCX file without uploading your document.`,
    kw: ['pdf to docx', 'convert pdf to word'],
    intro: `PDF to Word creates an editable DOCX file from your PDF. Headings, paragraphs and text are rebuilt as real Word content, so you can open the result in Word or a free office suite and continue working on it.`,
    how: `The tool reads each page's text, groups it into lines and paragraphs using position and font size, and generates a Word document with page breaks. Because PDFs do not store paragraphs, the structure is inferred rather than recovered.`,
    uses: `Update a price list you only have as PDF, reuse text from a brochure, edit a contract draft, or pull the wording of a report into a document that your team can comment on.`,
    tip: `Expect the text to be correct but the layout to be simplified. Images, tables and multiple columns are not rebuilt exactly. Scanned PDFs have no text, so run the OCR tool first and convert the text output.`,
    faq: [
      [`Will the layout match the PDF?`, `Text is carried over, but layout is simplified. Tables, columns and images are not reproduced exactly.`],
      [`Does it work on scanned documents?`, `Only if they contain real text. For scans, use the OCR PDF tool first to recognize the text.`],
    ],
    rel: ['word-to-pdf', 'pdf-to-rtf', 'pdf-to-txt'],
  },
  {
    slug: 'pdf-to-excel',
    name: 'PDF to Excel',
    cat: 'from-pdf',
    icon: '📊',
    accept: PDF,
    out: 'XLSX',
    blurb: `Move text from PDF pages into an Excel workbook, with one sheet per page and rows kept in order.`,
    kw: ['pdf to xlsx', 'convert pdf table to excel'],
    intro: `PDF to Excel puts the text of your PDF into a spreadsheet. Each page becomes its own sheet, and lines of text are split into cells where the spacing suggests columns, giving you a starting point for tables and lists.`,
    how: `The tool reads the text on every page, groups it into rows by vertical position, and separates cells where there are wide horizontal gaps. The result is written as an XLSX workbook with one sheet per page, up to a hundred and fifty pages.`,
    uses: `Rescue a table from a statement, move a price list into a spreadsheet, check numbers from a report, or collect repeated forms into rows that can be sorted and summed.`,
    tip: `Column detection is a best guess, so tidy the sheet after conversion. Merged cells and ruled lines are not detected. Scanned PDFs contain no text, so use the OCR tool and check the figures manually.`,
    faq: [
      [`Are tables detected perfectly?`, `No. Columns are inferred from spacing, so complex tables may need cleaning in your spreadsheet program.`],
      [`How many pages are supported?`, `Up to a hundred and fifty pages, with each page placed on its own sheet.`],
    ],
    rel: ['excel-to-pdf', 'pdf-to-txt', 'pdf-to-word'],
  },
  {
    slug: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    cat: 'from-pdf',
    icon: '🎞️',
    accept: PDF,
    out: 'PPTX',
    opts: [optSelect('scale', 'Image quality', '1.5', [
      ['1', '1x (smaller file)'],
      ['1.5', '1.5x (balanced)'],
      ['2', '2x (sharper)'],
    ])],
    blurb: `Turn each PDF page into a PowerPoint slide with the page image as the slide background.`,
    kw: ['pdf to pptx', 'pdf to slides'],
    intro: `PDF to PowerPoint turns every page into a slide. Each page is rendered as an image and placed on its own slide, so the look of the original is kept exactly and the deck is ready to present or extend with your own slides.`,
    how: `Pages are rendered in your browser at the quality you choose and inserted into a PPTX file with matching slide proportions. Up to three hundred pages are supported, and each canvas is cleared as soon as its slide is built.`,
    uses: `Present from a PDF in software that expects slides, add your own notes around an exported report, reuse designed pages in a talk, or send reviewers a deck they can annotate in PowerPoint.`,
    tip: `Slides contain images of the pages, so the text on them is not editable in PowerPoint. If you need editable text, use the PDF to Word tool instead. Higher quality settings make bigger decks.`,
    faq: [
      [`Can I edit the text on the slides?`, `No. Each slide holds a picture of the page. For editable text, convert to Word instead.`],
      [`How many pages can I convert?`, `Up to three hundred pages per file.`],
    ],
    rel: ['ppt-to-pdf', 'pdf-to-jpg', 'pdf-to-word'],
  },
  {
    slug: 'ocr-pdf',
    name: 'OCR PDF',
    cat: 'from-pdf',
    icon: '👁️',
    accept: ['.pdf', '.png', '.jpg', '.jpeg'],
    out: 'Searchable PDF or TXT',
    opts: [
      optSelect('language', 'Language', 'eng', [
        ['eng', 'English'],
        ['urd', 'Urdu'],
        ['ara', 'Arabic'],
        ['hin', 'Hindi'],
        ['fra', 'French'],
        ['deu', 'German'],
        ['spa', 'Spanish'],
        ['ita', 'Italian'],
        ['por', 'Portuguese'],
        ['rus', 'Russian'],
        ['tur', 'Turkish'],
      ]),
      optSelect('outputMode', 'Output', 'searchable-pdf', [
        ['searchable-pdf', 'Searchable PDF'],
        ['txt', 'Plain text (TXT)'],
      ]),
      optSelect('scale', 'Scan quality', '2', [
        ['2', '2x (faster)'],
        ['3', '3x (more accurate)'],
      ]),
    ],
    blurb: `Recognize text in scanned PDFs and images, and save a searchable PDF or plain text file.`,
    kw: ['scanned pdf to text', 'make pdf searchable'],
    intro: `OCR PDF reads the text from scanned pages and photos. The recognized words are added as an invisible layer so you can search and copy from the result, or you can export everything as a plain text file instead.`,
    how: `Pages are rendered in your browser and passed to a WebAssembly text recognition engine. The language data is downloaded once, the first time you use a language, and the work happens locally. Larger scale improves accuracy but takes longer.`,
    uses: `Search a scanned contract, copy text from a photographed page, make an archive of old paper records findable, or turn a screenshot of a table into text you can paste elsewhere.`,
    tip: `Pick the language that matches the document, because accuracy drops sharply with the wrong one. Straight, well lit scans work best. Recognition is slow on long files, so try a few pages first.`,
    faq: [
      [`Why does the first run take longer?`, `The engine downloads the language data for the first time you use it. After that it is cached by your browser.`],
      [`How accurate is it?`, `Clean, straight scans in the right language are recognized well. Handwriting, skew and low resolution reduce accuracy.`],
    ],
    rel: ['pdf-to-txt', 'pdf-to-word', 'repair-pdf'],
  },

  /* --------------------------------- Edit --------------------------------- */
  {
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    cat: 'edit',
    icon: '💧',
    accept: PDF,
    out: 'PDF',
    opts: [
      optText('text', 'Watermark text', 'CONFIDENTIAL', { required: true, placeholder: 'e.g. DRAFT' }),
      optNumber('fontSize', 'Font size (pt)', 48, 8, 200),
      optRange('opacity', 'Opacity (%)', 30, 5, 100, 5),
      optNumber('rotation', 'Rotation (degrees)', 45, -180, 180),
      optColor('color', 'Colour', '#888888'),
      optSelect('layout', 'Layout', 'center', [
        ['center', 'Single, centered'],
        ['tiled', 'Tiled across the page'],
      ]),
    ],
    blurb: `Stamp custom text across every page of a PDF with adjustable size, colour, angle and opacity.`,
    kw: ['add watermark to pdf', 'stamp pdf'],
    intro: `Watermark PDF stamps your own text across every page. Choose the wording, size, colour, angle and transparency, and decide between one large mark in the middle or a repeating pattern that covers the whole page.`,
    how: `The text is drawn onto each page as a semi-transparent overlay in your browser, using a built-in font. The underlying page content is left in place, so the watermark sits on top and the file stays searchable.`,
    uses: `Mark drafts as DRAFT, label internal documents CONFIDENTIAL, discourage reuse of a proposal sent to a client, or add a company name to samples shared before a contract is signed.`,
    tip: `A watermark can be removed by someone with PDF editing software, so treat it as a label rather than protection. Keep opacity around 20 to 40 percent so the page stays readable, and use Latin characters.`,
    faq: [
      [`Can the watermark be removed?`, `Yes, with editing software. It deters casual reuse but is not a security feature.`],
      [`Can I use non-English text?`, `The built-in fonts cover Latin characters. Other scripts need a Unicode font on the site, otherwise they show as question marks.`],
    ],
    rel: ['header-footer-pdf', 'page-numbers-pdf', 'protect-pdf'],
  },
  {
    slug: 'page-numbers-pdf',
    name: 'Add Page Numbers',
    cat: 'edit',
    icon: '🔢',
    accept: PDF,
    out: 'PDF',
    opts: [
      optSelect('position', 'Position', 'bottom-center', POS6),
      optSelect('format', 'Format', 'n', [
        ['n', '1, 2, 3'],
        ['page-n', 'Page 1, Page 2'],
        ['n-of-total', '1 of 10'],
        ['page-n-of-total', 'Page 1 of 10'],
      ]),
      optNumber('start', 'Start numbering at', 1, 0, 100000),
      optNumber('fontSize', 'Font size (pt)', 10, 6, 36),
      optCheck('skipFirst', 'Skip the first page (cover)', false),
    ],
    blurb: `Add page numbers to a PDF in any corner or centre, with your choice of format and start number.`,
    kw: ['number pdf pages', 'pdf page numbering'],
    intro: `Add Page Numbers stamps a number on every page of your PDF. Choose a position, a format such as Page 3 of 12, the first number to use, and whether the cover page should be skipped.`,
    how: `Numbers are drawn onto each page in your browser, using the page's own size to place them neatly inside the margin. The total used in the n-of-total formats always counts every page of the document.`,
    uses: `Number a merged report before printing, add references to a legal bundle, start an appendix at a later number, or make a long document easier to discuss in a meeting where everyone must find the same page.`,
    tip: `Skip the first page for documents with a cover, and set the start number to match. If you need prefixes like exhibit codes on every page, the Bates numbering tool is a better fit.`,
    faq: [
      [`Can numbering start from a different number?`, `Yes. Set the start value and the first numbered page gets that number, with the rest following in order.`],
      [`Can I leave out the cover page?`, `Yes. Tick the skip option and the first page stays unnumbered.`],
    ],
    rel: ['bates-numbering', 'header-footer-pdf', 'watermark-pdf'],
  },
  {
    slug: 'sign-pdf',
    name: 'Sign PDF',
    cat: 'edit',
    icon: '✍️',
    accept: PDF,
    out: 'PDF',
    opts: [
      { key: 'signature', label: 'Your signature', type: 'signature', default: '', required: true, help: 'Draw with mouse or finger, or upload a PNG or JPG image.' },
      optSelect('target', 'Sign which pages', 'last', [
        ['last', 'Last page'],
        ['first', 'First page'],
        ['all', 'Every page'],
        ['custom', 'A specific page'],
      ]),
      optNumber('customPage', 'Page number', 1, 1, 100000, { showWhen: { key: 'target', equals: 'custom' } }),
      optSelect('position', 'Position', 'bottom-right', POS6),
      optNumber('width', 'Signature width (% of page)', 25, 5, 80, {
        help: 'Values up to 100 are percentages of the page width.',
      }),
    ],
    blurb: `Draw or upload your signature and place it on a PDF page, all without leaving your device.`,
    kw: ['add signature to pdf', 'sign pdf online'],
    intro: `Sign PDF lets you place your handwritten signature on a document. Draw it on screen with a mouse or finger, or upload an image of your signature, then choose the page, corner and size where it should appear.`,
    how: `The signature is cropped to the ink, saved as a transparent image and drawn onto the selected pages by your browser. Nothing is uploaded, so your signature and document remain on your device throughout.`,
    uses: `Return a signed agreement, approve a timesheet, sign a permission slip, or add your mark to a form without printing and scanning the paper.`,
    tip: `This adds a picture of your signature. It is not a cryptographic digital signature and does not prove who signed or detect later changes. Use a certified signing service when the law or the recipient requires one.`,
    faq: [
      [`Is this a legally binding digital signature?`, `It places an image of your signature. It is not a cryptographic signature, so check whether the recipient accepts image signatures.`],
      [`Is my signature stored anywhere?`, `No. It exists only in your browser tab while you work and is cleared when you leave.`],
    ],
    rel: ['protect-pdf', 'flatten-pdf', 'watermark-pdf'],
  },
  {
    slug: 'bates-numbering',
    name: 'Bates Numbering',
    cat: 'edit',
    icon: '#️⃣',
    accept: PDF,
    out: 'PDF files',
    files: [1, 50],
    opts: [
      optText('prefix', 'Prefix', 'DOC-', { placeholder: 'e.g. CASE-' }),
      optText('suffix', 'Suffix', '', { placeholder: 'optional' }),
      optNumber('start', 'Start number', 1, 0, 99999999),
      optNumber('digits', 'Digits (zero padded)', 6, 1, 10),
      optSelect('position', 'Position', 'bottom-right', POS6),
      optNumber('fontSize', 'Font size (pt)', 10, 6, 36),
    ],
    blurb: `Stamp unique, sequential Bates identifiers with prefix and suffix across one or many PDF files.`,
    kw: ['legal document numbering', 'bates stamp pdf'],
    intro: `Bates Numbering stamps a unique identifier on every page, such as CASE-000001. Add a prefix and suffix, choose how many digits to pad, and the sequence runs on across all the files you add, which is what legal and compliance teams expect.`,
    how: `Files are processed in the order listed, and the counter continues from one file to the next without restarting. Each identifier is drawn onto its page in the corner you pick, and every file is returned as a separate PDF.`,
    uses: `Prepare discovery documents for a legal case, label evidence bundles, number pages across a batch of contracts for an audit, or give every page of a due-diligence set a reference that can be cited exactly.`,
    tip: `Order the files before you start, because the numbering follows the list. Write down the last number used so a later batch can continue from it. Encrypted files must be unlocked first.`,
    faq: [
      [`Does numbering continue across files?`, `Yes. The counter carries on from the last page of one file to the first page of the next, in list order.`],
      [`Can I add a prefix and suffix?`, `Yes. Both are optional, and the digits setting controls zero padding of the number between them.`],
    ],
    rel: ['page-numbers-pdf', 'header-footer-pdf', 'merge-pdf'],
  },
  {
    slug: 'overlay-pdf',
    name: 'Overlay PDF',
    cat: 'edit',
    icon: '🧾',
    accept: PDF,
    out: 'PDF',
    files: [2, 2],
    labels: ['Base PDF', 'Overlay PDF'],
    opts: [
      optSelect('placement', 'Overlay placement', 'foreground', [
        ['foreground', 'In front of the base'],
        ['background', 'Behind the base'],
      ]),
      optSelect('pageMode', 'Overlay pages', 'first', [
        ['first', 'Use the first overlay page on every base page'],
        ['match', 'Match page by page'],
      ]),
      optRange('opacity', 'Overlay opacity (%)', 100, 5, 100, 5),
    ],
    blurb: `Place one PDF on top of or behind another, for letterheads, stamps and templates.`,
    kw: ['merge pdf layers', 'letterhead pdf'],
    intro: `Overlay PDF lays one document over or under another. Use it to add a letterhead behind a letter, put a stamp over a form, or combine a template with content. The first file is the base and the second is the overlay.`,
    how: `Each base page is combined with an overlay page, placed in front or behind and drawn at the opacity you set. Use one overlay page for every base page, or match pages one by one for multi-page templates.`,
    uses: `Print letters on a digital letterhead, add a company footer to generated invoices, stamp APPROVED on finished pages, or merge a ruled template with scanned content.`,
    tip: `Check the order of the two files in the list, since the first is always the base. Use a transparent overlay or a lower opacity when it sits in front, so the base content stays readable.`,
    faq: [
      [`Which file is the base?`, `The first file in the list is the base and the second is the overlay. Use the arrows to swap them.`],
      [`What if the base has more pages than the overlay?`, `In match mode extra base pages get no overlay, so choose the first-page mode to repeat one overlay page on all of them.`],
    ],
    rel: ['watermark-pdf', 'header-footer-pdf', 'merge-pdf'],
  },
  {
    slug: 'header-footer-pdf',
    name: 'Header & Footer',
    cat: 'edit',
    icon: '🔖',
    accept: PDF,
    out: 'PDF',
    opts: [
      optText('header', 'Header text', '', { placeholder: 'e.g. Quarterly Report {date}', help: 'Tokens: {page}, {total}, {date}.' }),
      optText('footer', 'Footer text', 'Page {page} of {total}', { help: 'Tokens: {page}, {total}, {date}.' }),
      optSelect('align', 'Alignment', 'center', [
        ['left', 'Left'],
        ['center', 'Center'],
        ['right', 'Right'],
      ]),
      optNumber('fontSize', 'Font size (pt)', 10, 6, 36),
      optNumber('margin', 'Margin from edge (pt)', 28, 8, 120),
      optCheck('skipFirst', 'Skip the first page', false),
    ],
    blurb: `Add a custom header and footer with page, total and date tokens to every PDF page.`,
    kw: ['pdf header and footer', 'add footer to pdf'],
    intro: `Header & Footer adds repeating text at the top and bottom of each page. Write your own wording, mix in the page number, total page count and today's date using simple tokens, and align it left, centre or right.`,
    how: `The tokens {page}, {total} and {date} are replaced on each page as the text is drawn in your browser. Margins are measured in points from the page edge, and the first page can be left clean for covers.`,
    uses: `Add a confidentiality line to every page, label a report with its title and date, print Page 3 of 12 on a contract, or add a document reference that auditors can trace.`,
    tip: `Keep the text short so it fits on one line, and use a margin large enough to avoid your printer's unprintable edge. Latin characters work in the built-in font, while other scripts need a Unicode font.`,
    faq: [
      [`Which tokens can I use?`, `Use {page} for the page number, {total} for the page count and {date} for today's date in either the header or footer.`],
      [`Can I add only a footer?`, `Yes. Leave the header empty and only the footer is drawn.`],
    ],
    rel: ['page-numbers-pdf', 'bates-numbering', 'watermark-pdf'],
  },

  /* ------------------------------- Security ------------------------------- */
  {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    cat: 'security',
    icon: '🔐',
    accept: PDF,
    out: 'Encrypted PDF',
    opts: [
      optPassword('password', 'Password', { placeholder: 'Choose a strong password', help: 'Up to 127 characters. If you forget it, the file cannot be opened.' }),
      optPassword('confirm', 'Confirm password'),
    ],
    blurb: `Encrypt a PDF with a password using AES-256, entirely in your browser.`,
    kw: ['password protect pdf', 'encrypt pdf'],
    intro: `Protect PDF locks your document behind a password. Anyone who wants to open the file must enter it first. Encryption is applied inside your browser, so neither your document nor your password is ever sent to a server.`,
    how: `The tool writes the PDF with AES-256 encryption using the modern Revision 6 scheme, built on your browser's own cryptography. After encrypting, it reopens the result to confirm the password works before offering the download.`,
    uses: `Send payslips or contracts by email, store tax documents in cloud folders, share medical records with a clinic, or add a layer of protection to files on a USB stick.`,
    tip: `Use a long, unique password and share it through a different channel than the file. There is no recovery if you forget it. This implementation has not been independently audited, so use certified software for highly sensitive material.`,
    faq: [
      [`Can you recover a forgotten password?`, `No. The password never leaves your device, so nobody can reset it for you. Keep it somewhere safe.`],
      [`Which encryption is used?`, `AES-256 with the PDF 2.0 scheme. The implementation is not independently audited, so choose certified tools for extremely sensitive files.`],
    ],
    rel: ['unlock-pdf', 'redact-pdf', 'flatten-pdf'],
  },
  {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    cat: 'security',
    icon: '🔓',
    accept: PDF,
    out: 'PDF',
    opts: [
      optPassword('password', 'Current password', { placeholder: 'Enter the password to open the file' }),
    ],
    blurb: `Remove password protection from a PDF you own by entering the password you already know.`,
    kw: ['remove pdf password', 'decrypt pdf'],
    intro: `Unlock PDF removes the password from a document when you know it. Enter the password once, and you get a copy that opens without asking, which saves time when you handle the same file again and again.`,
    how: `The document is opened with your password in the browser, and each page is rendered and rebuilt into a new unprotected PDF. This works for restrictions too, but it makes pages images, so text is no longer selectable. Up to four hundred pages are supported.`,
    uses: `Remove a password from your own statements before archiving, prepare a file for tools that cannot read encrypted PDFs, or share a document with a colleague who has been given the password verbally.`,
    tip: `Only unlock files you are entitled to open. The tool needs the correct password and does not guess or break it. Because pages become images, run the OCR tool afterwards if you need searchable text again.`,
    faq: [
      [`Can this crack a PDF when I forgot the password?`, `No. You must supply the correct password. The tool does not guess, bypass or crack passwords.`],
      [`Why is the text not selectable afterwards?`, `Pages are rebuilt as images to produce a clean copy. Use the OCR PDF tool to make the text searchable again.`],
    ],
    rel: ['protect-pdf', 'ocr-pdf', 'flatten-pdf'],
  },
  {
    slug: 'redact-pdf',
    name: 'Redact PDF',
    cat: 'security',
    icon: '⬛',
    accept: PDF,
    out: 'PDF',
    opts: [
      optText('terms', 'Words or phrases to redact', '', {
        required: true,
        placeholder: 'e.g. John Smith, 4111 1111, confidential',
        help: 'Separate several terms with commas or new lines.',
      }),
      optCheck('caseSensitive', 'Match case exactly', false),
      optCheck('rasterize', 'Rasterize pages (recommended: truly removes the hidden text)', true, {
        help: 'If off, black boxes are drawn but the original text may still be copyable.',
      }),
      optColor('color', 'Box colour', '#000000'),
    ],
    blurb: `Find and black out sensitive words in a PDF, with an option to permanently remove the underlying text.`,
    kw: ['black out text in pdf', 'permanent redaction'],
    intro: `Redact PDF hides sensitive information such as names, numbers or addresses. Type the words to remove, and the tool finds each match, covers it with a solid box, and can rebuild the pages so the hidden text no longer exists in the file.`,
    how: `Matches are located using the text layer of each page. With rasterizing on, pages are rendered with the boxes burned in and saved as images, which truly removes the text. With it off, only boxes are drawn on top.`,
    uses: `Remove account numbers before sharing a statement, hide names in a document sent for review, cover personal data in a case file, or prepare records for disclosure.`,
    tip: `Keep rasterizing on unless you have a reason not to. Without it, black boxes can be removed and the covered text copied. The tool needs a text layer, so scans must go through OCR first, and you must review every page.`,
    faq: [
      [`Is the covered text really gone?`, `Yes when rasterizing is on, because pages become images. With it off the text may remain underneath the boxes and can be copied.`],
      [`What if nothing matches?`, `The tool stops and tells you, instead of returning a file that looks redacted but is not.`],
    ],
    rel: ['protect-pdf', 'flatten-pdf', 'ocr-pdf'],
  },

  /* ------------------------------- Analyze -------------------------------- */
  {
    slug: 'compare-pdf',
    name: 'Compare PDF',
    cat: 'analyze',
    icon: '⚖️',
    accept: PDF,
    out: 'TXT report or PNG images',
    files: [2, 2],
    labels: ['Original PDF', 'Revised PDF'],
    opts: [
      optSelect('mode', 'Comparison mode', 'text', [
        ['text', 'Text differences'],
        ['visual', 'Visual differences (images)'],
      ]),
      optRange('sensitivity', 'Visual sensitivity', 5, 1, 10, 1, {
        help: 'Higher values flag smaller visual changes.',
        showWhen: { key: 'mode', equals: 'visual' },
      }),
    ],
    blurb: `Compare two PDF files and see what changed, by text lines or by a visual page overlay.`,
    kw: ['pdf diff', 'find differences between pdfs'],
    intro: `Compare PDF shows what changed between two documents. Choose a text comparison for a line-by-line list of additions and deletions, or a visual comparison that highlights differing areas on each page in colour.`,
    how: `Text mode extracts the lines from both files, aligns matching pages, and reports lines that were added or removed. Visual mode renders page pairs, marks differing pixels, and writes a summary plus an image for each page that differs.`,
    uses: `Check a revised contract against the original, confirm that a re-exported brochure has not shifted, review edits in a report, or verify that a supposedly identical file is really the same.`,
    tip: `Put the older file first. In images, red marks content only in the original and green marks content only in the revised file. An inserted page shifts every later page pair in visual mode, so prefer text mode then.`,
    faq: [
      [`Which file should come first?`, `The original goes first and the revised file second. Red areas exist only in the original and green areas only in the revised one.`],
      [`Does it work on scanned files?`, `Text mode needs real text, so scans should be recognized with OCR first. Visual mode works on any page.`],
    ],
    rel: ['compare-pdf-versions', 'ocr-pdf', 'extract-pages'],
  },
  {
    slug: 'compare-pdf-versions',
    name: 'Compare PDF Versions',
    cat: 'analyze',
    icon: '🧬',
    accept: PDF,
    out: 'TXT report',
    files: [2, 2],
    labels: ['Older version', 'Newer version'],
    opts: [optCheck('includeMetadata', 'Include document properties', true)],
    blurb: `Generate a version report comparing page counts, sizes, fonts, properties and text between two PDFs.`,
    kw: ['pdf version comparison', 'pdf change report'],
    intro: `Compare PDF Versions writes a structured report about how two files differ. It covers page counts and sizes, fonts in use, optional document properties, and a page-by-page list of text changes, in a single text file you can keep.`,
    how: `Both files are analysed in your browser. The report lists properties such as title and producer, compares page dimensions and fonts, then aligns pages by exact content and shows the lines added or removed on each one.`,
    uses: `Keep an audit trail between draft and final documents, document what changed in a template release, check that a regenerated invoice kept its fonts and layout, or supply evidence of edits.`,
    tip: `Use older first and newer second so additions and removals read correctly. Scanned documents carry no text, so their text changes will be empty. For visual changes use the Compare PDF tool in image mode.`,
    faq: [
      [`How is this different from Compare PDF?`, `This tool produces a written report covering structure and properties as well as text. Compare PDF can also create visual difference images.`],
      [`Can I leave out document properties?`, `Yes. Untick the properties option and the report covers pages, fonts and text only.`],
    ],
    rel: ['compare-pdf', 'extract-images-pdf', 'pdf-to-txt'],
  },
  {
    slug: 'extract-images-pdf',
    name: 'Extract Images',
    cat: 'analyze',
    icon: '🏞️',
    accept: PDF,
    out: 'Images (ZIP)',
    opts: [
      optSelect('format', 'Image format', 'png', [
        ['png', 'PNG (lossless)'],
        ['jpg', 'JPG (smaller)'],
      ]),
      optNumber('minSize', 'Skip images smaller than (px)', 50, 0, 2000, {
        help: 'Measured on the shortest side. Useful to ignore icons and lines.',
      }),
    ],
    blurb: `Pull every embedded picture out of a PDF and save them as PNG or JPG files in a ZIP.`,
    kw: ['save images from pdf', 'pdf image extractor'],
    intro: `Extract Images collects the pictures embedded in a PDF. Instead of rendering whole pages, it finds each image object and saves it as its own file, named by page and position, with tiny decorative graphics filtered out.`,
    how: `The tool reads the drawing instructions of every page, decodes each image it finds, and re-encodes it as PNG or JPG. Images are numbered per page, and up to a thousand are collected into one ZIP archive.`,
    uses: `Recover photos from a brochure, grab logos from a report, collect scanned pages as separate pictures, or reuse artwork from a catalogue for a presentation.`,
    tip: `Images are re-encoded, so you do not receive the original bytes. Stencil masks are skipped, and the summary says how many. If nothing is found the tool explains why, and a page render may be what you actually need.`,
    faq: [
      [`Do I get the original image files?`, `No. Images are decoded and saved again as PNG or JPG, so the file bytes differ from the originals even though the pictures look the same.`],
      [`Why did it find no images?`, `The PDF may contain only text and vector graphics. Use PDF to JPG if you want pictures of the pages instead.`],
    ],
    rel: ['pdf-to-jpg', 'pdf-to-png', 'extract-fonts-pdf'],
  },
  {
    slug: 'extract-fonts-pdf',
    name: 'Extract Fonts',
    cat: 'analyze',
    icon: '🔡',
    accept: PDF,
    out: 'Font files and report (ZIP)',
    opts: [optCheck('includeReport', 'Include a font report', true)],
    blurb: `List the fonts used in a PDF and save the embedded font files along with a report.`,
    kw: ['pdf font list', 'embedded fonts in pdf'],
    intro: `Extract Fonts shows which typefaces a PDF uses and whether they are embedded. Where the font data is stored inside the file, the tool copies it out and detects the format, and a text report lists every font it found.`,
    how: `The tool inspects the font dictionaries in the document, copies each embedded font stream, and identifies it as TrueType, OpenType, CFF or Type 1 from its data. Fonts are listed per document rather than per page.`,
    uses: `Find out which font a designer used, diagnose why a document looks different on another computer, check that everything is embedded before sending to print, or audit a template for licensing questions.`,
    tip: `Extracted fonts are often subsets containing only the characters used, so they may not work for new text. Fonts used only through Type 3 resources are not extracted, and check licences before reusing any font.`,
    faq: [
      [`Can I install the extracted fonts?`, `Usually only partially. Most are subsets with just the used characters, and fonts are subject to licence terms, so check the licence first.`],
      [`Why are some fonts not extracted?`, `Fonts that are not embedded are only listed by name, and Type 3 fonts are not extracted.`],
    ],
    rel: ['compare-pdf-versions', 'extract-images-pdf', 'repair-pdf'],
  },
];

/* ------------------------------ Description ------------------------------- */

const PRIVACY_LINE = `Everything happens locally in your browser tab, so your documents never touch our servers, and closing the tab clears the working memory.`;

/* Generic sentences appended only when a description is under 300 words. */
const PAD_POOL: string[] = [
  `The tool is free to use, needs no account or email address, and has no watermark or daily limit on the files you process.`,
  `It works in current versions of Chrome, Edge, Firefox and Safari on desktop and mobile, and large files simply take a little longer.`,
  `Always keep your original file, and check the result before you share it, because every conversion is easier to fix at the start than after sending.`,
  `If something looks wrong, try the same file again with different settings, or write to us through the contact page and we will help.`,
  `Results download straight to your device, and you can run the tool as many times as you like without waiting in a queue.`,
  `For the best results, start from the original source file rather than a copy that has already been compressed or converted several times.`,
  `Where something cannot be carried over exactly, the result panel tells you so instead of failing silently.`,
  `Installing the site as an app from your browser menu gives you a faster launch and a window of its own.`,
];

/**
 * Builds exactly four paragraphs (one per H2) whose combined length lands
 * between 300 and 350 words: hand-written copy first, then the privacy line,
 * then generic padding only if still short.
 */
function fitParagraphs(s: Spec): string[] {
  const base = [s.intro, s.how, s.uses];
  let last = `${s.tip} ${PRIVACY_LINE}`;
  let total = countWords([...base, last].join(' '));

  if (total > 350) {
    last = s.tip;
    total = countWords([...base, last].join(' '));
  }

  const extra: string[] = [];
  for (const sentence of PAD_POOL) {
    if (total >= 300) break;
    extra.push(sentence);
    total += countWords(sentence);
  }

  return [...base, [last, ...extra].join(' ')];
}

/* -------------------------------- Builder -------------------------------- */

const META_SUFFIX = ` Free, private, no upload.`;

function build(s: Spec): Tool {
  const [min, max] = s.files ?? [1, 1];
  const multiple = max > 1;
  const path = `/tools/${s.slug}`;
  const options = s.opts ?? [];
  const acceptWord = s.accept.map((a) => a.slice(1).toUpperCase()).join(', ');

  const steps = [
    multiple
      ? `Add your ${acceptWord} files by dragging them onto the upload area or clicking it to browse${min > 1 ? ` (at least ${min} are needed)` : ''}.`
      : `Add your ${acceptWord} file by dragging it onto the upload area or clicking it to browse.`,
    options.length
      ? `Adjust the options that appear below the file list, or keep the sensible defaults.`
      : `No settings are needed for this tool, so you can go straight to the next step.`,
    `Press the run button and watch the progress bar until ${s.name} finishes.`,
    `Download the result, then close the tab whenever you like to clear everything from memory.`,
  ];

  const faqs: FaqItem[] = [
    ...s.faq.map(([q, a]) => ({ q, a })),
    {
      q: `Are my files uploaded to a server?`,
      a: `No. ${s.name} runs entirely in your browser using WebAssembly, so your files stay on your device and are never sent to PDF Lovers Pro.`,
    },
  ];

  const lower = s.name.toLowerCase();

  return {
    slug: s.slug,
    name: s.name,
    category: s.cat,
    icon: s.icon,
    accept: [...s.accept],
    output: s.out,
    multiple,
    minFiles: min,
    maxFiles: max,
    fileLabels: s.labels,
    options,
    url: `${SITE.url}${path}`,
    path,
    metaTitle: `${s.name} Online, Free and Private`,
    metaDescription: `${s.blurb}${META_SUFFIX}`,
    h1: `${s.name} Online for Free`,
    h2s: [`About ${s.name}`, `How ${s.name} works`, `When to use ${s.name}`, `Tips and privacy`],
    paragraphs: fitParagraphs(s),
    steps,
    faqs,
    keywords: [lower, `${lower} online`, `free ${lower}`, s.kw[0], s.kw[1]],
    related: [...s.rel],
  };
}

/* -------------------------------- Registry -------------------------------- */

/** Hand-written content (tool-content.ts) replaces the template copy for the top tools. */
function withContent(tool: Tool): Tool {
  const c = TOOL_CONTENT[tool.slug];
  if (!c) return tool;
  return {
    ...tool,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    h1: c.h1,
    h2s: [...c.h2s],
    paragraphs: [...c.paragraphs],
    steps: [...c.steps],
    faqs: [...c.faqs],
    keywords: [...c.keywords],
  };
}

export const TOOLS: Tool[] = SPECS.map(build).map(withContent);

/** Alias kept for any code that imported the earlier export name. */
export const TOOLS_REGISTRY = TOOLS;

export const TOOL_COUNT = TOOLS.length;

export const TOOLS_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export const POPULAR_SLUGS: string[] = [
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'pdf-to-jpg',
  'jpg-to-pdf',
  'word-to-pdf',
  'pdf-to-word',
  'rotate-pdf',
];

/* --------------------------------- Helpers -------------------------------- */

export function getTool(slug: string): Tool | undefined {
  return TOOLS_BY_SLUG[slug];
}

export function getAllSlugs(): string[] {
  return TOOLS.map((t) => t.slug);
}

export function getRelatedTools(tool: Tool | string, limit = 6): Tool[] {
  const t = typeof tool === 'string' ? getTool(tool) : tool;
  if (!t) return [];
  const out: Tool[] = [];
  for (const slug of t.related) {
    const r = getTool(slug);
    if (r && r.slug !== t.slug && !out.includes(r)) out.push(r);
  }
  for (const other of TOOLS) {
    if (out.length >= limit) break;
    if (other.slug !== t.slug && other.category === t.category && !out.includes(other)) out.push(other);
  }
  return out.slice(0, limit);
}

export function getToolsByCategory(category: CategoryId): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getDescriptionText(tool: Tool): string {
  return tool.paragraphs.join(' ');
}

/* --------------------------------- JSON-LD -------------------------------- */

export function buildToolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${tool.url}#software`,
        name: `${tool.name} | ${SITE.name}`,
        url: tool.url,
        description: tool.metaDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (modern web browser)',
        browserRequirements: 'Requires JavaScript and WebAssembly',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        author: { '@type': 'Person', name: SITE.founder },
      },
      {
        '@type': 'FAQPage',
        '@id': `${tool.url}#faq`,
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${tool.url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: tool.name, item: tool.url },
        ],
      },
    ],
  };
}

/* ------------------------------ Integrity check --------------------------- */

(function assertRegistry() {
  if (TOOLS.length !== 42) {
    throw new Error(`Registry must contain exactly 42 tools, found ${TOOLS.length}.`);
  }
  const seen = new Set<string>();
  for (const t of TOOLS) {
    if (seen.has(t.slug)) throw new Error(`Duplicate tool slug: ${t.slug}`);
    seen.add(t.slug);
    if (t.minFiles > t.maxFiles) throw new Error(`minFiles > maxFiles for ${t.slug}`);
  }
})();
