import React, { FC } from "react"
import { Schema } from "../../amplify/data/resource"
import { generateClient } from "@aws-amplify/api"
import { createDeck, dealInitialHands } from "../utils/CardDeck"
import type { BaseCard } from "../utils/types"

// Types
interface StartGameButtonProps {
  gameId: string
  playerIds: string[]
  onGameStarted?: () => void
}

interface GameState {
  status: "waiting" | "active" | "completed"
  currentTurn: string
  deck: BaseCard[]
  players: {
    [playerId: string]: {
      hand: BaseCard[]
      properties: BaseCard[]
      money: BaseCard[]
    }
  }
}

const client = generateClient<Schema>()

// Game initialization function
export async function initializeNewGame(gameId: string, playerIds: string[]) {
  // Create and shuffle deck
  const deck = createDeck()

  // Deal 5 cards to each player
  const playerHands = dealInitialHands(deck, playerIds.length, 5)

  // Create initial game state
  const initialState: GameState = {
    status: "active",
    currentTurn: playerIds[0],
    deck: deck.slice(playerIds.length * 5), // Remove dealt cards
    players: {},
  }

  // Initialize player hands
  playerIds.forEach((playerId, index) => {
    initialState.players[playerId] = {
      hand: playerHands[index],
      properties: [],
      money: [],
    }
  })

  // Update game in database
  await client.models.Game.update({
    id: gameId,
    ...initialState,
    lastUpdated: new Date().toISOString(),
  })

  return initialState
}

// Start Game Button Component
export const StartGameButton: React.FC<StartGameButtonProps> = ({
  gameId,
  playerIds,
  onGameStarted,
}) => {
  const handleStartGame = async () => {
    try {
      await initializeNewGame(gameId, playerIds)
      onGameStarted?.()
    } catch (error) {
      console.error("Failed to start game:", error)
    }
  }

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleStartGame}
        disabled={playerIds.length < 2 || playerIds.length > 5}
      >
        {playerIds.length < 2 ? "Need at least 2 players" : "Start Game"}
      </button>
    </>
  )
}
