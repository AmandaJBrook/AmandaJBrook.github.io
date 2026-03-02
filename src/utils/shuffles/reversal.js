//Applies a 180 degree rotation to the card images based on the type of algorithm used to shuffle the cards.

export const maybeReverse = (wrapper, probability) => {
  return {
    ...wrapper,
    reversed: Math.random() < probability,
  }
}
