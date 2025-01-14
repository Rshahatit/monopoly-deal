import { client } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(event: any) {
  const {
    gameId,
    playerId,
    cardId,
    targetPlayerId,
    targetPropertyId,
  } = JSON.parse(event.body)

  try {
    // Get current game state
    const game = await client.models.Game.get({ id: gameId })
    if (!game || !game.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    // Get current player game state
    const playerGameState = await client.models.PlayerGameState.get({
      id: playerId,
    })
    if (!playerGameState) {
      // Filter player game state by gameId and playerId
      const playerGameState = await client.models.PlayerGameState.list({
        filter: {
          gameId: gameId,
          id: playerId,
        },
      })

      if (!playerGameState || !playerGameState.data) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Player game state not found" }),
        }
      }
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Player game state not found" }),
      }
    }

    // Validate player's turn
    if (game.data.currentPlayerId !== playerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Not your turn" }),
      }
    }

    if (!playerGameState || !playerGameState.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Player game state not found" }),
      }
    }
    // Check if card is in player's hand
    const cardIndex = playerGameState.data.hand.indexOf(cardId)
    if (cardIndex === -1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Card not in hand" }),
      }
    }

    // Remove card from hand
    const updatedHand = [...playerGameState.data.hand]
    updatedHand.splice(cardIndex, 1)

    // Add card to discard pile
    const updatedDiscardPile = [...game.data.discardPile, cardId]

    // Record the move
    await client.models.Move.create({
      id: `move_${Date.now()}`,
      gameId,
      playerId,
      type: "play",
      cardIds: [cardId],
      timestamp: new Date().toISOString(),
      targetPlayerId,
      targetPropertyId,
    })

    if (!playerGameState || !playerGameState.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }
    // Update player game state
    await client.models.PlayerGameState.update({
      id: playerGameState.data.id,
      hand: updatedHand,
    })

    // Update game state
    const updatedGame = await client.models.Game.update({
      id: gameId,
      discardPile: updatedDiscardPile,
    })

    return {
      statusCode: 200,
      body: JSON.stringify(updatedGame),
    }
  } catch (error) {
    console.error("Error playing card:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error playing card" }),
    }
  }
}
