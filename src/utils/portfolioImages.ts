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
  '/public/images/portfolio/**/*.{jpg,jpeg,png,webp}',
  { query: '?lqip', import: 'default', eager: true },
)

// `link` is the path the portfolio data already uses, e.g.
// '/images/portfolio/paintings/Willy (2019).jpg'. It maps onto the same
// path under src/assets, so the data doesn't need to change.
//
// If no matching file is found, this falls back to the link as-is (no
// placeholder), so an image that hasn't been moved yet still loads from
// /public exactly as before.
export function getPortfolioImage(link: string): PortfolioImage {
  return images[`/public/images/portfolio${link}`] ?? { src: link }
}
