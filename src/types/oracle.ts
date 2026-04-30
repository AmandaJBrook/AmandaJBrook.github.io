// Single source of truth for every shared type in the Oracle
// feature. Import from here — never redefine these shapes
// inline in components or stores.
// Conversion order this file unlocks:
//   1. spreads.ts  (uses SpreadPosition)
//   2. Deck.ts     (uses OracleCardData, CardWrapper)
//   3. currentDeck.ts (uses CardWrapper, SpreadPosition)
//   4. OracleCard.vue (uses CardWrapper, DragEndPayload)
//   5. OracleView.vue (uses CardWrapper, DragEndPayload, SpreadName)
// ─────────────────────────────────────────────────────────────

// ─── Raw card data ────────────────────────────────────────────
// Matches the shape of objects in oracle-cards.js.
// 'link' is the image path used by OracleCard's <img> tag.
export interface OracleCardData {
  title: string
  subtitle: string
  description: string
  link: string
}
// ─── Card wrapper ─────────────────────────────────────────────
// The Deck class wraps every raw OracleCardData in this object
// so the card's game state (position, orientation, label, etc.)
// can be tracked separately from the card's static data.

// Cards start in Deck.cards[] and move to Deck.placedCards[]
// when placed on the table — either by dragging from the deck
// or via a spread deal. The wrapper travels with the card
// through both arrays, so all fields must be initialized at
// construction time in the Deck constructor.

// Optional fields (label, rotation) are only set when a card
// is placed as part of a spread. Manually dragged cards leave
// these undefined, and OracleCard renders nothing extra.
export interface CardWrapper {
  card: OracleCardData

  // Visual state
  faceDown: boolean // true = back shown, false = front shown
  reversed: boolean // true = card is upside-down (reversal reading)

  // Position in pixels relative to the top-left of .play-area.
  // Initialized to { x: 0, y: 0 } in Deck constructor.
  // Updated by store.updateCardPosition() and store.placeFromSpread().
  position: { x: number; y: number }

  // Set by store.placeFromSpread() when a spread is dealt.
  // Displayed as a positional label on the card (e.g. "Past", "Challenge").
  // Undefined for cards placed by manual drag.
  label?: string

  // Rotation in degrees. Only non-zero for specific spread positions
  // (e.g. the Challenge card in the Celtic Cross, which crosses the
  // Present card at 90°). Applied as CSS transform: rotate(Ndeg).
  // Undefined for manually dragged cards.
  rotation?: number
}

// ─── Drag event payload ───────────────────────────────────────
// Emitted by OracleCard's 'drag-end' event.
// x and y are neodrag's offsetX/offsetY — pixels relative to
// where the drag began, not to the play-area or viewport.
// OracleView.onDeckDragEnd() converts these to play-area coords.

export interface DragEndPayload {
  wrapper: CardWrapper
  x: number
  y: number
}

// ─── Spread position ──────────────────────────────────────────
// One card's slot in a spread layout, as defined in spreads.ts.
//
// x and y are NORMALIZED values between 0 and 1, representing
// a fraction of the play-area's width and height respectively.
// They are converted to real pixels at deal-time in OracleView
// using the play-area element's getBoundingClientRect().
//
// Example: x: 0.5, y: 0.5 always means the center of the
// play-area regardless of screen size.
//
// label:  the positional name shown on the placed card.
// rotate: optional CSS rotation in degrees (e.g. 90 for the
//         Celtic Cross Challenge card that crosses the center).

export interface SpreadPosition {
  label: string
  x: number
  y: number
  rotate?: number
}

// ─── Spread name ─────────────────────────────────────────────
// Derived directly from the keys of the spreads object in
// spreads.ts. Using keyof typeof spreads here would create a
// circular import, so SpreadName is defined as a plain union.
// If you add a new spread to spreads.ts, add its key here too.

export type SpreadName = 'past-present-future' | 'celtic-cross' | 'me-them-us'

// ─── Shuffle algorithm ────────────────────────────────────────
// Keys of the shufflers map in currentDeck.ts.
// Adding a new shuffle utility requires adding its key here.

export type ShuffleAlgorithm = 'riffle' | 'overhand' | 'fisher-yates' | 'cut'
