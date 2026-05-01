// Defines the card layouts for each named spread.
//
// COORDINATE SYSTEM — important:
//   x and y are normalized values between 0.0 and 1.0.
//   They represent a fraction of the play-area's width/height.
//   OracleView.handleDealSpread() multiplies them by the
//   play-area's real pixel dimensions at deal-time, so spreads
//   always center correctly on any screen size.
//
//   Example: x: 0.5, y: 0.5 = center of the play-area always.
//
// ADDING A NEW SPREAD:
//   1. Add the key to SpreadName in types/oracle.ts
//   2. Add the entry here following the same shape
// ─────────────────────────────────────────────────────────────

import type { SpreadPosition, SpreadName } from '../types/oracle'

// Card dimensions in pixels — used to offset positions so cards
// are centered on their target point rather than top-left aligned.
// If the card size changes in OracleCard.vue, update these too.
const CARD_WIDTH = 119
const CARD_HEIGHT = 170

// Half-card offsets. Subtract these from a normalized pixel position
// to make the card's center land on the intended point.
// Used internally — see handleDealSpread in OracleView.vue.
export const CARD_HALF_W = CARD_WIDTH / 2 // 59.5
export const CARD_HALF_H = CARD_HEIGHT / 2 // 85

// ─── Spread definitions ───────────────────────────────────────
// Record<SpreadName, SpreadPosition[]> means TypeScript will error
// if a key is missing or misspelled relative to the SpreadName union.

export const spreads: Record<SpreadName, SpreadPosition[]> = {
  // Three cards in a horizontal row across the center of the play-area.
  // Represents the timeline of a situation.
  'past-present-future': [
    { label: 'Past', x: 0.25, y: 0.45 },
    { label: 'Present', x: 0.5, y: 0.45 },
    { label: 'Future', x: 0.75, y: 0.45 },
  ],

  // Ten-card layout. The Challenge card (index 1) shares the same
  // position as Present and is rotated 90° to cross it physically.
  // The right column (Advice → Outcome) reads bottom to top.
  'celtic-cross': [
    { label: 'Present', x: 0.35, y: 0.45 },
    { label: 'Challenge', x: 0.35, y: 0.45, rotate: 90 },
    { label: 'Past', x: 0.18, y: 0.45 },
    { label: 'Future', x: 0.52, y: 0.45 },
    { label: 'Above', x: 0.35, y: 0.2 },
    { label: 'Below', x: 0.35, y: 0.7 },
    { label: 'Advice', x: 0.75, y: 0.7 },
    { label: 'External', x: 0.75, y: 0.5 },
    { label: 'Hopes', x: 0.75, y: 0.3 },
    { label: 'Outcome', x: 0.75, y: 0.1 },
  ],

  // Three cards: two people and their relationship dynamic.
  'me-them-us': [
    { label: 'Me', x: 0.25, y: 0.45 },
    { label: 'Them', x: 0.75, y: 0.45 },
    { label: 'Us', x: 0.5, y: 0.45 },
  ],
}
