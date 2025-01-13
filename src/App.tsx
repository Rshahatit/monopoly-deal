import { useEffect, useState } from "react"
import "./styles/App.css"
import { useAuthenticator } from "@aws-amplify/ui-react"
import { LoadingSpinner } from "./components/LoadingSpinner"
import { ErrorMessage } from "./components/ErrorMessage"
import { useGame } from "./context/GameContext"
import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/data"
import { GameBoard } from "./components/GameBoard"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { createDeck } from "./utils/cardDefinitions"

// Initialize the AWS Amplify client for database operations
const client = generateClient<Schema>()

// Type definitions for better code clarity
type Game = Schema["Game"]["type"]
type Player = Schema["Player"]["type"]
type GameId = Game["id"]

function App() {
  // Game-related state
  const [games, setGames] = useState<Array<Game>>([])
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [gameId, setGameId] = useState<GameId | null>(null)
  const [gameCreated, setGameCreated] = useState<boolean>(false)

  // User-related state
  const [currentUser, setCurrentUser] = useState<Player | null>(null)

  // Custom hooks
  const { loading, error, joinGame } = useGame()
  const { user, signOut } = useAuthenticator()

  // Effect: Fetch current user data when user authenticates
  useEffect(() => {
    if (!user) return

    const fetchCurrentUser = async () => {
      try {
        const currentUserData = await client.models.Player.get({
          id: user.userId,
        })

        if (currentUserData?.data) {
          setCurrentUser({
            id: currentUserData.data.id,
            email: currentUserData.data.email,
            username: currentUserData.data.username,
            gamesPlayed: currentUserData.data.gamesPlayed,
            gamesWon: currentUserData.data.gamesWon,
          })
        } else if (user.signInDetails?.loginId) {
          // Create new user if they don't exist
          await createUser(user.username, user.signInDetails.loginId)
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [user])

  // Effect: Subscribe to active games updates
  useEffect(() => {
    let isSubscribed = true

    const subscribeToGames = async () => {
      try {
        if (!client.models.Game?.observeQuery) {
          throw new Error("Game model not properly initialized")
        }

        const subscription = await client.models.Game.observeQuery({
          filter: { status: { eq: "active" } },
        })

        subscription.subscribe({
          next: ({ items }) => {
            if (isSubscribed) {
              setGames([...items])
            }
          },
          error: (error) => {
            console.error("Game subscription error:", error)
          },
        })

        return () => subscription.subscribe().unsubscribe()
      } catch (error) {
        console.error("Subscription setup error:", error)
      }
    }

    const subscription = subscribeToGames()

    // Cleanup subscription on component unmount
    return () => {
      isSubscribed = false
      subscription
        ?.then((unsubscribe) => {
          if (typeof unsubscribe === "function") {
            unsubscribe()
          }
        })
        .catch(console.error)
    }
  }, [])

  // Reset game created flag when game is selected
  useEffect(() => {
    if (gameCreated && selectedGame) {
      setGameCreated(false)
    }
  }, [gameCreated, selectedGame])

  /**
   * Creates a new game and initializes player game state
   */
  async function createGame() {
    if (!currentUser) {
      console.error("Cannot create game: No current user found")
      return
    }

    try {
      // Initialize game deck and create game record
      const deck = createDeck()
      const newGame = await client.models.Game.create({
        status: "waiting",
        playerIds: [currentUser.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deck,
        discardPile: [],
      })

      if (!newGame || !newGame.data) {
        throw new Error("Failed to create game")
      }

      // Create initial player game state
      await client.models.PlayerGameState.create({
        playerId: currentUser.id,
        gameId: newGame.data.id,
        isCreator: true,
        hand: [],
        properties: [],
        bank: [],
      })

      // Update local state
      setGames((prevGames) =>
        [...prevGames, newGame].filter((game): game is Game => game !== null)
      )
      setSelectedGame(newGame.data.id)
      setGameCreated(true)
    } catch (error) {
      console.error("Game creation error:", error)
    }
  }

  /**
   * Creates a new user in the database
   */
  async function createUser(username: string, email: string) {
    try {
      const newUser = await client.models.Player.create({
        username,
        email,
        gamesPlayed: 0,
        gamesWon: 0,
      })

      if (newUser?.data) {
        setCurrentUser({
          id: newUser.data.id,
          email: newUser.data.email,
          username: newUser.data.username,
          gamesPlayed: newUser.data.gamesPlayed,
          gamesWon: newUser.data.gamesWon,
        })
      } else {
        throw new Error("Failed to create user")
      }
    } catch (error) {
      console.error("User creation error:", error)
    }
  }

  /**
   * Handles the game creation flow
   */
  const handleCreateGame = async () => {
    try {
      await createGame()

      if (!selectedGame) {
        throw new Error("No game selected after creation")
      }

      // Initialize game state
      const updatedGame = {
        ...games[Number(selectedGame)],
        players: {
          hand: [],
          isCreator: true,
        },
      }

      setGames((prevGames) => [...prevGames, updatedGame])
      setSelectedGame(updatedGame.id)
      return selectedGame
    } catch (error) {
      console.error("Game creation flow error:", error)
    }
  }

  /**
   * Handles user sign out and state cleanup
   */
  const handleSignOut = async () => {
    setGames([])
    setSelectedGame(null)
    await signOut()
  }

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <main>
        <LoadingSpinner />
      </main>
    )
  }

  return (
    <main>
      {error && <ErrorMessage message={error} />}
      <h1>Monopoly Deal Online</h1>

      {!currentUser ? (
        // Authentication view
        <div className="auth-container">
          <h2>Welcome to Monopoly Deal!</h2>
          {user?.signInDetails?.loginId ? (
            <div>
              <p>Setting up your account...</p>
              <LoadingSpinner />
            </div>
          ) : (
            <p>Please sign in to continue</p>
          )}
        </div>
      ) : (
        // Main game container
        <div className="game-container">
          {games.length === 0 ? (
            // Welcome screen for new users
            <WelcomeScreen
              username={currentUser.email}
              playerId={currentUser.id}
              onCreateGame={handleCreateGame}
              onJoinGame={joinGame}
            />
          ) : (
            <>
              {/* User header */}
              <div className="game-header">
                <h2>
                  Welcome back,{" "}
                  <span className="gradient-text">{currentUser.email}</span>!
                </h2>
                <button
                  className="action-button secondary"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>

              {/* Game view container */}
              <div className="game-container">
                {selectedGame ? (
                  // Active game view
                  <div className="active-game-container">
                    <button
                      className="back-button"
                      onClick={() => setSelectedGame(null)}
                    >
                      Back to Games
                    </button>
                    <GameBoard
                      gameId={selectedGame}
                      playerId={currentUser.id}
                    />
                  </div>
                ) : (
                  // Games list view
                  <div className="games-list">
                    {/* Available games */}
                    {games.map((game) => (
                      <div
                        key={`game-container-${game.id}`}
                        className="game-item"
                        onClick={() => setSelectedGame(game.id)}
                      >
                        <div className="game-item-header">
                          <h4>Game {game.id}</h4>
                          <span className={`game-status ${game.status}`}>
                            {game.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Game creation and joining options */}
                    <div className="game-options">
                      <button
                        className="action-button primary create-game"
                        onClick={handleCreateGame}
                        disabled={loading}
                      >
                        {loading ? "Creating Game..." : "Create New Game"}
                      </button>

                      <div className="join-game-section">
                        <h3>Join Existing Game</h3>
                        <div className="join-game-form">
                          <input
                            type="text"
                            placeholder="Enter Game ID"
                            value={gameId ?? ""}
                            onChange={(e) => setGameId(e.target.value)}
                            disabled={loading}
                          />
                          <button
                            className="action-button secondary join-game"
                            onClick={() =>
                              gameId && joinGame(gameId, currentUser.id)
                            }
                            disabled={loading || !gameId}
                          >
                            {loading ? "Joining..." : "Join Game"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}

export default App
