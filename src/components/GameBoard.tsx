import { useState, useEffect } from 'react';
import type { Schema } from "../../amplify/data/schema";
import { generateClient } from '@aws-amplify/api';
import { useGame } from '../context/GameContext';
import { Card } from './Card';

const client = generateClient<Schema>();

interface GameBoardProps {
  gameId: string;
  playerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId, playerId }) => {
  const [gameState, setGameState] = useState<Schema["Game"]["type"] | null>(null);
  const [playerState, setPlayerState] = useState<Schema["PlayerGameState"]["type"] | null>(null);

  useEffect(() => {
    // Subscribe to game updates
    const sub = client.models.Game.observeQuery({
      filter: { id: { eq: gameId } }
    }).subscribe({
      next: ({ items }) => {
        if (items.length > 0) {
          setGameState(items[0]);
        }
      }
    });

    // Subscribe to player state updates
    const playerSub = client.models.PlayerGameState.observeQuery({
      filter: { 
        and: [
          { gameId: { eq: gameId } },
          { playerId: { eq: playerId } }
        ]
      }
    }).subscribe({
      next: ({ items }) => {
        if (items.length > 0) {
          setPlayerState(items[0]);
        }
      }
    });

    return () => {
      sub.unsubscribe();
      playerSub.unsubscribe();
    };
  }, [gameId, playerId]);

  const handleCardPlay = async (cardId: string) => {
    if (!gameState || !playerState) return;
    
    try {
      // Record the move
      await client.models.Move.create({
        gameId,
        playerId,
        type: 'play',
        cardIds: [cardId],
        timestamp: new Date().toISOString()
      });

      // Update player state (remove card from hand)
      await client.models.PlayerGameState.update({
        id: playerState.id,
        hand: playerState.hand.filter(id => id !== cardId)
      });
    } catch (error) {
      console.error('Error playing card:', error);
    }
  };

  if (!gameState || !playerState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="game-board">
      <div className="game-info">
        <h2>Game Status: {gameState.status}</h2>
        <p>Current Player: {gameState.currentPlayerId === playerId ? 'Your Turn' : 'Waiting'}</p>
      </div>
      
      <div className="player-hand">
        <h3>Your Hand</h3>
        <div className="cards">
          {playerState.hand.map(cardId => (
            <button 
              key={cardId}
              onClick={() => handleCardPlay(cardId)}
              disabled={gameState.currentPlayerId !== playerId}
            >
              Card {cardId}
            </button>
          ))}
        </div>
      </div>

      <div className="player-properties">
        <h3>Your Properties</h3>
        <div className="cards">
          {playerState.properties.map(cardId => (
            <div key={cardId}>Property {cardId}</div>
          ))}
        </div>
      </div>

      <div className="player-bank">
        <h3>Your Bank</h3>
        <div className="cards">
          {playerState.bank.map(cardId => (
            <div key={cardId}>Money {cardId}</div>
          ))}
        </div>
      </div>
    </div>
  );
};