// Scaffold a new lesson: create the markdown from templates/lesson.md, generate an
// image placeholder, and register the file in book.config.json (before any Spieltag).
//
//   npm run new:lesson -- --block=block-1 --day=21 --title="Einkaufen · Anar a comprar"
//   npm run new:lesson -- --block=block-2 --spieltag        (adds a play day)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, slugify, readConfig, CONFIG_PATH, placeholderSVG } from './lib.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=?(.*)$/);
    return m ? [m[1], m[2] === '' ? true : m[2]] : [a, true];
  }),
);

const blockId = args.block;
if (!blockId) {
  console.error('Usage: npm run new:lesson -- --block=block-1 --day=21 --title="Deutsch · Català"');
  process.exit(1);
}

const config = readConfig();
const block = config.blocks.find((b) => b.id === blockId);
if (!block) {
  console.error(`Unknown block "${blockId}". Known: ${config.blocks.map((b) => b.id).join(', ')}`);
  process.exit(1);
}

const blockDir = join(ROOT, block.dir);
const dirSlug = block.dir.split('/').pop();
const imgDir = join(ROOT, 'assets', 'images', dirSlug);

const isSpieltag = !!args.spieltag;
let base, titleLine, imgSub;

if (isSpieltag) {
  const n = args.n || config.blocks.indexOf(block) + 1;
  base = `spieltag-${n}`;
  const nameDE = args.title || `Spieltag ${n}`;
  titleLine = `Spieltag ${n} · Dia de jocs ${n} — ${nameDE}`;
  imgSub = 'Spieltag · Dia de jocs';
} else {
  const day = args.day;
  if (!day || !args.title) {
    console.error('A lesson needs --day=N and --title="Deutsch · Català".');
    process.exit(1);
  }
  const nameDE = String(args.title).split(' · ')[0].trim();
  base = `day-${String(day).padStart(2, '0')}-${slugify(nameDE)}`;
  titleLine = `Tag ${day} · Dia ${day} — ${args.title}`;
  imgSub = `Tag · Dia ${day}`;
}

const filename = `${base}.md`;
const filePath = join(blockDir, filename);
if (existsSync(filePath)) {
  console.error(`Refusing to overwrite existing ${block.dir}/${filename}`);
  process.exit(1);
}

// Image placeholder.
const imgRel = `assets/images/${dirSlug}/${base}.svg`;
writeFileSync(join(imgDir, `${base}.svg`), placeholderSVG(String(args.title || titleLine).split(' · ')[0], imgSub));

// Body from template.
const nameDE = String(args.title || titleLine).split(' · ')[0].trim();
const template = readFileSync(join(ROOT, 'templates', 'lesson.md'), 'utf8');
const body = template
  .replace('__TITLE__', titleLine)
  .replace('__IMAGE__', `![${nameDE} — Bild folgt · imatge a venir](${imgRel})`);
writeFileSync(filePath, body);

// Register in the manifest, keeping any Spieltag last.
const spieltagIdx = block.lessons.findIndex((l) => l.startsWith('spieltag-'));
if (!isSpieltag && spieltagIdx !== -1) block.lessons.splice(spieltagIdx, 0, filename);
else block.lessons.push(filename);
writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');

console.log(`✓ created ${block.dir}/${filename}`);
console.log(`✓ placeholder ${imgRel}`);
console.log(`✓ registered in book.config.json  →  edit the file, then: npm run build`);
