import React from "react"
import type { Schema } from "../../amplify/data/resource"
import "../styles/GameStatusDisplay.css"

interface GameStatusDisplayProps {
  gameState: Schema["Game"]["type"]
  currentPlayerId?: string
  playerStates: Schema["PlayerGameState"]["type"][]
}

export const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
  gameState,
  currentPlayerId,
  playerStates,
}) => {
  const getStatusMessage = () => {
    switch (gameState.status) {
      case "waiting":
        return `Waiting for players to join... ${gameState.id}`
      case "active":
        return `Game in progress - ${gameState.currentPlayerId}'s turn`
      case "completed":
        return "Game completed"
      default:
        return "Unknown game status"
    }
  }

  return (
    <div className={`game-status ${gameState.status}`}>
      <h2 className="status-message">{getStatusMessage()}</h2>
      <div className="player-list">
        <h3>Players ({playerStates.length})</h3>
        {playerStates.map((player) => (
          <div
            key={player.playerId}
            className={`player-item ${
              player.playerId === gameState.currentPlayerId
                ? "current-player"
                : ""
            }`}
          >
            {player.playerId}
            {player.playerId === currentPlayerId && " (You)"}- Cards in hand:{" "}
            {player.hand.length - 1}
          </div>
        ))}
      </div>
    </div>
  )
}
