# Amanda Brook Portfolio — Claude Context File

> Last verified against codebase: current session.
> Sections marked `[INFERRED]` are derived from code patterns — verify intent.
> Sections marked `[IN FLUX]` are incomplete or flagged for revision.

---

## Project Purpose & Audience

A personal portfolio website for Amanda Brook — artist, graphic designer, and web developer. The site serves two distinct functions that share a single codebase:

1. **Portfolio showcase** — painting, graphic design, and web projects presented for prospective clients or collaborators
2. **Developer's playground** — explicitly called out in the About copy; the oracle card feature is a functional creative project, not a portfolio item

Primary audience: prospective clients scanning work + anyone who discovers the site organically. Secondary audience: Amanda herself, using the oracle feature as a live tool.

---

## Tech Stack & Why Each Tool Was Chosen

| Tool | Role | Why |
|---|---|---|
| Vue 3 (Composition API) | UI framework | — |
| Vite | Build tool | — |
| Vue Router | SPA routing | 3 routes: home, oracle, oracle-library |
| Pinia | State management | Manages deck state across oracle views |
| `@neodrag/vue` | Drag interaction | Powers card placement on the oracle table |
| SCSS | Styling | Variables, breakpoints, modular partials |
| Averia Serif Libre | Display typeface | Used for headings, nav links, card titles — the primary brand font |
| Open Sans | Body typeface | Used for metadata, descriptions, secondary text |

**`@neodrag/vue` contract:**
- Handles all drag translation for `OracleCard.vue`
- Does NOT determine whether a card is "placed" — that logic lives in `OracleView.vue` (`onDeckDragEnd`)
- offsetX/offsetY from neodrag are relative to the element's start position, NOT absolute screen coords — `OracleView` compensates by adding `deckRect` position
- Neodrag resets visually if `wrapper.position` hasn't changed — this is used intentionally as a drop rejection mechanism

---

## Design Philosophy

**Form follows function** — every visual element should serve a user task. Decoration is acceptable only when it reinforces the function of a feature (e.g., the card-fan hover animation on the nav icon communicates "this is a deck of cards" before the user clicks).

**Color token intent (critical — do not deviate):**

| Token | Value | Intent |
|---|---|---|
| `--primary` | `#c8ff00` | Interactive affordances ONLY — hover states, active borders, focus indicators, CTA elements. Never decorative. |
| `--dark` | `#1d161f` | Page backgrounds for oracle views |
| `--light` | `#e0e0e0` | Body text, secondary labels, inactive UI |
| `--glass` | `#000000ab` | Nav background (frosted glass effect with `backdrop-filter: blur`) |
| `--shadow` | `0 2px 8px rgb(104 104 104 / 200%)` | Drop shadows |

**Typeface intent:**

| Token | Font | Used for |
|---|---|---|
| `--serif-typeface` | Averia Serif Libre | All headings, nav links, card titles, section anchors — primary voice |
| `--sans-serif-typeface` | Open Sans | Metadata, gallery descriptions, modal detail text — supporting voice |

**Breakpoints (SCSS, em-based for accessibility):**

| Variable | Value | px equivalent |
|---|---|---|
| `$mobile-small` | `25em` | ~400px |
| `$tablet` | `37.5em` | ~600px |
| `$desktop` | `64em` | ~1024px |
| `$wide` | `90em` | ~1440px |

---

## Component Map

### Atomic (reused across views)

#### `MainNav.vue`
- **Used in:** `HomeView.vue`, `OracleView.vue`
- **Props:** `links` (Array, optional) — array of `{ label, href, type }` objects
  - `type: 'anchor'` — smooth scrolls within page (home sections)
  - `type: 'router'` — uses `<RouterLink>` for SPA navigation
  - `type: 'external'` — standard anchor with `handleNavClick`
- **Default links:** portfolio / about / contact anchor links (home page defaults)
- **Override in OracleView:** home + oracle-library router links
- **Fixed internal features (not configurable via props):**
  - Oracle card-fan icon always links to `/oracle` — hardcoded, not driven by `links` prop
  - Logo always links to `/home` — hardcoded
  - Mobile hamburger menu with animated X transition
  - Auto-closes menu on resize above 768px
- **Layout:** Fixed, `z-index: 100`, `height: 60px` (expands on mobile when open)
- **DO NOT** move the oracle icon or logo into the `links` prop — they are intentionally separate from the configurable link list

#### `ImageCarousel.vue`
- **Used in:** `HomeView.vue` (×3 — paintings, designs, websites)
- **Props:** `items` (Array, required), `category` (String, required: `'painting'` | `'design'` | `'website'`)
- **What `category` controls:** which class properties to display as metadata in grid + modal
  - `painting` → `medium`, `width`, `height` (formatted as `Medium W"×H"`)
  - `design` → `program`
  - `website` → `task`
