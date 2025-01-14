import { client } from "./utils"
import { shuffleArray } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(event: any) {
  const { playerId } = JSON.parse(event.body)

  try {
    // Generate initial game state
    const gameId = `game_${Date.now()}`
    const initialDeck = generateInitialDeck()

    // Create game
    const game = await client.models.Game.create({
      id: gameId,
      status: "waiting",
      playerIds: [playerId],
      currentPlayerId: playerId,
      currentPlayerIndex: 0,
      deck: initialDeck,
      discardPile: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Create player game state
    await client.models.PlayerGameState.create({
      playerId,
      gameId,
      hand: [],
      properties: [],
      bank: [],
      isActive: true,
      isCreator: true,
    })

    // Update player record
    await client.models.Player.update({
      id: playerId,
      currentGameId: gameId,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        gameId,
        game,
      }),
    }
  } catch (error) {
    console.error("Error creating game:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating game" }),
    }
  }
}

// Helper function to generate initial deck of card IDs
function generateInitialDeck(): string[] {
  // This should match your frontend card definitions
  const deck: string[] = []
  // Add your card generation logic here
  return shuffleArray(deck)
}
