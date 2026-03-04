//Applies a probability of 180 degree rotation to the card images based on the type of algorithm used to shuffle the cards. The actual rotation is handled in the OracleCard component by applying a CSS class that rotates the card when the 'reversed' property is true.

export const maybeReverse = (wrapper, probability) => {
  return {
    ...wrapper,
    reversed: Math.random() < probability,
  }
}
