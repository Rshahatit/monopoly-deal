import { client } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(event: any) {
  const { gameId, playerId } = JSON.parse(event.body)
  const MAX_PLAYERS = 4

  try {
    // Get current game state
    const game = await client.models.Game.get({ id: gameId })
    if (!game || !game.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    // Check if game is joinable
    if (game.data.status !== "waiting") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Game is not accepting new players" }),
      }
    }

    if (game.data.playerIds.length >= MAX_PLAYERS) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Game is full" }),
      }
    }

    // Create player game state
    await client.models.PlayerGameState.create({
      playerId,
      gameId,
      hand: [],
      properties: [],
      bank: [],
      isActive: true,
      isCreator: game.data.playerIds.length === 0,
    })

    // Update game with new player
    const updatedGame = await client.models.Game.update({
      id: gameId,
      playerIds: [...game.data.playerIds, playerId],
    })

    return {
      statusCode: 200,
      body: JSON.stringify(updatedGame),
    }
  } catch (error) {
    console.error("Error joining game:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error joining game" }),
    }
  }
}
