import React from "react"
import { useGame } from "../context/GameContext"
import { GameList } from "./GameList"
import { useNavigateToGame } from "../hooks/useNavigateToGame"
import "../styles/WelcomeScreen.css"

interface WelcomeScreenProps {
  username: string
  playerId: string
  onCreateGame: () => Promise<string | undefined>
  onJoinGame: (gameId: string, playerId: string) => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  username,
  playerId,
  onCreateGame,
  onJoinGame,
}) => {
  const { loading } = useGame()

  const navigateToGame = useNavigateToGame()

  const handleCreateGame = async () => {
    const gameId = await onCreateGame()
    if (!gameId) throw new Error("Failed to create game")
    navigateToGame(gameId)
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>Welcome to Monopoly Deal!</h1>
        <h2>Hello, {username}!</h2>

        <div className="game-rules">
          <h3>Quick Rules</h3>
          <ul>
            <li>Each player starts with 5 cards</li>
            <li>
              On your turn:
              <ol>
                <li>Draw 2 cards</li>
                <li>Play up to 3 cards</li>
                <li>You can play properties, money, or action cards</li>
                <li>Stack matching properties to create sets</li>
              </ol>
            </li>
            <li>First player to complete 3 property sets wins!</li>
          </ul>
        </div>

        <div className="game-options">
          <button
            className="action-button primary create-game"
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading ? "Creating Game..." : "Create New Game"}
          </button>

          <GameList onJoinGame={(gameId) => onJoinGame(gameId, playerId)} />
        </div>
      </div>
    </div>
  )
}
