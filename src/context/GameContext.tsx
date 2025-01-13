import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react"
import type { Schema } from "../../amplify/data/resource"
import { generateClient } from "aws-amplify/data"
import { createDeck } from "../utils/cardDefinitions"
import { logGameState, logPlayerState, logError } from "../utils/logger"
import { generateGameName } from "../utils/gameNames"

const client = generateClient<Schema>()

// Types
type Game = Schema["Game"]["type"] & {
  creatorId?: string
}
type PlayerGameState = Schema["PlayerGameState"]["type"]

interface GameContextState {
  gameState: Game | null
  playerState: PlayerGameState | null
  loading: boolean
  error: string | null
  gameList: Game[]
}

interface GameContextValue extends GameContextState {
  joinGame: (gameId: string, playerId: string) => Promise<void>
  createGame: () => Promise<string>
  playCard: (cardId: string, targetPlayerId?: string) => Promise<void>
  drawCard: () => Promise<void>
  endTurn: () => Promise<void>
  startGame: (gameId: string) => Promise<void>
  deleteGame: (gameId: string) => Promise<void>
}

// Action types
type GameAction =
  | { type: "SET_GAME_STATE"; payload: Game }
  | { type: "SET_PLAYER_STATE"; payload: PlayerGameState }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_GAME_LIST"; payload: Game[] }

// Context
const GameContext = createContext<GameContextValue | undefined>(undefined)

