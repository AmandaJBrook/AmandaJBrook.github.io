import Website from '@/classes/Website'
import type { WebsiteData } from '@/types/portfolio'

const brezzamarina = new Website(
  '/images/portfolio/websites/Brezza Marina Designs (2021-present).png',
  'Brezza Marina Designs',
  '2021-present',
  'https://brezzamarinadesigns.com', // replace with actual URL
  'Shopify development and calligraphy',
)

const webArray: WebsiteData[] = [brezzamarina]

export default webArray
