// @ts-nocheck
import * as reg from '../src/lib/tools-registry';

const EXPECTED = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf',
  'word-to-pdf', 'pdf-to-word', 'rotate-pdf', 'protect-pdf', 'unlock-pdf',
  'pdf-to-png', 'png-to-pdf', 'excel-to-pdf', 'pdf-to-excel', 'ppt-to-pdf',
  'pdf-to-ppt', 'watermark-pdf', 'page-numbers-pdf', 'crop-pdf',
  'extract-pages', 'delete-pages', 'sign-pdf', 'ocr-pdf', 'repair-pdf',
  'resize-pdf', 'pdf-to-rtf', 'rtf-to-pdf', 'pdf-to-txt', 'txt-to-pdf',
  'flatten-pdf', 'compare-pdf', 'redact-pdf', 'bates-numbering', 'n-up-pdf',
  'overlay-pdf', 'extract-images-pdf', 'extract-fonts-pdf',
  'compare-pdf-versions', 'grayscale-pdf', 'invert-pdf-colors',
  'remove-annotations', 'header-footer-pdf',
];

const tools: any[] = reg.TOOLS as any[];
const errors: string[] = [];
const fail = (m: string) => errors.push(m);

if (tools.length !== 42) fail(`Expected 42 tools, found ${tools.length}`);

const slugs: string[] = tools.map((t) => t.slug);
const seen = new Set<string>();
for (const s of slugs) {
  if (seen.has(s)) fail(`Duplicate slug: ${s}`);
  seen.add(s);
}
for (const s of EXPECTED) if (!seen.has(s)) fail(`Missing slug: ${s}`);
for (const s of slugs) if (!EXPECTED.includes(s)) fail(`Unexpected slug: ${s}`);

for (const t of tools) {
  const id = t.slug;
  for (const f of ['name', 'category', 'metaTitle', 'metaDescription', 'h1']) {
    if (!t[f] || typeof t[f] !== 'string') fail(`${id}: missing ${f}`);
  }
  if (
    typeof t.minFiles === 'number' &&
    typeof t.maxFiles === 'number' &&
    t.minFiles > t.maxFiles
  ) {
    fail(`${id}: minFiles is greater than maxFiles`);
  }
  if (
    !Array.isArray(t.h2s) ||
    !Array.isArray(t.paragraphs) ||
    t.h2s.length !== t.paragraphs.length
  ) {
    fail(`${id}: h2s and paragraphs must have the same length`);
  }
  if (!Array.isArray(t.faqs) || t.faqs.length < 4) fail(`${id}: needs at least 4 FAQs`);
  if (!Array.isArray(t.steps) || t.steps.length < 3) fail(`${id}: needs at least 3 steps`);

  const rel = Array.isArray(t.related) ? t.related : [];
  for (const r of rel) {
    const target = typeof r === 'string' ? r : r && r.slug;
    if (!target || !seen.has(target)) fail(`${id}: related points to unknown tool "${target}"`);
    if (target === id) fail(`${id}: related points to itself`);
  }
}

if (errors.length) {
  console.error(`verify-registry: ${errors.length} problem(s)`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log(`verify-registry: OK (${tools.length} tools)`);
