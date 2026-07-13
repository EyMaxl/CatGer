// CatGer build: book.config.json -> build/CatGer.md, build/CatGer.html, build/CatGer.pdf
//
//   npm run build          full build (Markdown + HTML + PDF)
//   npm run build:md       skip the PDF step
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import { ROOT, readConfig, firstHeading, contentFiles, embedImages } from './lib.mjs';

const noPdf = process.argv.includes('--no-pdf');
const OUT = join(ROOT, 'build');
mkdirSync(OUT, { recursive: true });

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
const config = readConfig();
const css = readFileSync(join(ROOT, 'assets', 'styles', 'book.css'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- Assemble units ---------------------------------------------------------
const files = contentFiles(config);
const units = [];
const mdParts = [];

for (let i = 0; i < files.length; i++) {
  const f = files[i];
  if (!existsSync(f.path)) {
    console.warn(`! missing content file: ${f.path}`);
    continue;
  }
  const raw = readFileSync(f.path, 'utf8').replace(/\r\n/g, '\n');
  mdParts.push(raw.trim());
  units.push({
    kind: f.kind,
    id: `unit-${i}`,
    title: firstHeading(raw),
    html: md.render(raw),
  });
}

// ---- Table of contents ------------------------------------------------------
const tocRows = units
  .map((u) => {
    if (u.kind === 'front') return null;                 // front pages skip the TOC
    if (!u.title) return null;
    const cls = u.kind === 'block-intro' ? 'toc-block' : 'toc-lesson';
    return `<li class="${cls}"><a href="#${u.id}">${esc(u.title)}</a></li>`;
  })
  .filter(Boolean)
  .join('\n');

const tocHtml = `<section class="unit toc">
<h1>Inhalt · Índex</h1>
<ol>
${tocRows}
</ol>
</section>`;

// ---- Full HTML --------------------------------------------------------------
const body = units
  .map((u) => `<section class="unit ${u.kind}" id="${u.id}">\n${u.html}\n</section>`)
  .join('\n');

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.title)} — ${esc(config.subtitle)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="book">
${units[0]?.kind === 'front' ? units.slice(0, 1).map((u) => `<section class="unit front" id="${u.id}">\n${u.html}\n</section>`).join('') : ''}
${tocHtml}
${units.slice(units[0]?.kind === 'front' ? 1 : 0).map((u) => `<section class="unit ${u.kind}" id="${u.id}">\n${u.html}\n</section>`).join('\n')}
</div>
</body>
</html>`;

const htmlEmbedded = embedImages(html);

// ---- Write outputs ----------------------------------------------------------
const mdPath = join(OUT, 'CatGer.md');
const htmlPath = join(OUT, 'CatGer.html');
writeFileSync(mdPath, mdParts.join('\n\n---\n\n') + '\n');
writeFileSync(htmlPath, htmlEmbedded);
console.log(`✓ ${config.blocks.length} blocks, ${units.length} pages assembled`);
console.log(`✓ build/CatGer.md`);
console.log(`✓ build/CatGer.html`);

// ---- PDF via headless Edge/Chrome ------------------------------------------
if (noPdf) process.exit(0);

const candidates = [
  process.env.EDGE_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));

if (!browser) {
  console.warn('\n! No Edge/Chrome found for PDF export.');
  console.warn('  Open build/CatGer.html in a browser and print to PDF (Ctrl+P),');
  console.warn('  or set EDGE_PATH to a Chromium browser and re-run `npm run build`.');
  process.exit(0);
}

const pdfPath = join(OUT, 'CatGer.pdf');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const res = spawnSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  fileUrl,
], { stdio: 'ignore' });

if (res.status === 0 && existsSync(pdfPath)) {
  console.log(`✓ build/CatGer.pdf  (via ${browser.split('/').pop()})`);
} else {
  console.warn(`! PDF export failed (exit ${res.status}). Print build/CatGer.html manually.`);
}
