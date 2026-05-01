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
| TypeScript | Type safety | Incremental adoption — types defined in `src/types/oracle.ts`, consumed by oracle feature files |
| SCSS | Styling | Variables, breakpoints, modular partials |
| Averia Serif Libre | Display typeface | Used for headings, nav links, card titles — the primary brand font |
| Open Sans | Body typeface | Used for metadata, descriptions, secondary text |

**`@neodrag/vue` contract:**
- Handles all drag translation for `OracleCard.vue`
- Does NOT determine whether a card is "placed" — that logic lives in `OracleView.vue` (`onDeckDragEnd`)
- offsetX/offsetY from neodrag are relative to the element's start position, NOT absolute screen coords — `OracleView` compensates by adding `deckRect` position
- Neodrag resets visually if `wrapper.position` hasn't changed — this is used intentionally as a drop rejection mechanism
- `bounds` prop constrains placed cards to the `.play-area` element — passed from `OracleView`'s `playAreaRef` down to each placed `OracleCard` instance
- `draggableOptions` in `OracleCard` is a `computed()` — not a plain object — so that `bounds` (which is null until mount) is read reactively after the DOM resolves
- Deck card does NOT receive `bounds` — its drop zone is determined manually in `onDeckDragEnd`

**TypeScript adoption strategy:**
- Incremental — oracle feature files are converted first; home view and non-oracle components remain `.js` until a future session
- All shared oracle types live in `src/types/oracle.ts` — import from there, never redefine inline
- ESLint is configured with `@vue/eslint-config-typescript` to parse `<script lang="ts">` blocks in `.vue` files and `.ts` files
- Conversion order: `types/oracle.ts` → `spreads.ts` → `Deck.ts` → `currentDeck.ts` → `OracleCard.vue` → `OracleView.vue`

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
- **Language:** `<script setup lang="ts">`
- **Props** (typed via `defineProps<{}>()`):

  | Prop | Type | Default | Purpose |
  |---|---|---|---|
  | `wrapper` | `CardWrapper` | required | The stateful wrapper object for this card |
  | `draggable` | `boolean` | `true` | Set false to disable drag (reserved for future use) |
  | `inDeck` | `boolean` | `false` | True for the top deck card — changes positioning to relative |
  | `bounds` | `HTMLElement \| null` | `null` | The play-area element; constrains drag via neodrag bounds |

- **`inDeck: true` behavior:** positions `relative` (stays inside `.deck-area`), drag origin is `(0,0)`
- **`inDeck: false` behavior:** positions `absolute` (free on `.play-area`), drag origin is `wrapper.position`
- **CSS flip mechanic:** `faceDown` → rotates `.card-inner` 180deg on Y. `reversed` → rotates front face 180deg on X (upside-down). These are independent transforms.
- **Rotation mechanic:** `wrapper.rotation` (degrees) applied as inline `transform: rotate(Ndeg)` on the card root element. Used for the Celtic Cross Challenge card. Undefined for manually dragged cards — no transform applied.
- **Spread label:** `wrapper.label` renders in a `.card-label` div positioned below the card. Only visible for spread-dealt cards. Undefined for manually dragged cards — element not rendered.
- **Click vs drag:** emits `flip` only if `isDragging` is false at click time — prevents accidental flips on drag release
- **`draggableOptions` is `computed()`** — not a plain object. Required so that `bounds` (null at setup, resolves after mount) is read reactively.
- **Emits:** `flip(wrapper: CardWrapper)`, `drag-end({ wrapper, x, y }: DragEndPayload)`
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

### Type definitions (`src/types/oracle.ts`)

All oracle types are defined here. Import from this file — never redefine inline.

| Type | Kind | Purpose |
|---|---|---|
| `OracleCardData` | interface | Raw card content: `title`, `subtitle`, `description`, `link` |
| `CardWrapper` | interface | Stateful wrapper around a card — the unit passed to `OracleCard.vue` |
| `DragEndPayload` | interface | Shape of `OracleCard`'s `drag-end` emit: `{ wrapper, x, y }` |
| `SpreadPosition` | interface | One slot in a spread: `{ label, x, y, rotate? }` |
| `SpreadName` | type union | `'past-present-future' \| 'celtic-cross' \| 'me-them-us'` — must be updated when adding spreads |
| `ShuffleAlgorithm` | type union | `'riffle' \| 'overhand' \| 'fisher-yates' \| 'cut'` — must be updated when adding shufflers |

