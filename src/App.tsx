import { useEffect, useState } from "react"
import { LoadingSpinner } from "./components/LoadingSpinner"
import { ErrorMessage } from "./components/ErrorMessage"
import { useGame } from "./context/GameContext"
import type { Schema } from "../amplify/data/schema"
import { type ClientSchema, generateClient } from "@aws-amplify/api"
import { type Game } from "../amplify/data/models"
import { GameBoard } from "./components/GameBoard"

const client = generateClient<ClientSchema>()

function App() {
  const { loading, error } = useGame()
  const [games, setGames] = useState<Array<Schema["Game"]["type"]>>([])
  const [currentUser, setCurrentUser] = useState<
    Schema["Player"]["type"] | null
  >(null)

  useEffect(() => {
    let isSubscribed = true;
    const subscribeToGames = async () => {
      try {
        const subscription = await client.models.Game.observeQuery({
          filter: { status: { eq: "active" } },
        });

        subscription.subscribe({
          next: ({ data }) => {
            if (isSubscribed) {
              setGames([...data]);
            }
          },
          error: (error) => {
            console.error('Subscription error:', error);
          },
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    const subscription = subscribeToGames();
    
    return () => {
      isSubscribed = false;
      subscription.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  async function createGame() {
    if (!currentUser) return

    try {
      const newGame = await client.models.Game.create({
        status: "waiting",
        playerIds: [currentUser.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deck: [], // TODO: Initialize with actual card deck
        discardPile: [],
      })

      await client.models.PlayerGameState.create({
        playerId: currentUser.id,
        gameId: newGame.id,
        hand: [],
        properties: [],
        bank: [],
      })
    } catch (error) {
      console.error("Error creating game:", error)
    }
  }

  async function createUser() {
    const username = window.prompt("Enter your username")
    const email = window.prompt("Enter your email")

    if (!username || !email) return

    try {
      const newUser = await client.models.Player.create({
        username,
        email,
        gamesPlayed: 0,
        gamesWon: 0,
      })
      setCurrentUser(newUser)
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

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
        <div>
          <h2>Welcome to Monopoly Deal!</h2>
          <button onClick={createUser}>Create Account</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {currentUser.username}!</h2>
          <button onClick={createGame}>Create New Game</button>

          <h3>Active Games</h3>
          <div className="games-list">
            {games.map((game) => (
              <div key={game.id} className="game-item">
                <h4>Game {game.id}</h4>
                <p>Status: {game.status}</p>
                {game.currentPlayerId === currentUser.id && (
                  <GameBoard gameId={game.id} playerId={currentUser.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export default App
