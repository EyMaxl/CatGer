// One-time migration: split the legacy Block_*.md files into modular per-lesson
// files under content/blocks/, generate image placeholders, and write book.config.json.
//
// Run with: npm run split
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, slugify, CONFIG_PATH } from './lib.mjs';

const LEGACY = [
  'Block_1_Alltag_und_Zuhause.md',
  'Block_2_Essen_und_Ausgehen.md',
  'Block_3_Reisen_und_Unterwegs.md',
  'Block_4_Gefuehle_und_Beziehung.md',
];

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function placeholderSVG(title, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" role="img" aria-label="${xml(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef2ff"/>
      <stop offset="1" stop-color="#fce7f3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="420" fill="url(#g)"/>
  <rect x="12" y="12" width="1176" height="396" fill="none" stroke="#c7d2fe" stroke-width="3" stroke-dasharray="12 10" rx="18"/>
  <text x="600" y="196" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#3730a3">${xml(title)}</text>
  <text x="600" y="252" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#9333ea">${xml(sub)}</text>
  <text x="600" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b7280">Bild folgt · Imatge a venir</text>
</svg>
`;
}

const config = {
  title: 'CatGer',
  subtitle: 'Deutsch ↔ Català — Tandem-Lernbuch · Llibre de tàndem',
  languages: ['Deutsch', 'Català'],
  front: [
    'content/front/01-title.md',
    'content/front/02-intro.md',
    'content/front/03-how-to-use.md',
  ],
  blocks: [],
};

let migrated = 0;

LEGACY.forEach((file, i) => {
  const n = i + 1;
  const abs = join(ROOT, file);
  if (!existsSync(abs)) {
    console.warn(`! skipping missing ${file}`);
    return;
  }
  const raw = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');

  // H1 line + everything up to the first "## " is the block intro.
  const h1Match = raw.match(/^#\s+(.+)$/m);
  const h1 = h1Match[1].trim();
  const bodyStart = raw.indexOf('\n## ');
  const introBlock = raw.slice(0, bodyStart).replace(/\n?---\s*$/, '').trimEnd() + '\n';
  const bodyText = raw.slice(bodyStart + 1); // from the first "## "

  // Block title after "TANDEM — ", German title for the folder slug.
  const titlePart = h1.replace(/^TANDEM\s*—\s*/, '');
  const afterColon = titlePart.split(':').slice(1).join(':').trim() || titlePart;
  const titleDE = afterColon.split(' · ')[0].trim();
  const dir = `block-${n}-${slugify(titleDE)}`;
  const blockDir = join(ROOT, 'content', 'blocks', dir);
  const imgDir = join(ROOT, 'assets', 'images', dir);
  mkdirSync(blockDir, { recursive: true });
  mkdirSync(imgDir, { recursive: true });

  writeFileSync(join(blockDir, '_block.md'), introBlock);

  // Split the body into "## " sections.
  const sections = bodyText
    .split(/\n(?=## )/)
    .map((s) => s.replace(/\n?---\s*$/, '').trimEnd())
    .filter(Boolean);

  const lessons = [];
  for (const section of sections) {
    const header = section.match(/^##\s+(.+)$/m)[1].trim();
    const isSpieltag = /^Spieltag/i.test(header);
    const numMatch = header.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : String(lessons.length + 1);
    // German lesson name: text after "—", before " · ".
    const nameDE = (header.split('—')[1] || header).split(' · ')[0].trim();

    const base = isSpieltag
      ? `spieltag-${num}`
      : `day-${String(num).padStart(2, '0')}-${slugify(nameDE)}`;

    // Image placeholder right under the title.
    writeFileSync(join(imgDir, `${base}.svg`), placeholderSVG(nameDE, isSpieltag ? 'Spieltag · Dia de jocs' : `Tag · Dia ${num}`));
    const imgPath = `assets/images/${dir}/${base}.svg`;
    const withImage = section.replace(
      /^(##\s+.+)$/m,
      `$1\n\n![${nameDE} — Bild folgt · imatge a venir](${imgPath})`,
    );

    writeFileSync(join(blockDir, `${base}.md`), withImage + '\n');
    lessons.push(`${base}.md`);
    migrated++;
  }

  config.blocks.push({ id: `block-${n}`, title: titlePart, dir: `content/blocks/${dir}`, intro: '_block.md', lessons });

  // Retire the legacy file into legacy/ (content is preserved in git history too).
  mkdirSync(join(ROOT, 'legacy'), { recursive: true });
  renameSync(abs, join(ROOT, 'legacy', file));
  console.log(`✓ ${file} → ${dir}/ (${sections.length} lessons)`);
});

writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
console.log(`\nWrote book.config.json · ${config.blocks.length} blocks · ${migrated} lessons`);
console.log('Legacy files moved to legacy/. Run: npm run build');