// Reducer
const gameReducer = (
  state: GameContextState,
  action: GameAction
): GameContextState => {
  switch (action.type) {
    case "SET_GAME_STATE":
      return { ...state, gameState: action.payload, error: null }
    case "SET_PLAYER_STATE":
      return { ...state, playerState: action.payload, error: null }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_GAME_LIST":
      return { ...state, gameList: action.payload }
    default:
      return state
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state
  const initialState: GameContextState = {
    gameState: null,
    playerState: null,
    loading: false,
    error: null,
    gameList: [],
  }

  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Refs to prevent stale closures
  const playerStateRef = useRef(state.playerState?.id)
  const gameStateRef = useRef(state.gameState?.id)

  // Subscribe to game list updates
  useEffect(() => {
    const gameListSub = client.models.Game.observeQuery({
      filter: {
        and: [
          {
            or: [{ status: { eq: "waiting" } }, { status: { eq: "ready" } }],
          },
          {
            not: {
              playerIds: {
                contains: state.playerState?.playerId,
              },
            },
          },
        ],
      },
    }).subscribe({
      next: ({ items }) => {
        dispatch({ type: "SET_GAME_LIST", payload: items })
      },
      error: (error) => {
        logError("Game list subscription error", error)
      },
    })

    return () => {
      gameListSub.unsubscribe()
    }
  }, [])

  // Update refs when state changes
  useEffect(() => {
    playerStateRef.current = state.playerState?.id
    gameStateRef.current = state.gameState?.id
  }, [state.playerState?.id, state.gameState?.id])

  // Subscriptions
  useEffect(() => {
    if (!state.gameState?.id || !state.playerState?.id) return

    logGameState("Setting up subscriptions", {
      gameId: state.gameState.id,
      playerId: state.playerState.id,
    })

    // Subscribe to game updates
    const gameSub = client.models.Game.observeQuery({
      filter: { id: { eq: state.gameState.id } },
    }).subscribe({
      next: ({ items }) => {
        const currentGame = items.find((g) => g.id === state.gameState?.id)
        if (currentGame) {
          logGameState("Game state updated", {
            gameId: currentGame.id,
            status: currentGame.status,
            currentPlayer: currentGame.currentPlayerId,
            deckSize: currentGame.deck.length,
          })
          dispatch({ type: "SET_GAME_STATE", payload: currentGame })
        }
      },
      error: (error) => {
        logError("Game subscription error", error)
        dispatch({ type: "SET_ERROR", payload: "Lost connection to game" })
      },
    })

    // Subscribe to player state updates
    const playerSub = client.models.PlayerGameState.observeQuery({
      filter: {
        and: [
          { gameId: { eq: state.gameState.id } },
          { playerId: { eq: state.playerState.id } },
        ],
      },
    }).subscribe({
      next: ({ items }) => {
        const currentPlayer = items.find((p) => p.id === state.playerState?.id)
        if (currentPlayer) {
          logPlayerState("Player state updated", {
            playerId: currentPlayer.playerId,
            handSize: currentPlayer.hand.length,
          })
          dispatch({ type: "SET_PLAYER_STATE", payload: currentPlayer })
        }
      },
      error: (error) => {
        logError("Player subscription error", error)
        dispatch({
          type: "SET_ERROR",
          payload: "Lost connection to player state",
        })
      },
    })

    return () => {
      gameSub.unsubscribe()
      playerSub.unsubscribe()
    }
  }, [state.gameState?.id, state.playerState?.id])

  // Game creation
  const createGame = useCallback(async (): Promise<string> => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      logGameState("Initializing new game", {})

      // Create and shuffle new deck
      const shuffledDeck = createDeck()

      const timeStamp = new Date().toISOString()
      // Import generateGameName if not already imported at the top
      const newGameData: Omit<Game, "id"> = {
        status: "waiting",
        playerIds: [],
        name: generateGameName(),
        createdAt: timeStamp,
        updatedAt: timeStamp,
        deck: shuffledDeck,
        discardPile: [],
        currentPlayerId: "",
        creatorId: state.playerState?.playerId,
      }

      logGameState("Creating new game", newGameData)
      if (!newGameData) throw new Error("Failed to create game data")
      const newGame = await client.models.Game.create(newGameData)

      if (!newGame || !newGame.data) throw new Error("Failed to create game")

      dispatch({ type: "SET_GAME_STATE", payload: newGame.data })
      return newGame.data.id
    } catch (error) {
      logError("Game creation error", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create game" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Join game
  const joinGame = useCallback(
    async (gameId: string, playerId: string): Promise<void> => {
      if (!gameId || !playerId) {
        dispatch({ type: "SET_ERROR", payload: "Invalid game or player ID" })
        return
      }

      dispatch({ type: "SET_LOADING", payload: true })
      try {
        // Check if game exists
        const game = await client.models.Game.get({ id: gameId })
        if (!game?.data) throw new Error("Game not found")

        // Check if player already joined
        const existingState = await client.models.PlayerGameState.list({
          filter: {
            and: [{ gameId: { eq: gameId } }, { playerId: { eq: playerId } }],
          },
        })

        let playerGameState: PlayerGameState
        if (existingState.data?.length) {
          playerGameState = existingState.data[0]
        } else {
          // Create new player state
          const newPlayerState = await client.models.PlayerGameState.create({
            playerId,
            gameId,
            hand: [],
            properties: [],
            bank: [],
            isCreator: game.data.playerIds.length === 0,
          })

          if (!newPlayerState || !newPlayerState.data)
            throw new Error("Failed to create player state")
          playerGameState = newPlayerState.data

          // Deal initial cards - fixed for game creators
          const deck = [...game.data.deck]
          const initialHand = deck.splice(-5, 5)  // Take 5 cards from the end

          // Add player to game, set initial status and update deck
          const updatedGame = await client.models.Game.update({
            id: gameId,
            playerIds: [...game.data.playerIds, playerId],
            status: game.data.playerIds.length === 0 ? "waiting" : "ready",
            deck,
          })

          // Update player's hand
          await client.models.PlayerGameState.update({
            id: playerGameState.id,
            hand: initialHand,
          })

          // Record the initial deal
          await client.models.Move.create({
            gameId,
            playerId,
            type: "initial_deal",
            cardIds: initialHand,
            timestamp: new Date().toISOString(),
          })

          if (updatedGame?.data) {
            game.data = updatedGame.data
          }
        }

        // In joinGame function, update game state first, then player state, and navigate
        dispatch({ type: "SET_GAME_STATE", payload: game.data })
        dispatch({ type: "SET_PLAYER_STATE", payload: playerGameState })

        // Return game ID for navigation
        return
      } catch (error) {
        logError("Join game error", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to join game" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    []
  )

  // Play card
  const playCard = useCallback(
    async (cardId: string, targetPlayerId?: string) => {
      if (!state.gameState?.id || !state.playerState?.id) {
        dispatch({
          type: "SET_ERROR",
          payload: "Game or player state not found",
        })
        return
      }

      if (!state.playerState.hand.includes(cardId)) {
        dispatch({ type: "SET_ERROR", payload: "Card not in hand" })
        return
      }

      dispatch({ type: "SET_LOADING", payload: true })
      try {
        // Create move record
        await client.models.Move.create({
          gameId: state.gameState.id,
          playerId: state.playerState.id,
          type: "play",
          cardIds: [cardId],
          timestamp: new Date().toISOString(),
          targetPlayerId,
        })

        // Update player's hand
        await client.models.PlayerGameState.update({
          id: state.playerState.id,
          hand: state.playerState.hand.filter((id) => id !== cardId),
        })
      } catch (error) {
        logError("Play card error", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to play card" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [state.gameState?.id, state.playerState]
  )

  // Draw card
  const drawCard = useCallback(async () => {
    if (!state.gameState?.id || !state.playerState?.id) {
      dispatch({ type: "SET_ERROR", payload: "Game or player state not found" })
      return
    }

    if (!state.gameState.deck.length) {
      dispatch({ type: "SET_ERROR", payload: "No cards left in deck" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const deck = [...state.gameState.deck]
      const drawnCard = deck.pop()

      if (!drawnCard) throw new Error("Failed to draw card")

      // Update game state
      await client.models.Game.update({
        id: state.gameState.id,
        deck,
      })

      // Update player's hand
      await client.models.PlayerGameState.update({
        id: state.playerState.id,
        hand: [...state.playerState.hand, drawnCard],
      })

      // Record move
      await client.models.Move.create({
        gameId: state.gameState.id,
        playerId: state.playerState.id,
        type: "draw",
        cardIds: [drawnCard],
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logError("Draw card error", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to draw card" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [state.gameState, state.playerState])

  // End turn
  const endTurn = useCallback(async () => {
    if (!state.gameState?.id || !state.playerState?.id) {
      dispatch({ type: "SET_ERROR", payload: "Game or player state not found" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const currentPlayerIndex = state.gameState.playerIds.indexOf(
        state.playerState.id
      )
      const nextPlayerIndex =
        (currentPlayerIndex + 1) % state.gameState.playerIds.length
      const nextPlayerId = state.gameState.playerIds[nextPlayerIndex]

      await client.models.Game.update({
        id: state.gameState.id,
        currentPlayerId: nextPlayerId,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      logError("End turn error", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to end turn" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [state.gameState, state.playerState])

  const startGame = useCallback(async (gameId: string) => {
    if (!gameId) {
      dispatch({ type: "SET_ERROR", payload: "Invalid game ID" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const game = await client.models.Game.get({ id: gameId })
      if (!game?.data) throw new Error("Game not found")

      if (game.data.playerIds.length < 2) {
        throw new Error("Need at least 2 players to start")
      }

      const updatedGame = await client.models.Game.update({
        id: gameId,
        status: "active",
        currentPlayerId: game.data.playerIds[0],
      })

      if (updatedGame?.data) {
        dispatch({ type: "SET_GAME_STATE", payload: updatedGame.data })
      }
    } catch (error) {
      logError("Start game error", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to start game" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Delete game
  const deleteGame = useCallback(async (gameId: string) => {
    if (!gameId) {
      dispatch({ type: "SET_ERROR", payload: "Invalid game ID" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Get all player states for this game
      const playerStates = await client.models.PlayerGameState.list({
        filter: { gameId: { eq: gameId } },
      })

      // Delete all player states
      if (playerStates.data) {
        await Promise.all(
          playerStates.data.map((playerState) =>
            client.models.PlayerGameState.delete({ id: playerState.id })
          )
        )
      }

      // Delete all moves associated with the game
      const moves = await client.models.Move.list({
        filter: { gameId: { eq: gameId } },
      })
      
      if (moves.data) {
        await Promise.all(
          moves.data.map((move) =>
            client.models.Move.delete({ id: move.id })
          )
        )
      }

      // Delete the game itself
      await client.models.Game.delete({ id: gameId })

      // If this was the current game, clear the game state
      if (state.gameState?.id === gameId) {
        dispatch({ type: "SET_GAME_STATE", payload: null })
      }
    } catch (error) {
      logError("Delete game error", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to delete game" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [state.gameState?.id])

  const value = {
    ...state,
    createGame,
    joinGame,
    playCard,
    drawCard,
    endTurn,
    startGame,
    deleteGame,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
