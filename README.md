# Amanda Brook — Portfolio & Oracle

**Live site:** [https://amandajbrook.github.io/]

Personal portfolio and interactive oracle card reading app built with Vue 3. Serves as both a client-facing showcase and a developer's playground.

Unless a specific credit is given, the artwork on this site was created by Amanda Brook. The homepage imagery is a work in progress and will be updated as pieces are refined. The `star.gif` is a temporary exception that is planned to be replaced with an original animation. Oracle card artwork and written meanings are also in progress; the current writing is rough-draft or generated placeholder text, not finished guidance.

## Features

- Portfolio gallery with zoom, pan, and keyboard navigation across three categories (painting, graphic design, web development)
- Draggable oracle card reading experience with multiple shuffle algorithms (riffle, overhand, Fisher-Yates, cut)
- Reversal mode for upright/reversed card orientations
- Preset spread layouts (Past · Present · Future, Celtic Cross, Me · Them · Us)
  - Cards deal to screen-size-aware positions — spreads always center correctly regardless of viewport
  - Spread position labels displayed on each placed card (e.g. "Past", "Challenge")
  - Rotation support for specific spread positions (e.g. Celtic Cross Challenge card crosses at 90°)
- Drag boundary enforcement — placed cards cannot be dragged outside the play area
- Responsive layout with animated mobile navigation
- Motion-driven hero and parallax effects on the homepage
- Dedicated portfolio route for painting, graphic design, and web projects

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) for oracle session state
- [@neodrag/vue](https://www.neodrag.dev/) for card drag interaction
- [Motion for Vue](https://motion.dev/) for scroll-linked and entrance animations
- TypeScript — incremental adoption, oracle feature files converted first
- SCSS with CSS custom properties for theming

## Project Structure

```
src/
├── assets/          Bundled fonts and local image assets
├── classes/         Data models (OracleCard, Deck, Painting, Design, Website)
├── components/      Reusable UI components (navigation, carousel, oracle cards)
├── data/            Portfolio and oracle content, plus spread layouts
├── router/          Home, portfolio, oracle, library, and not-found routes
├── stores/          Pinia store — oracle deck state
├── types/           Shared TypeScript interfaces
├── utils/shuffles/  Shuffle algorithm implementations
└── views/           Home, portfolio gallery, oracle, library, and not-found pages
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize Configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Type Check

```sh
npm run type-check
```

## In Progress

- Homepage artwork and imagery are being refined and will be updated over time.
- Oracle card artwork and written content are works in progress; current meanings are rough drafts or generated placeholder text.
- The `star.gif` is temporary and is planned to be replaced by an original animation.
- Oracle Library currently displays a Coming Soon page.
