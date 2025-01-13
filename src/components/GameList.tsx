import React from "react"
import { useGame } from "../context/GameContext"
import { useNavigateToGame } from "../hooks/useNavigateToGame"
import "../styles/GameList.css"

interface GameListProps {
  onJoinGame: (gameId: string) => void
}

export const GameList: React.FC<GameListProps> = ({ onJoinGame }) => {
  const { gameList, startGame, playerState, deleteGame } = useGame()

  // Sort games by creation date, newest first
  const sortedGames = [...gameList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const navigateToGame = useNavigateToGame()

  return (
    <div className="game-list">
      <h3>Available Games</h3>
      {gameList.length === 0 ? (
        <p>No games available. Create a new game to start playing!</p>
      ) : (
        <ul>
          {sortedGames.map((game) => (
            <li key={game.id} className="game-item">
              <span>{game.name || `Game ${game.id.slice(0, 8)}`}</span>
              <span>Players: {game.playerIds.length}</span>
              <span>Status: {game.status}</span>
              {game.status === "active" &&
                game.creatorId === playerState?.playerId && (
                  <button
                    onClick={async () => {
                      await startGame(game.id)
                      navigateToGame(game.id)
                    }}
                    className="start-game-button"
                  >
                    Start Game
                  </button>
                )}
              {game.status === "waiting" && (
                <>
                  <button
                    onClick={async () => {
                      await onJoinGame(game.id)
                      navigateToGame(game.id)
                    }}
                    className="join-game-button"
                  >
                    Join Game
                  </button>
                  {game.creatorId === playerState?.playerId && (
                    <button
                      onClick={async () => {
                        await deleteGame(game.id)
                      }}
                      className="delete-game-button"
                    >
                      Delete Game
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
