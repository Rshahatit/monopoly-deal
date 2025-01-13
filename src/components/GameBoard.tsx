import { useState, useEffect, useRef, useCallback } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import type { Schema } from "../../amplify/data/resource"
import { generateClient } from "@aws-amplify/api"
import { useGame } from "../context/GameContext"
import { OtherPlayerArea } from "./OtherPlayerArea"
import { SimpleCard } from "./SimpleCard"
import { GameStatusDisplay } from "./GameStatusDisplay"
import { useGameSetup } from "../hooks/useGameSetup"
import { GameControls } from "./GameControls"
import { getCardById } from "../utils/cardDefinitions" // Import the new card utility
import "../styles/GameBoard.css"
import "../styles/LoadingState.css"
import ErrorBoundary from "./ErrorBoundary"

// Type definitions
type Game = Schema["Game"]["type"]
type PlayerGameState = Schema["PlayerGameState"]["type"]

const client = generateClient<Schema>()

interface GameBoardProps {
  gameId: string
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId, playerId }) => {
  // State management
  const [gameState, setGameState] = useState<Game | null>(null)
  const [playerState, setPlayerState] = useState<PlayerGameState | null>(null)
  const [playerStates, setPlayerStates] = useState<PlayerGameState[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [, setIsStacking] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Remove hasDealtInitialCards state since it's no longer needed

  // Refs
  const contentRef = useRef<HTMLDivElement>(null)
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([])

  // Custom hooks
  const { loading: setupLoading, error: setupError } = useGameSetup(gameId)
  const {
    gameState: contextGameState,
    playerState: contextPlayerState,
    drawCard,
  } = useGame()

  // Remove the initial card dealing effect since it's now handled in joinGame

  // Update state from context
  useEffect(() => {
    if (contextGameState) setGameState(contextGameState)
    if (contextPlayerState) setPlayerState(contextPlayerState)
  }, [contextGameState, contextPlayerState])

  // Clear error when game state updates
  useEffect(() => {
    if (gameState) setLoadError(null)
  }, [gameState])

  // Set up real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      try {
        const gameSubscription = client.models.Game.observeQuery({
          filter: { id: { eq: gameId } },
        }).subscribe({
          next: ({ items }) => {
            if (items.length) setGameState(items[0])
          },
          error: (error) => {
            console.error("Game subscription error:", error)
            setLoadError("Failed to subscribe to game updates")
          },
        })

        const playerStateSubscription =
          client.models.PlayerGameState.observeQuery({
            filter: {
              and: [{ gameId: { eq: gameId } }, { playerId: { eq: playerId } }],
            },
          }).subscribe({
            next: ({ items }) => {
              if (items.length) setPlayerState(items[0])
            },
            error: (error) => {
              console.error("Player state subscription error:", error)
              setLoadError("Failed to subscribe to player updates")
            },
          })

        const allPlayerStatesSubscription =
          client.models.PlayerGameState.observeQuery({
            filter: { gameId: { eq: gameId } },
          }).subscribe({
            next: ({ items }) => setPlayerStates(items),
            error: (error) => {
              console.error("All player states subscription error:", error)
              setLoadError("Failed to subscribe to other players' updates")
            },
          })

        subscriptionsRef.current = [
          gameSubscription,
          playerStateSubscription,
          allPlayerStatesSubscription,
        ]
      } catch (error) {
        console.error("Error setting up subscriptions:", error)
        setLoadError("Failed to set up game subscriptions")
      }
    }

    setupSubscriptions()

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
      subscriptionsRef.current = []
    }
  }, [gameId, playerId])

  // Card selection handler
  const handleCardSelect = useCallback((cardId: string, selected: boolean) => {
    if (!isCurrentPlayer) return
    setSelectedCards((prev) =>
      selected ? [...prev, cardId] : prev.filter((id) => id !== cardId)
    )
  }, [])

  // Game state update handler
  const handleGameUpdate = useCallback(
    async (update: Partial<Game>) => {
      try {
        if (!gameState?.id) throw new Error("No game state available")

        const updatedGame = await client.models.Game.update({
          id: gameState.id,
          ...update,
        })

        setGameState((prev) => {
          if (!prev) return updatedGame.data
          return { ...prev, ...updatedGame.data }
        })
      } catch (error) {
        console.error("Game update error:", error)
        setLoadError("Failed to update game state")
      }
    },
    [gameState]
  )

  // Player state update handler
  const handlePlayerUpdate = useCallback(
    async (update: Partial<PlayerGameState>) => {
      try {
        if (!playerState?.id) throw new Error("No player state available")

        const updatedPlayerState = await client.models.PlayerGameState.update({
          id: playerState.id,
          ...update,
        })

        setPlayerState((prev) => {
          if (!prev) return updatedPlayerState.data
          return { ...prev, ...updatedPlayerState.data }
        })
      } catch (error) {
        console.error("Player update error:", error)
        setLoadError("Failed to update player state")
      }
    },
    [playerState]
  )

  // Card play handler
  const handleCardPlay = useCallback(async () => {
    if (!gameState?.id || !playerState?.id || !selectedCards.length) return

    try {
      await client.models.Move.create({
        gameId,
        playerId,
        type: "play",
        cardIds: selectedCards,
        timestamp: new Date().toISOString(),
      })

      await handlePlayerUpdate({
        hand: playerState.hand
          .filter((id): id is string => id !== null)
          .filter((id) => !selectedCards.includes(id)),
      })

      setSelectedCards([])
    } catch (error) {
      console.error("Error playing cards:", error)
      setLoadError("Failed to play selected cards")
    }
  }, [
    gameState,
    playerState,
    selectedCards,
    gameId,
    playerId,
    handlePlayerUpdate,
  ])

  const isCurrentPlayer = gameState?.currentPlayerId === playerId

  if (setupLoading) {
    return <div className="loading-state">Loading game...</div>
  }

  if (setupError || loadError) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{setupError || loadError}</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    )
  }

  if (!gameState?.deck) {
    return (
      <div className="error-state">
        <h2>Error: Game data not found</h2>
        <p>Please refresh the page or return to the game lobby.</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="game-board" ref={contentRef}>
        <GameStatusDisplay
          gameState={gameState}
          currentPlayerId={playerId}
          playerStates={playerStates}
        />

        <div className="other-players-container">
          {playerStates
            .filter((state) => state.playerId !== playerId)
            .map((state) => (
              <OtherPlayerArea
                key={state.playerId}
                playerState={state}
                isCurrentPlayer={state.playerId === gameState.currentPlayerId}
              />
            ))}
        </div>

        <GameControls
          isCurrentPlayer={isCurrentPlayer}
          onDrawCard={drawCard}
          onEndTurn={() => {
            const nextPlayerIndex =
              (playerStates.findIndex((state) => state.playerId === playerId) +
                1) %
              playerStates.length
            const nextPlayerId = playerStates[nextPlayerIndex]?.playerId
            if (nextPlayerId) {
              handleGameUpdate({ currentPlayerId: nextPlayerId })
            }
          }}
          selectedCardsCount={selectedCards.length}
          onPlaySelected={handleCardPlay}
          onStackCards={() => setIsStacking(true)}
        />

        <div className="player-area">
          <section className="hand-section">
            <h3>
              Your Hand ({playerState?.hand ? playerState.hand.length - 1 : 0}{" "}
              cards)
            </h3>
            <TransitionGroup className="hand-container">
              {playerState?.hand?.map((cardId) => {
                let card
                if (cardId) {
                  card = getCardById(cardId)
                } else {
                  throw new Error("Invalid card ID")
                }
                return (
                  <CSSTransition
                    key={cardId}
                    timeout={300}
                    classNames="card"
                    unmountOnExit
                  >
                    <SimpleCard
                      card={card}
                      selected={selectedCards.includes(cardId)}
                      onClick={() =>
                        handleCardSelect(
                          cardId,
                          !selectedCards.includes(cardId)
                        )
                      }
                      disabled={!isCurrentPlayer}
                    />
                  </CSSTransition>
                )
              })}
            </TransitionGroup>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default GameBoard
