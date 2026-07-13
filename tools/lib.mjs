// Shared helpers for the CatGer build tooling.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG_PATH = join(ROOT, 'book.config.json');

/** German-aware slug: transliterate umlauts, drop punctuation, hyphenate. */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/à|á|â/g, 'a').replace(/è|é|ê/g, 'e').replace(/ì|í|î/g, 'i')
    .replace(/ò|ó|ô/g, 'o').replace(/ù|ú|û/g, 'u').replace(/ç/g, 'c').replace(/ñ/g, 'n')
    .replace(/·/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A dashed-border placeholder image (SVG text) for a lesson that has no picture yet. */
export function placeholderSVG(title, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" role="img" aria-label="${xmlEscape(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef2ff"/>
      <stop offset="1" stop-color="#fce7f3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="420" fill="url(#g)"/>
  <rect x="12" y="12" width="1176" height="396" fill="none" stroke="#c7d2fe" stroke-width="3" stroke-dasharray="12 10" rx="18"/>
  <text x="600" y="196" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#3730a3">${xmlEscape(title)}</text>
  <text x="600" y="252" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#9333ea">${xmlEscape(sub)}</text>
  <text x="600" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b7280">Bild folgt · Imatge a venir</text>
</svg>
`;
}

/** First markdown heading text in a chunk, stripped of leading #'s. */
export function firstHeading(md) {
  const m = md.match(/^#{1,6}\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

/** Absolute path of every content file the config references, in reading order. */
export function contentFiles(config) {
  const files = [];
  for (const rel of config.front ?? []) files.push({ kind: 'front', path: join(ROOT, rel) });
  for (const block of config.blocks ?? []) {
    const dir = join(ROOT, block.dir);
    if (block.intro) files.push({ kind: 'block-intro', block: block.id, path: join(dir, block.intro) });
    for (const lesson of block.lessons ?? []) {
      files.push({ kind: 'lesson', block: block.id, path: join(dir, lesson) });
    }
  }
  return files;
}

/** Inline every relative <img src> / markdown image as a data URI so the PDF is self-contained. */
export function embedImages(html) {
  const mime = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };
  return html.replace(/src="([^"]+)"/g, (whole, src) => {
    if (/^(https?:|data:|file:)/.test(src)) return whole;
    const abs = join(ROOT, src);
    if (!existsSync(abs)) return whole;
    const ext = src.split('.').pop().toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    const data = readFileSync(abs);
    const b64 = type === 'image/svg+xml'
      ? Buffer.from(data.toString('utf8')).toString('base64')
      : data.toString('base64');
    return `src="data:${type};base64,${b64}"`;
  });
}
