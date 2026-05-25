# Life OS — Personal Dashboard Design Spec
**Date:** 2026-05-25  
**Status:** Approved  

---

## Overview

A single `index.html` personal life dashboard. Zero server, zero cost, zero maintenance. Hosted on GitHub Pages. Data lives in browser localStorage, synced to Google Drive on demand. Works on Mac (Chrome) and Android Pixel 9 (Chrome).

---

## Visual Design

- **Theme:** Golden Hour — deep dark brown base (`#1a0f00`), warm amber + gold accents (`#f5c842`, `#e8900a`), cream text (`#fde8b0`)
- **Layout:** Sidebar navigation (icon rail left, content area right)
- **Typography:** System UI sans-serif
- **Charts:** Chart.js via CDN
- **No external CSS framework** — all styles inline, driven by 8 CSS custom properties

### CSS Variables
```css
--gold: #f5c842
--amber: #e8900a
--dark: #1a0f00
--darker: #110900
--text: #fde8b0
--muted: #c8840a
--border: rgba(255,180,30,0.18)
--panel: rgba(255,160,30,0.07)
```

---

## Architecture

```
index.html (single file)
│
├── Sidebar (8 icon buttons)
├── Content Area (section renders here via JS show/hide)
├── Header (global search + Sync to Drive + Load from Drive)
│
├── localStorage: lifeos_data (one JSON object, all sections)
├── Google Drive: lifeos-backup.json (manual sync)
│
└── External APIs (browser fetch, no proxy server):
    ├── Google Drive API v3      (sync)
    ├── Google Calendar API v3   (live events)
    ├── YouTube Data API v3      (saved playlists)
    ├── TMDB API                 (movies/series metadata)
    └── Open Library API         (books metadata, no key needed)
```

**Data model:** Single `lifeos_data` object in localStorage.
```json
{
  "recipes": [],
  "watch": { "movies": [], "youtube": [] },
  "health": { "workouts": [], "weight": [], "meals": [], "water": [] },
  "mind": { "sessions": [], "bookmarks": [], "gratitude": [] },
  "books": [],
  "family": { "notes": [], "milestones": [], "reminders": [] },
  "ideas": [],
  "settings": { "googleClientId": "", "tmdbKey": "" }
}
```

---

## Sections

