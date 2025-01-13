import { getAllCards, PROPERTY_SETS } from "./cardDefinitions"
import { PropertyColor } from "./types"

/**
 * Creates a new deck with unique IDs for each card instance
 */
export function createDeck(): string[] {
  const allCards = getAllCards()
  const deck: string[] = []

  // Add all cards based on their count
  Object.values(allCards).forEach((cardDef) => {
    for (let i = 0; i < cardDef.count; i++) {
      deck.push(cardDef.id)
    }
  })

  return shuffleDeck(deck)
}

/**
 * Shuffles an array of card IDs using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deals initial hands to players
 */
export function dealInitialHands(
  deck: string[],
  playerCount: number
): {
  hands: string[][]
  remainingDeck: string[]
} {
  if (playerCount < 2 || playerCount > 5) {
    throw new Error("Player count must be between 2 and 5")
  }

  const shuffledDeck = shuffleDeck([...deck])
  const hands: string[][] = Array(playerCount)
    .fill(null)
    .map(() => [])

  // Deal 5 cards to each player
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < playerCount; j++) {
      if (shuffledDeck.length > 0) {
        const card = shuffledDeck.pop()!
        hands[j].push(card)
      }
    }
  }

  return {
    hands,
    remainingDeck: shuffledDeck,
  }
}

/**
 * Calculates rent for a property set
 */
export function calculateRent(
  properties: string[],
  color: PropertyColor,
  hasHouse: boolean = false,
  hasHotel: boolean = false
): number {
  const propertySet = PROPERTY_SETS[color]
  const propertyCount = properties.length

  if (propertyCount === 0) return 0

  const rentIndex = Math.min(
    propertyCount - 1,
    propertySet.rentValues.length - 1
  )
  let rent = propertySet.rentValues[rentIndex]

  if (hasHouse) rent += 3
  if (hasHotel && hasHouse) rent += 4

  return rent
}

/**
 * Validates if a set of properties is complete
 */
export function isSetComplete(
  properties: string[],
  color: PropertyColor
): boolean {
  return properties.length >= PROPERTY_SETS[color].count
}

/**
 * Gets the total value of cards (for bank calculations)
 */
export function getTotalValue(cardIds: string[]): number {
  const allCards = getAllCards()
  return cardIds.reduce((total, cardId) => {
    const card = allCards[cardId]
    return total + (card?.value || 0)
  }, 0)
}