### Class Hierarchy

```
OracleCardData  — content only: link, title, subtitle, description  (interface in types/oracle.ts)
Painting        — link, name, year, medium, width, height
Design          — link, name, year, program
Website         — link, name, year, task
Deck            — wraps OracleCardData[] into stateful CardWrapper objects  (class in classes/Deck.ts)
```

### CardWrapper shape (the unit passed to `OracleCard.vue`)

```ts
{
  card: OracleCardData    // raw card content — never mutated
  faceDown: boolean       // true = back shown (initial state), false = front shown
  reversed: boolean       // true = card is upside-down (reversal reading)
  position: { x: number; y: number }  // pixels relative to top-left of .play-area
  label?: string          // spread position name (e.g. "Past", "Challenge")
                          // set by store.placeFromSpread(); undefined for manually dragged cards
  rotation?: number       // degrees of CSS rotation (e.g. 90 for Celtic Cross Challenge)
                          // set by store.placeFromSpread(); undefined for manually dragged cards
}
```

**Note:** `placedAt` has been removed — it was initialized but never written or read anywhere in the codebase. `label` and `rotation` replace the intent it was tracking.

### Deck state pools
- `deck.cards[]` — unplaced cards (draw pile); top card is `cards[cards.length - 1]`
- `deck.placedCards[]` — cards on the table, in placement order
- `deck.originalOrder[]` — immutable reference to initial card array (for reset)
- `deck.shuffleHistory[]` — array of `{ algorithm, timestamp }` records

---

## Store: `useCurrentDeckStore` (Pinia, `src/stores/currentDeck.ts`)

**Single store for the entire oracle session.**

| State | Type | Purpose |
|---|---|---|
| `currentDeck` | `ref(Deck)` | The active deck instance |
| `selectedCard` | `ref<CardWrapper \| null>` | Card shown in detail panel |
| `reversalMode` | `ref(boolean)` | Whether shuffles can assign reversed orientation |
| `lastAlgorithm` | `ref<ShuffleAlgorithm>` | Persists shuffle choice across reset |

**Actions and what they own:**

| Action | Signature | Purpose |
|---|---|---|
| `shuffle` | `(algorithm: ShuffleAlgorithm) => void` | Runs shuffler, records to `shuffleHistory`, mutates `deck.cards` |
| `reset` | `() => void` | Calls `clearTable()` then re-shuffles `originalOrder` with `lastAlgorithm` |
| `clearTable` | `() => void` | Returns all placed cards to draw pile, resets their visual state |
| `flipCard` | `(wrapper: CardWrapper) => void` | Toggles `wrapper.faceDown` |
| `selectCard` | `(wrapper: CardWrapper) => void` | Sets `selectedCard` — drives the detail panel |
| `clearSelection` | `() => void` | Clears `selectedCard` |
| `updateCardPosition` | `(wrapper, x, y) => void` | Sets `wrapper.position` — called on placed-card drag-end |
| `placeFromSpread` | `(wrapper, pos, pixelX, pixelY) => void` | Sets `position`, `label`, `rotation` atomically then calls `deck.placeCard()` |
| `setDeck` | `(name, cardsArray) => void` | Replaces the active deck — reserved for oracle library |

**Why `placeFromSpread` is separate from `updateCardPosition` + `placeCard`:**
Spread placement must set three fields (position, label, rotation) on the wrapper before it moves to `placedCards[]`, so OracleCard renders fully configured in one cycle. Calling them separately would risk a render between calls with a partially configured wrapper.

---

## Spread Data (`src/data/spreads.ts`)

**Coordinate system:** x and y are normalized values (0.0–1.0), representing a fraction of the play-area's width and height. `OracleView.handleDealSpread()` multiplies them by the play-area's real pixel dimensions at deal-time so spreads always center correctly on any screen size.

**Centering:** `CARD_HALF_W` (59.5px) and `CARD_HALF_H` (85px) are exported from `spreads.ts` and subtracted in `handleDealSpread` so each card's center lands on the intended position point, not its top-left corner.

**Adding a new spread:**
1. Add the key to `SpreadName` in `src/types/oracle.ts`
2. Add the entry to `spreads` in `src/data/spreads.ts` using normalized coordinates
3. Expose the spread name from `OracleNav.vue`

