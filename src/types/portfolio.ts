// Single source of truth for portfolio item types.
// Mirrors oracle.ts in structure — import from here, never
// redefine these shapes inline in components or data files.
//
// Conversion order this file unlocks:
//   1. Design.ts    (implements DesignData)
//   2. Painting.ts  (implements PaintingData)
//   3. Website.ts   (implements WebsiteData)
//   4. designs.ts   (exports DesignData[])
//   5. paintings.ts (exports PaintingData[])
//   6. websites.ts  (exports WebsiteData[])
//   7. ImageCarousel.vue (props typed against these interfaces)
// ─────────────────────────────────────────────────────────────

// ─── Design ───────────────────────────────────────────────────
// Graphic design and illustration portfolio items.
// 'program' is a free-form string listing the tools used
// (e.g. 'Photoshop, Illustrator').
export interface DesignData {
  link: string
  name: string
  year: string
  program: string
}

// ─── Painting ─────────────────────────────────────────────────
// Painting and traditional illustration portfolio items.
// width and height are physical dimensions in inches.
export interface PaintingData {
  link: string
  name: string
  year: string
  medium: string
  width: number
  height: number
}

// ─── Website ──────────────────────────────────────────────────
// Web design and development portfolio items.
// 'url' is the live site link. 'task' describes the scope of work
// (e.g. 'Shopify development', 'maintenance', 'graphics').
export interface WebsiteData {
  link: string
  name: string
  year: string
  url: string
  task: string
}
