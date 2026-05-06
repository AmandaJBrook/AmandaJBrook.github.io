import type { WebsiteData } from '@/types/portfolio'

export default class Website implements WebsiteData {
  readonly link: string
  readonly name: string
  readonly year: string
  readonly url: string
  readonly task: string

  constructor(link: string, name: string, year: string, url: string, task: string) {
    this.link = link
    this.name = name
    this.year = year
    this.url = url
    this.task = task
  }
}
