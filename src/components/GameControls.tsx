import React from 'react';
import '../styles/GameControls.css';

interface GameControlsProps {
  isCurrentPlayer: boolean;
  onDrawCard: () => void;
  onEndTurn: () => void;
  selectedCardsCount: number;
  onPlaySelected: () => void;
  onStackCards: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isCurrentPlayer,
  onDrawCard,
  onEndTurn,
  selectedCardsCount,
  onPlaySelected,
  onStackCards
}) => {
  return (
    <div className="game-controls">
      <button
        className="action-button primary"
        onClick={onDrawCard}
        disabled={!isCurrentPlayer}
      >
        Draw Card
      </button>
      <button
        className="action-button primary"
        onClick={onPlaySelected}
        disabled={!isCurrentPlayer || selectedCardsCount === 0}
      >
        Play Selected ({selectedCardsCount})
      </button>
      <button
        className="action-button secondary"
        onClick={onStackCards}
        disabled={!isCurrentPlayer || selectedCardsCount < 2}
      >
        Stack Cards
      </button>
      <button
        className="action-button secondary"
        onClick={onEndTurn}
        disabled={!isCurrentPlayer}
      >
        End Turn
      </button>
    </div>
  );
};