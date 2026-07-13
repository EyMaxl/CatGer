// Scaffold a new block: create content/blocks/block-N-slug/_block.md from the
// template and register the block in book.config.json (with an empty lesson list).
//
//   npm run new:block -- --title="Arbeit & Studium · Feina i estudis" --range="21-25"
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, slugify, readConfig, CONFIG_PATH } from './lib.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=?(.*)$/);
    return m ? [m[1], m[2] === '' ? true : m[2]] : [a, true];
  }),
);

if (!args.title) {
  console.error('Usage: npm run new:block -- --title="Deutsch · Català" [--range="21-25"]');
  process.exit(1);
}

const config = readConfig();
const n = config.blocks.length + 1;
const [titleDE, titleCat = ''] = String(args.title).split(' · ').map((s) => s.trim());
const dirSlug = `block-${n}-${slugify(titleDE)}`;
const relDir = `content/blocks/${dirSlug}`;
const blockDir = join(ROOT, relDir);
mkdirSync(blockDir, { recursive: true });
mkdirSync(join(ROOT, 'assets', 'images', dirSlug), { recursive: true });

const template = readFileSync(join(ROOT, 'templates', 'block.md'), 'utf8');
const intro = template
  .replaceAll('__N__', String(n))
  .replace('__TITEL_DE__', titleDE)
  .replace('__TITEL_CAT__', titleCat)
  .replace('__RANGE__', args.range || '…');
writeFileSync(join(blockDir, '_block.md'), intro);

config.blocks.push({
  id: `block-${n}`,
  title: `Block ${n} · Bloc ${n}: ${args.title}`,
  dir: relDir,
  intro: '_block.md',
  lessons: [],
});
writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');

console.log(`✓ created ${relDir}/_block.md`);
console.log(`✓ registered block-${n} in book.config.json`);
console.log(`Next: npm run new:lesson -- --block=block-${n} --day=NN --title="…"`);
