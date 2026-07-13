# CatGer

Catalan and German tandem-learning book, created with the help of Claude Code.

> **Building the book?** The content is modular: one Markdown file per lesson,
> assembled via a manifest into `build/CatGer.pdf`. Run `npm install` once, then
> `npm run build`. To add lessons or blocks, see **[HOWTO.md](HOWTO.md)**.

## Vision

This project is a bilingual learning book for two people who want to learn each other’s language through daily tandem practice:

- one person is a German speaker
- one person is a Catalan speaker
- both want to become stronger and more confident in the other language

The core idea is simple: every day, both learners study the same topic, practice the same vocabulary, and then talk about it in a short, natural conversation.

## Goal of the book

The book should help two learners:

- build everyday vocabulary in both languages
- practice useful sentence patterns
- learn grammar in a practical and manageable way
- improve speaking confidence through short dialogues
- keep a steady daily routine

The focus should be on real-life communication, not on textbook-style memorization.

## Core learning method

Each day should follow the same structure:

1. A practical topic
   - example: everyday life, food, travel, emotions, relationships

2. Vocabulary in both languages
   - German and Catalan side by side
   - clear and useful words only

3. One small grammar or language tip
   - keep it short and relevant
   - avoid overwhelming the learner

4. A tandem conversation section
   - one person asks in one language
   - the other responds in the other language
   - then the roles switch

5. A mini-game or speaking activity
   - roleplay, guessing game, drawing task, miming, or short debate

6. A short reflection line
   - for example: “What did we learn today?”

## Recommended book structure

The book is organized in blocks, with each block covering one broad theme.

Existing blocks:

- Block 1: Alltag und Zuhause
- Block 2: Essen und Ausgehen
- Block 3: Reisen und Unterwegs
- Block 4: Gefühle und Beziehung

Each block should contain:

- 5 daily lessons
- 1 play or review day
- a clear topic progression from easy to more personal and expressive themes

## Style and content rules

When creating or extending the book, follow these rules:

- Keep the tone practical, warm, and encouraging.
- Use everyday vocabulary that learners can really use.
- Present German and Catalan side by side.
- Make the content feel like a real tandem session, not a formal textbook.
- Keep explanations short and helpful.
- Include cultural notes where they add value.
- Make both languages equally visible and important.
- Prefer useful phrases over isolated words.
- Keep the difficulty accessible, ideally around A1 to A2 level with a few slightly richer expressions.

## Writing guidelines for Claude Code

Claude Code should treat this project as a bilingual speaking book, not just a vocabulary list.

When generating new content, follow these instructions:

- Write the book first in Markdown.
- Keep the source content structured and easy to edit in Markdown.
- Use a clear and consistent structure for every day.
- Always include German and Catalan content.
- Keep the language simple, natural, and useful.
- Add one short grammar tip per day.
- Include at least one tandem conversation exercise per day.
- Include one mini-game or interactive activity per day.
- End each day with a short reflection or “today we learned” section.
- Make the content feel motivating and interactive.
- If something is unclear, ask the user a short clarifying question before writing.
- At the end, the complete book should be transformed from Markdown into a PDF for reading and printing.

## Suggested chapter template

Each day should ideally include the following sections:

### Title

- Example: “Tag 1 · Dia 1 — Begrüßung und Vorstellung”

- With the Title there should also be an image placed fitting with the lesson. It can be a spaceholder for later insertion of pictures

### Vocabulary

- A table with German and Catalan words

### Quick language tips

- One tip for German
- One tip for Catalan

### Tandem time

- Round 1: one person asks, the other answers
- Round 2: roles switch

### Mini-game

- A playful activity such as a roleplay, guessing game, drawing task, or miming challenge

### Reflection

- A short closing line for the day

## Prompt template for Claude Code

Use a prompt like this when adding a new block or lesson:

“Create a new bilingual tandem-learning lesson for German and Catalan on the topic [TOPIC]. Follow the existing style of the book. Use the same structure as the other blocks: vocabulary table, short German tip, short Catalan tip, tandem conversation, mini-game, and reflection. Keep the content practical, beginner-friendly, and suitable for daily speaking practice. Present the content in both languages clearly and equally.”

## Practical principles

The book should aim to make the learners feel that they can:

- greet each other naturally
- talk about daily life
- ask and answer simple questions
- describe their routines and preferences
- express emotions and opinions
- enjoy speaking together instead of only studying silently

## Future direction

This project can grow into a full book with many blocks, for example:

- work and studies
- school and learning
- hobbies and free time
- technology and media
- health and body
- family and home
- culture and celebrations

The main goal is always the same: help two people learn from each other through shared daily topics and meaningful conversation.