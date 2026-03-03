export const spreads = {
  'past-present-future': [
    { label: 'Past', x: 50, y: 100 },
    { label: 'Present', x: 200, y: 100 },
    { label: 'Future', x: 350, y: 100 },
  ],
  'celtic-cross': [
    { label: 'Present', x: 200, y: 200 },
    { label: 'Challenge', x: 200, y: 200, rotate: 90 }, // crosses center
    { label: 'Past', x: 50, y: 200 },
    { label: 'Future', x: 350, y: 200 },
    { label: 'Above', x: 200, y: 50 },
    { label: 'Below', x: 200, y: 350 },
    { label: 'Advice', x: 500, y: 350 },
    { label: 'External', x: 500, y: 250 },
    { label: 'Hopes', x: 500, y: 150 },
    { label: 'Outcome', x: 500, y: 50 },
  ],
  'me-them-us': [
    { label: 'Me', x: 50, y: 100 },
    { label: 'Them', x: 350, y: 100 },
    { label: 'Us', x: 200, y: 100 },
  ],
}