**Current spreads:**

| Key | Cards | Notes |
|---|---|---|
| `'past-present-future'` | 3 | Horizontal row, center of play-area |
| `'celtic-cross'` | 10 | Challenge card shares position with Present, `rotate: 90` |
| `'me-them-us'` | 3 | Horizontal row, center of play-area |

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
- **Language:** `<script setup lang="ts">`
- Fixed-height viewport layout (`position: fixed`, grid with header/main/footer)
- Three spatial zones: `.deck-area` (bottom-left), `.play-area` (full area), `.card-selection` panel (bottom-right)
- Deck area hides when empty (`.hidden` class)
- **Element refs:**
  - `playAreaRef: Ref<HTMLElement | null>` — passed to placed `OracleCard` instances as the neodrag `bounds` element; also used in `handleDealSpread` for coordinate conversion
  - `deckAreaRef: Ref<HTMLElement | null>` — used in `onDeckDragEnd` to get the deck's screen position; replaces the previous `querySelector('.deck-area')` call
- **`onDeckDragEnd`** — null-checks both refs before proceeding; converts neodrag's offset coords to play-area-relative coords using `deckAreaRef` + `playAreaRef` bounding rects
- **`handleDealSpread`** — converts normalized spread coords to real pixels using `playAreaRef.getBoundingClientRect()`; calls `store.placeFromSpread()` per card
- Spread position label shown in `.card-selection` detail panel as the subheading when `wrapper.label` is set; falls back to `card.subtitle` for manually drawn cards
- `MainNav` receives router links override (home + oracle-library)
- Border colors in scoped CSS use raw hex values (`#28c02d`, `#7e28c0`, `#b1c028`) — **dev scaffolding only**. Remove before publishing; do not tokenize.

### `OracleLibrary.vue` — `/oracle-library`
- **[IN FLUX]** Stub — renders `<div>Oracle Library</div>` only. Planned but unbuilt.

---

## ESLint Configuration (`eslint.config.js`)

Uses ESLint flat config format. TypeScript support added via `@vue/eslint-config-typescript`:

```js
import vueTsEslintConfig from '@vue/eslint-config-typescript'
// ...
...vueTsEslintConfig()
```

Files glob includes `ts`: `**/*.{js,mjs,jsx,ts,vue}` — covers all oracle TypeScript files.

**If the ESLint server doesn't pick up changes immediately:** `Cmd+Shift+P` → `ESLint: Restart ESLint Server` in VS Code.

---

## Reuse Rules & Intentional Exceptions

**Rules:**
- All interactive affordances (hover, active, focus borders) use `--primary` only
- All body text uses `--light`
- All headings use `--serif-typeface`; all metadata/detail text uses `--sans-serif-typeface`
- All responsive breakpoints use the SCSS em variables — never raw px in media queries
- Components receive data through props; they do not import data files directly (data flows from views)
- All shared oracle types are defined in `src/types/oracle.ts` — never redefined inline in components or stores

**Intentional exceptions:**
- `MainNav` has two hardcoded internal links (oracle icon → `/oracle`, logo → `/home`) that do not go through the `links` prop — this is by design
- `OracleCard` has fixed pixel dimensions (119×170) — intentional, tied to card image assets
- Oracle view border colors are raw hex, not tokens — dev scaffolding only, remove before publishing
- `gallery.scss` is a separate partial with its own scope — do not merge into `global.scss`
- Home view and non-oracle components remain plain `.js` — TypeScript adoption is intentionally incremental

---

## In-Progress / In Flux

| Item | Status | Notes |
|---|---|---|
| `OracleLibrary.vue` | Stub | Unbuilt — likely intended to browse/reference card meanings |
| `OracleNav.vue` styling | Unstyled | No scoped CSS, inherits globals only |
| `oracle-cards.js` — `flow` card | Has inline comment `/* Write your own summary */` | Description present but flagged for revision |
| `oracle-cards.js` — `eddy` card | Has inline comment `/* Make distinct from zeal */` | Description present but flagged for revision |
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
- If adding a new spread, update `SpreadName` in `types/oracle.ts`, add entry to `spreads.ts`, expose from `OracleNav.vue`
- If adding a new shuffle algorithm, update `ShuffleAlgorithm` in `types/oracle.ts`, add to `shufflers` map in `currentDeck.ts`, expose from `OracleNav.vue`
