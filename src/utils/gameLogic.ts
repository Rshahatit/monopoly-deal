import type { Schema } from "../../amplify/data/resource"
import type { BaseCard, Property } from "./types"

interface PropertySet {
  color: string
  cards: Property[]
  isComplete: boolean
}

// export const organizeProperties = (cards: Property[]): PropertySet[] => {
//   const setsByColor: { [key: string]: PropertySet } = {}

//   cards.forEach((card) => {
//     if (card.type === "property" && card.color) {
//       if (!setsByColor[card.color]) {
//         setsByColor[card.color] = {
//           color: card.color,
//           cards: [],
//           isComplete: false,
//         }
//       }
//       setsByColor[card.color].cards.push(card)
//     }
//   })

//   // Check completeness for each set
//   Object.values(setsByColor).forEach((set) => {
//     set.isComplete = isSetComplete(set.cards, set.cards[0].color)
//   })

//   return Object.values(setsByColor)
// }

export const canPlayCard = (
  card: BaseCard,
  gameState: Schema["Game"]["type"],
  playerState: Schema["PlayerGameState"]["type"],
  isCurrentPlayer: boolean
): boolean => {
  if (!isCurrentPlayer) return false

  switch (card.type) {
    case "property":
      return true // Can always play properties on your turn
    case "money":
      return true // Can always play money on your turn
    case "action":
      // Some action cards might have specific conditions
      switch (card.name) {
        case "Just Say No":
          // Can be played in response to certain actions even when not your turn
          return true
        default:
          return isCurrentPlayer
      }
    default:
      return false
  }
}

export const calculatePropertyValue = (propertySet: PropertySet): number => {
  if (!propertySet.isComplete) {
    return propertySet.cards.reduce((sum, card) => sum + card.value, 0)
  }

  // Complete sets are worth more
  const baseValue = propertySet.cards.reduce((sum, card) => sum + card.value, 0)
  const multiplier = propertySet.cards.some((card) =>
    card.name.includes("House")
  )
    ? 2
    : 1
  return baseValue * multiplier
}

// TODO COME FIX THIS
// export const isGameWon = (
//   playerState: Schema["PlayerGameState"]["type"]
// ): boolean => {

//   const propertySets = organizeProperties(
//     playerState.properties
//       .filter((cardId): cardId is string => cardId !== null)
//       .map((cardId) => getCardById(cardId) as Property)
//   )

//   // Need 3 complete property sets to win
//   const completeSetCount = propertySets.filter((set) => set.isComplete).length
//   return completeSetCount >= 3
// }
