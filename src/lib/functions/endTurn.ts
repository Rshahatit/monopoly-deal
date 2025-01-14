import { client } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(event: any) {
  const { gameId, playerId } = JSON.parse(event.body)

  try {
    // Get current game state
    const game = await client.models.Game.get({ id: gameId })
    if (!game) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    // Get current player state
    const playerState = await client.models.PlayerGameState.list({
      filter: {
        gameId: { eq: gameId },
        playerId: { eq: playerId },
      },
    })
    if (!playerState) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Player state not found" }),
      }
    }

    // Validate player's turn
    if (!game.data || game.data.currentPlayerId !== playerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Not your turn" }),
      }
    }

    // Check if player has too many cards
    if (!playerState.data || playerState.data[0].hand.length > 7) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Must discard down to 7 cards" }),
      }
    }

    // Find next active player
    const playerIndex = game.data.playerIds.indexOf(playerId)
    let nextPlayerIndex = (playerIndex + 1) % game.data.playerIds.length
    let nextPlayerId = game.data.playerIds[nextPlayerIndex]
    let nextPlayerIsActive = true

    // Keep looking for next active player
    while (nextPlayerIndex !== playerIndex) {
      if (!nextPlayerId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Player not found" }),
        }
      }
      const nextPlayerState = await client.models.PlayerGameState.list({
        filter: {
          gameId: { eq: gameId },
          playerId: { eq: nextPlayerId },
        },
      })

      if (nextPlayerState?.data && nextPlayerState.data[0].isActive) {
        nextPlayerIsActive = true
        break
      }

      nextPlayerIndex = (nextPlayerIndex + 1) % game.data.playerIds.length
      nextPlayerId = game.data.playerIds[nextPlayerIndex]
    }

    // If no active players found, current player wins
    if (!nextPlayerIsActive) {
      const updatedGame = await client.models.Game.update({
        id: gameId,
        status: "completed",
        winner: playerId,
      })

      return {
        statusCode: 200,
        body: JSON.stringify(updatedGame),
      }
    }

    // Update game with next player
    const updatedGame = await client.models.Game.update({
      id: gameId,
      currentPlayerId: nextPlayerId,
    })

    return {
      statusCode: 200,
      body: JSON.stringify(updatedGame),
    }
  } catch (error) {
    console.error("Error ending turn:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error ending turn" }),
    }
  }
}
