# HOWTO — build & extend CatGer

CatGer is a **modular** book. The content lives as many small Markdown files;
a manifest (`book.config.json`) decides which files appear and in what order;
a build script assembles them into `CatGer.md`, `CatGer.html`, and `CatGer.pdf`.

You can add lessons or whole blocks without touching the build.

## Requirements

- **Node.js** (any recent version) — run `npm install` once.
- **Microsoft Edge** or **Google Chrome** — used headlessly to make the PDF.
  (If neither is found, the build still produces the HTML; open it and press
  `Ctrl+P → Save as PDF`.)

## Project layout

```
book.config.json                 the manifest: front pages + ordered blocks/lessons
content/
  front/                         title page, intro, how-to-use (before Block 1)
  blocks/
    block-1-alltag-zuhause/
      _block.md                  block cover/intro
      day-01-…​.md  …​  spieltag-1.md   one file per lesson
assets/
  images/<block>/<lesson>.svg    placeholder image for each lesson
  styles/book.css                print/screen styling
templates/                       lesson.md, block.md (used by the scaffolders)
tools/                           build.mjs, new-lesson.mjs, new-block.mjs, split.mjs
build/                           generated output (git-ignored)
legacy/                          the original monolithic Block_*.md files
```

## Build the book

```bash
npm run build       # Markdown + HTML + PDF  → build/
npm run build:md    # skip the PDF (faster while writing)
```

Output:

- `build/CatGer.md` — the whole book as one Markdown file
- `build/CatGer.html` — styled, self-contained (images inlined), printable
- `build/CatGer.pdf` — ready to read or print

## Add a lesson

```bash
npm run new:lesson -- --block=block-1 --day=21 --title="Einkaufen · Anar a comprar"
```

This creates `content/blocks/block-1-…/day-21-einkaufen.md` from
`templates/lesson.md`, generates a placeholder image, and inserts the file into
the manifest **before** that block's Spieltag. Then fill in the file and rebuild.

Add a play day instead:

```bash
npm run new:lesson -- --block=block-3 --spieltag --n=3 --title="Reisebüro Tandem"
```

## Add a block

```bash
npm run new:block -- --title="Arbeit & Studium · Feina i estudis" --range="21-25"
# then add lessons to it:
npm run new:lesson -- --block=block-5 --day=21 --title="Im Büro · A l'oficina"
```

## Reorder, rename, remove

Everything is driven by `book.config.json`:

- **Reorder** blocks or lessons → change the order of entries in the arrays.
- **Remove** a lesson → delete its line from the block's `lessons` array (and
  optionally the file). It simply won't be built.
- **Rename** a file → update its entry in `lessons`.

The build never scans folders blindly; if it isn't in the manifest, it isn't in
the book. That keeps drafts and experiments out of the finished PDF.

## The lesson format

Each lesson file starts with a `## ` title, then follows the house structure:
Vokabeln table → *Für ihn* (Catalan tip) → *Per a ella* (German tip) →
Tandem-Zeit (two rounds) → Mini-Spiel → "Heute gelernt". See `templates/lesson.md`
or any existing day for the exact shape. Always keep German and Catalan side by side.

## Images

Every lesson references a placeholder in `assets/images/<block>/`. To use a real
picture, drop a `.png`/`.jpg` in that folder and point the `![…](…)` line in the
lesson at it. The build inlines images into the HTML/PDF automatically.
