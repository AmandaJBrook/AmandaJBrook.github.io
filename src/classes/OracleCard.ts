import type { OracleCardData } from '@/types/oracle'

// OracleCard is the construction-time representation of a card.
// It implements OracleCardData so it can be passed directly anywhere
// that interface is expected — no intermediate plain-object needed.
//
// Constructor argument order matches the existing call sites in
// oracle-cards.ts: (link, title, subtitle, description).

export default class OracleCard implements OracleCardData {
  readonly link: string
  readonly title: string
  readonly subtitle: string
  readonly description: string

  constructor(link: string, title: string, subtitle: string, description: string) {
    this.link = link
    this.title = title
    this.subtitle = subtitle
    this.description = description
  }
}
