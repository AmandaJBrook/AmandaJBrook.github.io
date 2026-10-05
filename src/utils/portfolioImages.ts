// Looks up the bundled version of a portfolio image, including its tiny
// blurred placeholder (from vite-plugin-lqip).
//
// vite-plugin-lqip only works on images that are imported through Vite —
// files sitting in /public are never seen by it. So the portfolio images
// live in src/assets/images/portfolio/ (mirroring the old public path),
// and this glob imports every one of them with ?lqip in a single line,
// instead of writing one import per image.
//
// Each entry is { src, lqip, width, height }:
//   src    the final (hashed) URL of the full-size image
//   lqip   the blurred placeholder, embedded as a data URL
//   width / height   the original image's pixel size, used to reserve
//                    the right amount of space before the image loads

export interface PortfolioImage {
  src: string
  lqip?: string
  width?: number
  height?: number
}

const images = import.meta.glob<PortfolioImage>(
  '/src/assets/images/portfolio/**/*.{jpg,jpeg,png,webp}',
  { query: '?lqip', import: 'default', eager: true },
)

// `link` matches the glob key, e.g.
// '/src/assets/images/portfolio/paintings/Willy (2019).jpg'.
//
// Vite replaces the matching entry with its hashed production URL.
export function getPortfolioImage(link: string): PortfolioImage {
  return images[link] ?? { src: link }
}
