import Painting from '@/classes/Painting'
import type { PaintingData } from '@/types/portfolio'

const jack = new Painting('/images/portfolio/paintings/Jack (2021).jpg', 'Jack', '2021', 'Oil', 11, 14)
const zucchi = new Painting('/images/portfolio/paintings/Zucchi (2021).jpg', 'Zucchi', '2021', 'Oil', 8, 10)
const alexis = new Painting('/images/portfolio/paintings/Alexis (2020).jpg', 'Alexis', '2020', 'Oil', 11, 14)
const smokey = new Painting('/images/portfolio/paintings/Smokey (2019).jpg', 'Smokey', '2019', 'Oil', 12, 12)
const bandit = new Painting('/images/portfolio/paintings/Bandit (2019).jpg', 'Bandit', '2019', 'Oil', 12, 12)
const willy = new Painting('/images/portfolio/paintings/Willy (2019).jpg', 'Willy', '2019', 'Digital (Procreate)', 8, 10)

const paintingArray: PaintingData[] = [jack, zucchi, alexis, smokey, bandit, willy]

export default paintingArray
