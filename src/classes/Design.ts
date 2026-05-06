import type { DesignData } from '@/types/portfolio'

export default class Design implements DesignData {
  readonly link: string
  readonly name: string
  readonly year: string
  readonly program: string

  constructor(link: string, name: string, year: string, program: string) {
    this.link = link
    this.name = name
    this.year = year
    this.program = program
  }
}