### 1. 🏠 Today
- Greeting with time of day ("Good morning / afternoon / evening")
- Today's date, day of week
- Google Calendar events (live via API, same-day only)
- Daily habit checklist: Meditate / Workout / Read / Water (resets midnight)
- Streak counter (consecutive days all habits done)
- Quick-add note (saves to Ideas with today's date)

### 2. 🍳 Recipes
- **Import:** Drag-drop Google Takeout JSON (YouTube history) → parses saved/liked videos tagged as recipes. Drag-drop Instagram export JSON → parses saved posts.
- **Cards:** Thumbnail, title, source (YouTube/Instagram), tags, date saved
- **Search:** Live filter by title or tag
- **Filters:** Cuisine (Indian/Italian/Chinese/etc), Meal type (Breakfast/Lunch/Dinner/Snack), Time (Quick <30m / Normal / Long)
- **Tag editor:** Click card → edit tags inline
- Auto-detect recipes from video titles (keywords: recipe, cook, how to make)

### 3. 📺 Watch
Two sub-tabs:

**Movies & Series**
- Manual add: type title → TMDB API fetches poster, rating, runtime, year, genre
- Status: Want to Watch / Watching / Done
- Star rating (1-5) + personal notes
- Filter by status, genre, rating

**YouTube Saves**
- Populated from Google Takeout JSON import (same file as Recipes)
- Non-recipe videos appear here
- Link opens YouTube directly

### 4. 💪 Health
- **Workout log:** Date, type (Gym/Yoga/Run/Home), duration, notes. Log entry form. History list.
- **Weight log:** Date + weight (kg). Line chart via Chart.js. Last 30 entries shown.
- **Water tracker:** Daily goal (8 glasses). Tap to increment. Resets midnight.
- **Meal log:** Breakfast / Lunch / Dinner / Snack — free text, date-stamped. Not calorie tracking.

### 5. 🧘 Mind
- **Meditation timer:** Set duration (5/10/15/20/30 min or custom). Countdown display. Bell sound on complete (Web Audio API, no file needed).
- **Session log:** Date, duration, notes. Streak shown.
- **Spiritual bookmarks:** Paste URL + title + note → saved as card. Tag by tradition/topic.
- **Gratitude journal:** 3 text inputs, date-stamped. Read past entries in reverse chronological list.

### 6. 📚 Books
- Manual add: type title → Open Library API fetches cover, author, year, pages
- Status: Want to Read / Reading / Done
- Star rating + notes
- Currently Reading shown prominently at top

### 7. 👨‍👩‍👧 Family
- **Calendar widget:** Google Calendar API — next 7 days of events displayed as list
- **Kids notes:** Free text entries, date-stamped, searchable
- **Milestones:** Date + description + optional emoji. Timeline view.
- **Reminders:** Title + datetime → browser Notification API fires at set time. Listed with delete option.

### 8. 💡 Ideas
- Quick capture: textarea → hit Enter or click Add → saves as timestamped card
- Tags (free-form)
- Pin important ideas (pinned float to top)
- Search across all ideas
- Delete with confirmation

---

## Global Features

- **Header search:** Searches across all sections simultaneously, shows grouped results
- **Sync to Drive button:** Uploads `lifeos_data` JSON to Google Drive as `lifeos-backup.json`
- **Load from Drive button:** Downloads `lifeos-backup.json` from Drive → overwrites localStorage (full replace, not merge)
- **Offline-first:** All sections work without internet (except Calendar/YouTube live APIs + Drive sync)
- **Responsive sidebar:** Collapses to icons-only on narrow screens

---

## Data Flow

### Getting data IN
| Source | Method |
|---|---|
| YouTube saves | Google Takeout ZIP → extract → drag YouTube export JSON into dashboard |
| Instagram saves | Instagram app → Download Your Data → drag exported JSON into dashboard |
| Movies / Books | Type title → API auto-fills metadata |
| Google Calendar | OAuth → live API call each visit |
| YouTube playlists | OAuth → YouTube API v3 |
| Workout / Meals / Meditation / Ideas | Manual form entry |
| Reminders | Set via form → browser Notification API |

### Cross-device sync (Mac ↔ Pixel 9)
```
Mac: enter data → localStorage → click "Sync to Drive" → lifeos-backup.json in Google Drive
Pixel 9: open GitHub Pages URL → click "Load from Drive" → localStorage populated → full dashboard
```

---

## Technical Stack

| Layer | Choice |
|---|---|
| File | Single `index.html` |
| Styling | Inline CSS + CSS variables |
| JS | Vanilla JS, no frameworks, no build tools |
| Storage | `localStorage` (`lifeos_data` key) |
| Drive sync | Google Drive API v3, browser OAuth (gapi) |
| Calendar | Google Calendar API v3, same OAuth token |
| YouTube | YouTube Data API v3, same OAuth token |
| Movies | TMDB API (free key, stored in settings) |
| Books | Open Library API (no key needed) |
| Charts | Chart.js via CDN |
| Notifications | Browser Notification API |
| Hosting | GitHub Pages (free) |
| Audio | Web Audio API (meditation bell — no audio file) |

---

## One-Time Setup (post-build)

1. **Google Cloud Console** — create project, enable Drive + Calendar + YouTube APIs, create OAuth 2.0 client ID (Web application), add GitHub Pages URL as authorised origin. Paste client ID into dashboard Settings.
2. **TMDB** — free account → API key → paste into dashboard Settings.
3. **GitHub** — create repo `life-os`, push `index.html`, enable Pages on `main` branch.
4. **Pixel 9** — open GitHub Pages URL in Chrome → "Add to Home Screen" → works like an app.

---

## Out of Scope (build later)

- Email digest integration
- Automatic Instagram sync (API restriction — export only)
- Multiple user support
- Native Android app
- Paid APIs or subscriptions

---

## Success Criteria

- Opens in Chrome on Mac and Pixel 9 with no installation
- All 8 sections usable with zero internet (except live APIs)
- Data survives browser close (localStorage)
- Sync to Drive completes in under 5 seconds
- TMDB + Open Library metadata fetch in under 2 seconds
- Zero monthly cost forever
