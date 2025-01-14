import { client } from "./utils"
import { shuffleArray } from "./utils"

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
    if (!playerState || !playerState.data) {
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

    // Check deck and reshuffle if needed
    let updatedDeck = [...game.data.deck]
    let updatedDiscardPile = [...game.data.discardPile]

    if (updatedDeck.length === 0) {
      if (updatedDiscardPile.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "No cards available to draw" }),
        }
      }
      updatedDeck = shuffleArray([...updatedDiscardPile])
      updatedDiscardPile = []
    }

    // Draw a card
    const drawnCard = updatedDeck.pop()!
    const updatedHand = [...playerState.data[0].hand, drawnCard]

    // Record the move
    await client.models.Move.create({
      id: `move_${Date.now()}`,
      gameId,
      playerId,
      type: "draw",
      cardIds: [drawnCard],
      timestamp: new Date().toISOString(),
    })

    // Update player game state
    await client.models.PlayerGameState.update({
      id: playerState.data[0].id,
      hand: updatedHand,
    })

    // Update game state
    const updatedGame = await client.models.Game.update({
      id: gameId,
      deck: updatedDeck,
      discardPile: updatedDiscardPile,
    })

    return {
      statusCode: 200,
      body: JSON.stringify(updatedGame),
    }
  } catch (error) {
    console.error("Error drawing card:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error drawing card" }),
    }
  }
}
