import { client } from "./utils"

const INITIAL_HAND_SIZE = 5
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(event: any) {
  const { gameId } = JSON.parse(event.body)

  try {
    // Get current game state
    const game = await client.models.Game.get({ id: gameId })
    if (!game) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    if (!game || !game.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    // Validate game can be started
    if (game.data.status !== "waiting") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Game already started" }),
      }
    }

    // Validate game can be started
    if (game.data.status !== "waiting") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Game already started" }),
      }
    }

    // Get all player states
    const playerStates = await client.models.PlayerGameState.list({
      filter: {
        gameId: { eq: gameId },
      },
    })

    if (!playerStates || !playerStates.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Game not found" }),
      }
    }

    if (playerStates.data.length < 2) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Need at least 2 players to start" }),
      }
    }

    // Deal initial hands
    for (const playerState of playerStates.data) {
      const cardsToAdd: string[] = []
      for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
        const card = game.data.deck.pop()
        if (card) {
          cardsToAdd.push(card)
        }
      }

      // Update player's hand
      await client.models.PlayerGameState.update({
        id: playerState.id,
        hand: [...playerState.hand, ...cardsToAdd],
      })
    }

    // Record initial deal move
    await client.models.Move.create({
      id: `move_${Date.now()}`,
      gameId,
      playerId: game.data.playerIds[0] ?? "", // Creator of the game
      type: "initial_deal",
      cardIds: [],
      timestamp: new Date().toISOString(),
    })

    // Update game state
    const updatedGame = await client.models.Game.update({
      id: gameId,
      status: "active",
      deck: game.data.deck,
      currentPlayerId: game.data.playerIds[0],
    })

    return {
      statusCode: 200,
      body: JSON.stringify(updatedGame),
    }
  } catch (error) {
    console.error("Error starting game:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error starting game" }),
    }
  }
}