- **Features:** gallery grid → modal lightbox with zoom (up to 4×), pan (drag when zoomed), keyboard navigation (←→ navigate, +/- zoom, 0 reset, Esc close)
- **Teleports modal to `<body>`** — important: modal is not scoped to the gallery container
- **DO NOT** add a fourth category without updating `itemMetadata` computed and the template ternary in the grid

#### `OracleCard.vue`
- **Used in:** `OracleView.vue` (two instances — deck stack and placed cards)
- **Props:** `wrapper` (Object, required), `draggable` (Boolean, default: true), `inDeck` (Boolean, default: false)
- **Wrapper shape** (from `Deck.js`):
  ```js
  { card: OracleCard, reversed: Boolean, faceDown: Boolean, placedAt: null, position: { x, y } }
  ```
- **`inDeck: true` behavior:** positions `relative` (stays inside `.deck-area`), drag origin is `(0,0)`
- **`inDeck: false` behavior:** positions `absolute` (free on `.play-area`), drag origin is `wrapper.position`
- **CSS flip mechanic:** `faceDown` → rotates `.card-inner` 180deg on Y. `reversed` → rotates front face 180deg on X (upside-down). These are independent transforms.
- **Click vs drag:** emits `flip` only if `isDragging` is false at click time — prevents accidental flips on drag release
- **Emits:** `flip(wrapper)`, `drag-end({ wrapper, x, y })`
- **Fixed dimensions:** `119px × 170px` — hardcoded, matches card image assets. Do not make responsive.

### Page-Specific

#### `OracleNav.vue`
- **Used in:** `OracleView.vue` footer only
- **No props** — purely an event emitter
- **Emits:** `shuffle(algorithm)`, `clear-table`, `reset`, `toggle-reversal`, `deal-spread(spreadName)`
- **Shuffle algorithms exposed:** `'riffle'`, `'overhand'`, `'fisher-yates'`, `'reset'`, `'cut'`
- **Spread names exposed:** `'past-present-future'`, `'celtic-cross'`, `'me-them-us'`
- **[IN FLUX]** Unstyled — `OracleNav` has no scoped CSS. The oracle footer UI is a known incomplete area.

---

## Data Model

### Class Hierarchy

```
OracleCard   — content only: link, title, subtitle, description
Painting     — link, name, year, medium, width, height
Design       — link, name, year, program
Website      — link, name, year, task
Deck         — wraps OracleCard[] into stateful wrapper objects
```

### Deck wrapper object (the unit passed to `OracleCard.vue`)
```js
{
  card: OracleCard,       // the content — never mutated
  reversed: Boolean,      // upside-down orientation
  faceDown: Boolean,      // face-down = back visible (initial state)
  placedAt: null,         // Intended for spread position labels (e.g. "Past", "Present", "Future")
                          // Labels render ABOVE the card, not overlaid — [IN FLUX: unimplemented]
  position: { x, y }     // absolute coords within .play-area
}
```

### Deck state pools
- `deck.cards[]` — unplaced cards (draw pile); top card is `cards[cards.length - 1]`
- `deck.placedCards[]` — cards on the table
- `deck.originalOrder[]` — immutable reference to initial card array (for reset)
- `deck.shuffleHistory[]` — array of `{ algorithm, timestamp }` records

---

## Store: `useCurrentDeckStore` (Pinia)

**Single store for the entire oracle session.**

| State | Type | Purpose |
|---|---|---|
| `currentDeck` | `ref(Deck)` | The active deck instance |
| `selectedCard` | `ref(wrapper\|null)` | Card shown in detail panel |
| `reversalMode` | `ref(Boolean)` | Whether shuffles can assign reversed orientation |
| `lastAlgorithm` | `ref(String)` | Persists shuffle choice across reset |

**Actions and what they own:**
- `shuffle(algorithm)` — runs shuffler, records to `shuffleHistory`, mutates `deck.cards`
- `reset()` — calls `clearTable()` then re-shuffles `originalOrder` with `lastAlgorithm`
- `flipCard(wrapper)` — toggles `wrapper.faceDown`
- `selectCard(wrapper)` / `clearSelection()` — drives the detail panel in `OracleView`
- `updateCardPosition(wrapper, x, y)` — called both by `OracleView` (on place) and by placed-card drag-end handlers

---

## Shuffle Utilities (`src/utils/shuffles/`)

Four named exports via `index.js`:

| Export | File | Algorithm type |
|---|---|---|
| `fisherYates` | `fisherYates.js` | Cryptographically uniform random |
| `riffle` | `riffle.js` | Simulates physical riffle shuffle |
| `overhand` | `overhand.js` | Simulates physical overhand shuffle |
| `cut` | `cut.js` | Simulates cutting the deck |

All shufflers receive `(cards[], reversalMode)` and return a new shuffled array.

