import { useState, useEffect } from "react"
import { Schema } from "../../amplify/data/resource"
import { generateClient } from "@aws-amplify/api"
import { logGameState, logError } from "../utils/logger"
import { initializeNewGame } from "../components/gameSetup"

const client = generateClient<Schema>()

export const useGameSetup = (gameId: string) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameState, setGameState] = useState<Schema["Game"]["type"] | null>(
    null
  )
  const [players, setPlayers] = useState<Schema["PlayerGameState"]["type"][]>(
    []
  )

  useEffect(() => {
    const loadGame = async () => {
      try {
        // Initial game load
        const game = await client.models.Game.get({ id: gameId })
        if (!game?.data) {
          throw new Error("Game not found")
        }

        let currentGameData = game.data

        // Handle game initialization
        if (currentGameData.playerIds.length >= 2) {
          // Handle game that's already initializing
          if (currentGameData.status === "initializing") {
            let retryCount = 0
            const maxRetries = 10

            while (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              const reloadedGame = await client.models.Game.get({ id: gameId })
              if (!reloadedGame?.data) {
                throw new Error("Game not found during initialization")
              }
              currentGameData = reloadedGame.data

              // Break if game is ready or active
              if (
                currentGameData.status === "ready" ||
                currentGameData.status === "active"
              ) {
                break
              }

              retryCount++
              if (retryCount === maxRetries) {
                throw new Error("Game initialization timeout")
              }
            }
          }
          // Initialize game if still in waiting status
          else if (currentGameData.status === "waiting") {
            try {
              currentGameData = await initializeNewGame(
                gameId,
                currentGameData.playerIds
              )
            } catch (error) {
              console.error("Failed to initialize game:", error)
              throw error
            }
          }
        }

        // Start game if in ready status
        if (currentGameData.status === "ready") {
          try {
            const now = new Date().toISOString()
            const updatedGame = await client.models.Game.update({
              id: gameId,
              status: "active",
              startedAt: now,
              _version: currentGameData._version,
            })
            if (updatedGame?.data) {
              currentGameData = updatedGame.data
            }
          } catch (error) {
            console.error("Failed to start game:", error)
            throw error
          }
        }

        logGameState("Game loaded", {
          id: currentGameData.id,
          status: currentGameData.status,
          playerCount: currentGameData.playerIds.length,
          deckSize: currentGameData.deck?.length || 0,
        })

        setGameState(currentGameData)

        // Load all player states for this game
        // Reload game one final time to ensure we have latest state
        const finalReload = await client.models.Game.get({ id: gameId })
        if (finalReload?.data) {
          currentGameData = finalReload.data
        }

        const playerStates = await client.models.PlayerGameState.list({
          filter: { gameId: { eq: gameId } },
        })

        if (playerStates.data) {
          setPlayers(playerStates.data)
          logGameState("Player states loaded", {
            count: playerStates.data.length,
            players: playerStates.data.map((p) => ({
              id: p.playerId,
              handSize: p.hand.length,
            })),
          })
        }
      } catch (err) {
        logError("Failed to load game", err)
        setError(err instanceof Error ? err.message : "Failed to load game")
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [gameId])

  return { loading, error, gameState, players }
}
