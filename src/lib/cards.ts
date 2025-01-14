import { Card, PropertyColor } from "../types/game"

export const PROPERTY_COLORS: Record<
  PropertyColor,
  { name: string; hex: string }
> = {
  brown: { name: "Brown", hex: "#8B4513" },
  blue: { name: "Blue", hex: "#0000FF" },
  green: { name: "Green", hex: "#008000" },
  yellow: { name: "Yellow", hex: "#FFD700" },
  red: { name: "Red", hex: "#FF0000" },
  orange: { name: "Orange", hex: "#FFA500" },
  pink: { name: "Pink", hex: "#FFC0CB" },
  lightBlue: { name: "Light Blue", hex: "#87CEEB" },
  railroad: { name: "Railroad", hex: "#000000" },
  utility: { name: "Utility", hex: "#808080" },
}

export const PROPERTIES: Card[] = [
  {
    id: "boardwalk",
    type: "property",
    name: "Boardwalk",
    value: 4,
    color: "blue",
  },
  {
    id: "park-place",
    type: "property",
    name: "Park Place",
    value: 4,
    color: "blue",
  },
  // Add more properties...
]

export const ACTION_CARDS: Card[] = [
  { id: "deal-breaker", type: "action", name: "Deal Breaker", value: 5 },
  { id: "just-say-no", type: "action", name: "Just Say No", value: 4 },
  // Add more action cards...
]

export const MONEY_CARDS: Card[] = [
  { id: "10m-1", type: "money", name: "10M", value: 10 },
  { id: "5m-1", type: "money", name: "5M", value: 5 },
  // Add more money cards...
]

export const createDeck = (): Card[] => {
  const deck = [...PROPERTIES, ...ACTION_CARDS, ...MONEY_CARDS]
  return shuffle(deck)
}

const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// helper to get card object by id
export const getCardById = (cardId: string): Card => {
  const allCards = [...PROPERTIES, ...ACTION_CARDS, ...MONEY_CARDS]
  const card = allCards.find((card) => card.id === cardId)
  if (!card) {
    throw new Error(`Card with id ${cardId} not found`)
  }
  return card
}