**`reversal.js` — shared utility, not a shuffler:**
- Not exported from `index.js` by design — it is a helper consumed by the individual shuffle algorithms, not called directly by the store
- Exports `maybeReverse(wrapper, probability)` — returns a new wrapper object with `reversed` set based on a probability threshold (`Math.random() < probability`)
- The actual visual rotation is handled entirely in `OracleCard.vue` via the `.reversed` CSS class — `reversal.js` only sets the data flag
- Each shuffle algorithm controls its own reversal probability to simulate realistic physical shuffle behavior

---

## View Architecture

### `HomeView.vue` — `/`
- Single-page scroll: header (hero) → portfolio gallery → about → contact/footer
- `MainNav` uses default anchor links
- `ImageCarousel` used 3× with different data arrays and category strings
- Hero uses `Banner.jpg` + CSS gradient blend as background
- `<body>` used as root element in template — [INFERRED: likely a legacy pattern, may cause issues with Vue's expected single root]
- Contains a Cloudflare email obfuscation script tag inline in template — [INFERRED: carried over from static site, not a Vue pattern]

### `OracleView.vue` — `/oracle`
- Fixed-height viewport layout (`position: fixed`, grid with header/main/footer)
- Three spatial zones: `.deck-area` (bottom-left), `.play-area` (full area), `.card-selection` panel (bottom-right)
- Deck area hides when empty (`.hidden` class)
- Card placement logic lives entirely in `onDeckDragEnd` — checks absolute drop coords against `.play-area` bounds
- Spread dealing (`handleDealSpread`) pulls from `src/data/spreads.js` for preset positions
- `MainNav` receives router links override (home + oracle-library)
- Border colors in scoped CSS use raw hex values (`#28c02d`, `#7e28c0`, `#b1c028`) — **dev scaffolding only** (visibility aids during development). Remove before publishing; do not tokenize.

### `OracleLibrary.vue` — `/oracle-library`
- **[IN FLUX]** Stub — renders `<div>Oracle Library</div>` only. Planned but unbuilt.

---

## Reuse Rules & Intentional Exceptions

**Rules:**
- All interactive affordances (hover, active, focus borders) use `--primary` only
- All body text uses `--light`
- All headings use `--serif-typeface`; all metadata/detail text uses `--sans-serif-typeface`
- All responsive breakpoints use the SCSS em variables — never raw px in media queries
- Components receive data through props; they do not import data files directly (data flows from views)

**Intentional exceptions:**
- `MainNav` has two hardcoded internal links (oracle icon → `/oracle`, logo → `/home`) that do not go through the `links` prop — this is by design
- `OracleCard` has fixed pixel dimensions (119×170) — intentional, tied to card image assets
- Oracle view border colors are raw hex, not tokens — [VERIFY: intentional oracle-specific palette or oversight?]
- `gallery.scss` is a separate partial with its own scope — do not merge into `global.scss`

---

## In-Progress / In Flux

| Item | Status | Notes |
|---|---|---|
| `OracleLibrary.vue` | Stub | Unbuilt — likely intended to browse/reference card meanings |
| `OracleNav.vue` styling | Unstyled | No scoped CSS, inherits globals only |
| `oracle-cards.js` — `flow` card | Has inline comment `/* Write your own summary */` | Description present but flagged for revision |
| `oracle-cards.js` — `eddy` card | Has inline comment `/* Make distinct from zeal */` | Description present but flagged for revision |
| `wrapper.placedAt` | Unimplemented | Intended for spread position labels rendered **above** placed cards (not overlaid). Needs: label string written on `placeCard`, rendered in `OracleView` above each `OracleCard` in `.play-area` |
| Oracle view boundary borders | Dev scaffolding | Raw hex borders on `.oracle-main`, `.play-area`, `.card-selection` — remove before publishing |

---

## Definition of Done (by change type)

**Altering a reused component (`MainNav`, `ImageCarousel`, `OracleCard`):**
- Verify change works in ALL views that use the component
- No new props without default values
- No changes to CSS custom property names
- `MainNav`: do not touch oracle icon or logo link — those are hardcoded by design
- `OracleCard`: do not change dimensions — they are tied to image assets

**Adding a third-party library:**
- Wrap in a component or composable — consumers should not import the library directly
- Document in this file under Tech Stack with: role, why chosen, what it owns vs. what Vue owns
- Test for conflicts with `@neodrag/vue` if it touches drag, pointer events, or DOM position

**Adding new functionality:**
- Apply the form-follows-function test: what user task does this serve?
- Use `--primary` for any new interactive affordance
- Use existing SCSS breakpoint variables, never raw px in media queries
- If it touches oracle state, route through the Pinia store — no local state for shared oracle data
- If adding a new portfolio category to `ImageCarousel`, update `itemMetadata` computed AND the template ternary
