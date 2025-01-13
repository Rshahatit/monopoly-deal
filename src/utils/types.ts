// Card Types
export type CardType =
  | "property"
  | "money"
  | "action"
  | "rent"
  | "property_wildcard"
  | "unknown"

// Base Card Interface
export interface BaseCard {
  id: string
  type: CardType
  name: string
  value: number
  count: number
}

// Property Colors
export type PropertyColor =
  | "brown"
  | "lightBlue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "railroad"
  | "utility"

// Property Card
export interface Property extends BaseCard {
  type: "property"
  color: PropertyColor
}

// Money Card
export interface Money extends BaseCard {
  type: "money"
}

// Action Card
export interface Action extends BaseCard {
  type: "action"
  description: string
}

// Rent Card
export interface Rent extends BaseCard {
  type: "rent"
  colors: PropertyColor[] | "all"
}

// Property Wildcard
export interface PropertyWildcard extends BaseCard {
  type: "property_wildcard"
  colors: PropertyColor[] | "all"
}

// Union type for all card types
export type Card = Property | Money | Action | Rent | PropertyWildcard

// Property Set Definition
export interface PropertySet {
  name: string
  count: number
  rentValues: number[]
}

// Property Sets Map
export type PropertySets = Record<PropertyColor, PropertySet>

// Card Collection Types
export interface CardCollection {
  [key: string]: Card
}

// Game Actions
export type GameActionType = "draw" | "play" | "discard" | "stack"

// Move Type
export interface Move {
  type: GameActionType
  cardIds: string[]
  timestamp: string
  targetPlayerId?: string
}

// Player State
export interface PlayerState {
  hand: string[]
  properties: string[]
  bank: string[]
  isCreator: boolean
}

// Helper type for card lookup
export type CardLookup = {
  [K in CardType]: {
    [id: string]: Extract<Card, { type: K }>
  }
}
