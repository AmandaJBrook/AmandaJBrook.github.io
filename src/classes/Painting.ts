import type { PaintingData } from '@/types/portfolio'

export default class Painting implements PaintingData {
  readonly link: string
  readonly name: string
  readonly year: string
  readonly medium: string
  readonly width: number  // inches
  readonly height: number // inches

  constructor(
    link: string,
    name: string,
    year: string,
    medium: string,
    width: number,
    height: number,
  ) {
    this.link = link
    this.name = name
    this.year = year
    this.medium = medium
    this.width = width
    this.height = height
  }
}
