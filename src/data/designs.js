import Design from '../classes/Design.js'

// list of graphic design and illustration
const zenithbizcard = new Design(
  '/images/ZG Biz Card (2021).jpg',
  'ZG Business Card',
  '2021',
  'Photoshop, Illustrator, Photography',
)
const bmlogo = new Design(
  '/images/Brezza Marina Logo (2021).jpg',
  'BMD Logo',
  '2021',
  'Procreate, Illustrator',
)
const lnllogo = new Design(
  '/images/LNL Logo (2021).jpg',
  'LNL Logo',
  '2021',
  'Procreate and Illustrator',
)
const lnlpackaging = new Design(
  '/images/LNL Packaging (2020-2021).jpg',
  'LNL Packaging',
  '2020-2021',
  'Procreate, Photoshop, InDesign',
)
const gtmbizcard = new Design(
  '/images/GTM Business Card (2018).jpg',
  'GTM Business Card',
  '2018',
  'Inkscape, (Client\'s Artwork)',
)
const wintersbattle = new Design(
  '/images/Winter\'s Battle Event Poster (2018).jpg',
  'GTM Business Card',
  '2018',
  'Inkscape, (Client\'s Artwork)',
)

const designArray = [
  zenithbizcard,
  bmlogo,
  lnllogo,
  lnlpackaging,
  gtmbizcard,
  wintersbattle,
]

export default designArray
