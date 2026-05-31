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
--bg/#darker: #07070f   --dark/--s1: #0d0d1a   --s2: #111120   --s3: #16162a
--border: rgba(255,255,255,0.07)   --panel: rgba(255,255,255,0.04)
--text: #ede8ff  --muted: #5a5575
--purple: #8a5cf6  --amber: #f09030  --green: #22d3a0  --pink: #f472b6  --blue: #60a5fa
Legacy aliases: --gold=--purple, --amber-20/15/40, --amber-dark=#7c3aed, --gold-8
Font: Inter (Google Fonts CDN)
```
**2026-05-30**: Replaced Golden Hour (amber/brown) base theme with unified purple-dark palette matching recipe section. All amber accents → purple. Chart.js, toast, video/audio/book placeholders updated.

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
| 2026-05-30 | Generic EPUB parser: `getEpubSpineFiles()` reads container.xml→OPF→spine (works for any EPUB, not just Ottolenghi). `parseChapterGeneric()` fallback uses heading+ingredient/step heuristics. Ottolenghi-specific parser runs first, generic runs if no recipes found. |
| 2026-05-30 | Ottolenghi multi-book fix: all class selectors use wildcard `[class*="RECIPE-HEADING"]` etc. instead of `OS_` prefix — supports Simple, Plenty More, Plenty, Jerusalem, Falastin, etc. Steps fall back to all `li` if no `*_method` li found. |
| 2026-05-30 | Plenty More structure: uses `h1.recipe_title`, `div.IL_item` (not `li`) for ingredients, `div.method_step` (element IS the step, not container). Fixed `extractIngredientsGeneric` to use `Array.from(el.children)` and `extractStepsGeneric` to use element's own textContent when no nested li/p. |
| 2026-05-30 | Serves tag: was `color:#555` (invisible on dark bg) → fixed to green (#22d3a0). Serves extractor: now checks `yield|serves` class name first (catches Plenty More's `div.yield`), then text pattern fallback. |
| 2026-05-30 | Recipe notes: 💬 button on every card opens modal focused on "My Notes" textarea; notes auto-save to `recipe.notes` in localStorage on input; card button turns green with ✓ when note exists. |
| 2026-05-30 | Book re-import: ↺ button on book chip deletes old data + opens file picker to re-parse same EPUB — no manual delete needed when parser improves. |
| 2026-05-30 | DK/Dorling Kindersley books (Elena Paravantes etc): title=`p.chapter-head`, ingredients=individual `p.ing`, steps=individual `p.RecipeSteps`. Added `[class*="chapter-head"i]` to heading selector, `\bing\b` check to ingredient extractor, "step" to step class regex, strip leading step-number "N " prefix, "N servings" reverse pattern for serves. Photos only on 2-page spread files; single-recipe pages use placeholder. |
| 2026-05-30 | Skip icon images in `extractFirstImageGeneric`: filter out filenames containing "icon", class containing "icon", or DK-style `img-20`/`img-NNpx` small icon classes. |
| 2026-05-30 | DK serves fix: `table.table1` sibling has all cells concatenated (>80 chars), so old check skipped it. Now `checkText()` helper also scans `td/th/div/p/span` children of each sibling — catches `td.Symbol1` with "2 SERVINGS". |
| 2026-05-30 | DK EPUB chapter categorization: added `getEpubChapterMap(zip)` — reads nav.xhtml TOC, maps each recipe filename → chapter title (e.g. "BREAKFASTS"). `parseChapterGeneric` now accepts 6th param `chapterHint`; uses it as `chapterTitle` when h1/h2 is absent. `parseEpub` builds map and passes `chapterHint` per file. Fixes all DK books defaulting recipes to mealType='dinner'. |
| 2026-05-30 | Auto-stored-file re-import: on every successful parse (epub+pdf), file binary saved to IndexedDB `book_files` store (DB version bumped 1→2). `reimportBook` checks `getBookFile(bookId)` first — if found, re-parses instantly (no file picker). Falls back to file picker for books imported before this change. `deleteBook` now also calls `deleteBookFile`. Eliminates delete-and-re-add cycle going forward. |
| 2026-05-30 | PRH false-positive fix: `parseChapterPRH` returns `null` (not `[]`) when file has `div.sub_chap` but no `p.rt` (content chapter). Caller treats `null` as "skip generic parser". Prevents body-text h1/h2 headings (e.g. "Mediterranean Your Way: For Weight Loss") from being parsed as recipes. Only files with both `div.sub_chap` AND `p.rt` produce recipes; files with only `div.sub_chap` block generic fallback. |
| 2026-05-30 | PRH/Ten Speed/Harmony/Rodale cookbook parser: `parseChapterPRH()` — 3rd parser in chain (after Ottolenghi, before generic). Detects `div.sub_chap` containers → `p.rt` title, `p[class*="para-ry"]` serves (text "SERVES N"), `div.custom_list p` ingredients, `p.para-rpf`+`p.para-rp` steps. Added to `parseEpub` chain. Fixes Mediterranean Method (Masley): 47 recipes in c009-sup_r1.xhtml previously returning 0 → now returns 47. |
| 2026-05-30 | PDF parsing: PDF.js 3.11.174 (CDN + worker). `parsePdf()` extracts text items with X/Y coords. Two-column split at 46% page width (ingredients left, steps right). `pdfIsGarbage()` skips OCR artifact lines (>55% same char, symbol-only). `pdfExtractRecipes()` state machine: title → post-title → intro → content phases. CONTINUED pages merged into prev recipe. Chapter mealType inferred from chapter-header pages. `handleBookFile()` dispatcher routes .epub→parseEpub, .pdf→parsePdf. All drop zones and file inputs updated to accept .epub,.pdf. |
| 2026-05-30 | WhatsApp share button on every recipe card (📲) and in recipe detail modal. `shareRecipeWhatsApp(id)` formats title/ingredients/steps as WhatsApp-formatted text (bold via `*`, bullets via `•`), opens `wa.me/?text=…`. Button at bottom-right of card, left of notes button. |
| 2026-05-30 | PDF garbage title fix: `pdfIsTitleLine()` added — only lines starting with capital letter + mostly real words added to title; max 2 title lines. `pdfIsGarbage()` extended: rejects lines with <50% alphanumeric chars and lines with >70% short (≤3 char) tokens (catches OCR decoration like "l eee OE00 OO"). |
| 2026-05-30 | PDF mealType fix: expanded title-keyword overrides — added toast/hummus/dip/feta/chickpea/avocado/tabbouleh for lunch; frittata/egg-muffin for breakfast; baklava/halva for snack. Prevents stale chapterMealType 'drinks' from bleeding into food recipes. Serves in Callisto Media PDFs is a graphical badge not in text layer — documented limitation, not extractable. |
| 2026-05-30 | PRH serves-outside-sub_chap fix: 14/47 `p.para-ry` elements in Mediterranean Method are OUTSIDE `div.sub_chap`. `parseChapterPRH` now walks `container.nextElementSibling` to find serves if not found inside container. Same sibling-walking pattern as steps fix. Also added `p.ry` (shorter Karadsheh class) to serves selector. |
| 2026-05-30 | PRH steps-outside-sub_chap fix: `p.para-rpf`/`p.para-rp` step elements appear as siblings AFTER `div.sub_chap` closes, not inside it. `parseChapterPRH` now walks `container.nextElementSibling` collecting matching step paragraphs until the next `div.sub_chap` is hit. Fixes "Hot Steel-Cut Oatmeal", "Spaghetti with Marinara", and all other Mediterranean Method recipes missing method steps. |
| 2026-05-30 | PDF label-line length cap fix: raised from 45→80 chars. Callisto Media label lines are 48-68 chars ("SERVES GLUTEN-FREE, EGG-FREE, VEGETARIAN, HALF THE TIME" = 56, "DAIRY-FREE, NUT-FREE, GLUTEN-FREE, EGG-FREE, ONE POT, HALF THE TIME" = 68). 45-char cap was blocking foundLabel on virtually every recipe page. Serves count confirmed permanently graphical (circular badge) — no text digit exists in PDF layer for any recipe in this book. |
| 2026-05-30 | PDF false-positive regression fix: removed generic keywords (INGREDIENTS, TIME, POT) from isLabel — they matched section headers on intro pages causing foundLabel=true on non-recipe pages, pushing count from 149→196. Now only actual dietary markers (FREE, VEGAN, VEGETARIAN, DAIRY, EGG, NUT, GLUTEN, PALEO, KETO, WHOLE30, HALAL, KOSHER) + 45-char length cap. isServes tightened to require digit (`^SERVES?\s+\d`). Gate changed to: foundLabel→require 1+ ingredient+step; no-label fallback→4+ ingredients+2+ steps. |
| 2026-05-30 | PDF mealType fix 2: added ricotta/cheese/yogurt/fruit → snack to fix "Baked Ricotta with Pears" and "Mediterranean Fruit" wrongly tagged drinks. |
| 2026-05-30 | PDF serves fix: two new extraction paths. (1) `lookForServesDigit` flag — when "SERVES" appears on its own line with no digit, the immediately following line's digit is captured (previously skipped by the `^\d{1,3}$` filter). (2) intro-text scan — after content extraction, intro narrative is scanned for "serves/makes/yields N" pattern. Covers PDFs where serves appears in prose rather than a dedicated label line. |
| 2026-05-30 | PDF false-positive fix: `pdfExtractRecipes` now tracks `foundLabel` flag — set true when dietary label line (NUT-FREE, EGG-FREE, VEGETARIAN, SERVES, GLUTEN, PALEO, KETO, etc.) is detected. Recipe page rejected unless `foundLabel` is true OR strong structure (≥3 ingredients + ≥1 step) is present. Eliminates TOC/intro/back-matter pages being treated as recipes in Callisto Media PDFs. |
| 2026-05-30 | Delete recipe button: ✕ button on each recipe card (top-left, visible on hover). `deleteRecipe(id)` — confirm dialog → removes from `state.recipes`, deletes IndexedDB image, re-renders. |
| 2026-05-30 | Supplements card updated with precise meal-timing layout: 14:10 IF window (10AM–8PM), workout 2PM. Training day has 9 slots: Breakfast 10AM, Mid-day Blockade 12:30PM, Pre-workout Lunch 1PM (Sterols during + L-Carnitine+Garlic at end), Training Block 2-3:15PM, Post-workout Refuel 4PM (no supps), Evening Blockade 7PM, Dinner 7:30PM, Fast Begins 8PM, Night Stack 10PM. Rest day shifts L-Carnitine+Garlic to breakfast. |
| 2026-05-30 | Supplements card added to Health section: new "💊 Supplements" tab with full evidence-based lipid protocol. Training Day (Mon–Sat) vs Rest Day (Sun) toggle. 8 time-slot cards (Morning/Mid-day×2/Pre-workout/Intra-workout/Evening×2/Night), each with supplement pills + dosage + execution note. Critical timing rules panel (Sterol/Carnitine-TMAO/Sodium rules). Month 1 on-ramp (Week 1–4 gradual introduction). Long-term cycling rules (Ashwagandha cycle, Berberine 5/2 shift, never-cycle list). `switchSuppDay()` toggles training/rest panels. `switchHealthTab()` extended to include 'supplements'. |
| 2026-05-30 | PDF Callisto Media step-number-in-L-column fix: Callisto Media layout embeds step numbers ("1.", "2.") in LEFT column alongside ingredients. `isStepNumOnly = /^\d+\.\s*$/.test(lText)` detects standalone step markers → skip as ingredient, trigger new step in R column. Also strips trailing step-number bleed from ingredient text ("1 (16-ounce) bag frozen 1." → clean). Fixes: "2." appearing as fake ingredient, all steps concatenated into one instead of separate. |
| 2026-05-30 | Workout tracker: replaced simple log form with full Lyfta-style tracker. `WORKOUT_PLAN` constant = 6-day plan (Mon–Sat). State: `health.todayWorkout` (today's sets, resets on date change) + `health.workoutLogs[]` (completion history). Day pills row, per-exercise set chips, inline add-set form, Mark Day Complete button. Functions: `renderWorkoutPlan`, `switchWorkoutDay`, `addWorkoutSet`, `commitWorkoutSet`, `saveWorkoutSet`, `removeWorkoutSet`, `markDayComplete`, `getTodayWorkoutDay`, `getOrInitTodayWorkout`. |
| 2026-05-30 | Recipe URL import: `📎 URL` button added to recipes header. `importRecipeFromUrl()` — prompts for URL, auto-routes YouTube URLs to `importFromYouTube()`. Non-YouTube: fetches via `corsproxy.io`, tries JSON-LD schema.org/Recipe first, falls back to og:meta + CSS heuristics. Image fetched via `images.weserv.nl` (purpose-built image proxy with CORS). Source domain used as book title. |
| 2026-05-30 | Recipe screenshot import: `📸 Photo` button added to recipes header. `importRecipeFromScreenshot()` — file picker (image/*), compresses to 400px for recipe photo, calls Claude Haiku API (vision) to extract title/ingredients/steps/serves/mealType from image, saves recipe. API key stored in `lifeos_claude_key` localStorage, prompted once. |
| 2026-05-30 | Recipe YouTube import: `importFromYouTube()` — oembed for title+thumbnail, corsproxy for description (parsed from `shortDescription` in ytInitialData JSON), heuristic ingredient/step extraction, falls back to Claude Haiku if structure not found. Thumbnail fetched via weserv.nl. Saved under 'YouTube' book. |
| 2026-05-30 | Claude API helper: `callClaude(messages, maxTokens)` — `claude-haiku-4-5-20251001`, direct browser call (`anthropic-dangerous-direct-browser-calls: true`), key stored in `lifeos_claude_key`, auto-clears on 401. `ensureClaudeApiKey()` prompts once. |
| 2026-05-31 | Life OS v2 Phase 1 complete: bottom tab bar (mobile ≤768px), desktop sidebar rail (64px icon / 200px labeled at ≥1100px), switchTab() replaces navigate(), Today dashboard redesigned with SVG progress rings (workout/supplements/eating window), workout/supplement/recipe preview cards. Visual: 12px card radius, hover lift, section-title-v2 accent border. |
| 2026-05-31 | TDZ fix: moved startup `sectionRenderers['today']=renderToday; switchTab('today')` from line 1963 to end of script — `typeof` on TDZ `const` throws ReferenceError, crashing script and leaving health/recipes renderers unregistered (black screens). |
| 2026-05-31 | Added Dessert category to meal type picker (`pickMealType`), recipe tab bar (`MEAL_TABS`), and placeholder emoji map (`MEAL_PLACEHOLDER_EMOJI`). |
| 2026-05-31 | Replaced `window.prompt()` in `importRecipeFromUrl()` with `showUrlInputModal()` — custom non-blocking overlay. Native prompt blocked page and caused Photo/Add Book buttons to appear broken when prompt was open. |
| 2026-05-31 | Added Dressings category (🫙) to meal type picker, recipe tabs, and placeholder emoji map. |
