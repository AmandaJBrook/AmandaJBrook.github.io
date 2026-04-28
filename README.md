# Amanda Brook — Portfolio & Oracle

**Live site:** [https://amandajbrook.github.io/]

Personal portfolio and interactive oracle card reading app built with Vue 3. Serves as both a client-facing showcase and a developer's playground.

## Features

- Portfolio gallery with zoom, pan, and keyboard navigation across three categories (painting, graphic design, web development)
- Draggable oracle card reading experience with multiple shuffle algorithms (riffle, overhand, Fisher-Yates, cut)
- Reversal mode for upright/reversed card orientations
- Preset spread layouts (Past · Present · Future, Celtic Cross, Me · Them · Us)
- Responsive layout with animated mobile navigation

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) for oracle session state
- [@neodrag/vue](https://www.neodrag.dev/) for card drag interaction
- SCSS with CSS custom properties for theming

## Project Structure

```
src/
├── classes/         Data models (OracleCard, Deck, Painting, Design, Website)
├── components/      Reusable UI components (MainNav, ImageCarousel, OracleCard, OracleNav)
├── data/            Static content arrays
├── stores/          Pinia store — oracle deck state
├── utils/shuffles/  Shuffle algorithm implementations
└── views/           Page-level components (Home, OracleView, OracleLibrary)
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

## In Progress

- Oracle Library — card reference and meaning browser
- Spread position labels for placed cards
