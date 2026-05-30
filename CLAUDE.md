# Life OS — CLAUDE.md

## Project
Single-file HTML PWA. Everything lives in `index.html`. No build step. No backend. Deploy: drag folder to Cloudflare Pages or push to GitHub (Pages at https://booksgoat.github.io/life-os/).

## Architecture
- `index.html` — entire app (CSS, JS, markup)
- `manifest.json` — PWA manifest
- `icon-192.png`, `icon-512.png` — PWA icons (placeholder 1×1 PNGs)
- `localStorage` key `lifeos_data` — all recipe metadata + book list
- IndexedDB `lifeos_images` → `images` store — compressed base64 food photos

## Design Tokens
```
--bg: #07070f   --s1: #0d0d1a   --s2: #111120   --s3: #16162a
--border: rgba(255,255,255,0.07)
--text: #ede8ff  --muted: #5a5575  --purple: #8a5cf6
--amber: #f09030  --green: #22d3a0  --pink: #f472b6  --blue: #60a5fa
Font: Inter (Google Fonts CDN)
```

## Navigation
No sidebar. Today dashboard = home. Section cards navigate to sections. `navigate(sectionId)` toggles `.section.active`. `☀ Life OS` home button in header appears when not on Today.

## Recipes Module
- EPUB parsing: JSZip 3.10.1 (CDN) unzips EPUB in browser
- Target EPUB: Ottolenghi Simple (CSS classes: `.OS_RECIPE-HEADING`, `div.recipe_img img`, `.OS_INGREDIENTS-LIST`, `ol li.OS_method`, `.OS_Serves`, `.ct`)
- Images: compressed to max 400px wide, JPEG 0.72 quality via Canvas, stored in IndexedDB
- SIML tags: S=Short, I=≤10 ingredients, M=Make-ahead, L=Lazy
- Chapter→mealType mapping in `CHAPTER_TO_MEAL` constant
- Drag-and-drop on `<section id="recipes">` works even after first book is loaded (section-level handler)
- `esc()` helper used for all user-data interpolated into innerHTML (XSS prevention)

## Decisions Log
| Date | Decision |
|------|----------|
| 2026-05-30 | Single-file HTML PWA, no build step |
| 2026-05-30 | IndexedDB for images (localStorage too small for base64) |
| 2026-05-30 | Canvas compress images to ~50KB before storing |
| 2026-05-30 | Removed sidebar nav — replaced with section cards on Today dashboard |
| 2026-05-30 | Section cards: gradient backgrounds per life area (Recipes=amber, Health=green, Mind=purple, etc.) |
| 2026-05-30 | Drop zone on entire `<section id="recipes">` — fixes second-book drop vanishing after first import |
| 2026-05-30 | Added `rv-drop-overlay` full-screen purple blur overlay with visual feedback on dragenter — makes drop target obvious |
| 2026-05-30 | Fix: `el.tagName === 'OL'` → `.toLowerCase() === 'ol'` — XHTML DOMParser returns lowercase tag names, so steps were never extracted |
| 2026-05-30 | Added book management chips in recipe header — shows each book with recipe count + ✕ delete button; deleteBook() removes recipes + IndexedDB images |
| 2026-05-30 | RECIPE_KEYWORDS kept (Watch section uses it for YouTube recipe filtering) |
