import React from 'react';
import type { Card as CardType } from '../utils/CardDeck';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled, faceDown }) => {
  const getCardColor = () => {
    if (faceDown) return '#e0e0e0';
    switch (card.type) {
      case 'property':
        return card.color;
      case 'money':
        return '#e8f5e9';
      case 'action':
        return '#fff3e0';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      className={`card card-${card.type}`}
      style={{
        borderColor: getCardColor(),
        opacity: disabled ? 0.5 : 1,
        cursor: onClick && !disabled ? 'pointer' : 'default'
      }}
      onClick={() => !disabled && onClick?.()}
    >
      {!faceDown ? (
        <>
          <div className="card-header">
            <span className="card-value">{card.value}M</span>
            <span className="card-type">{card.type}</span>
          </div>
          <div className="card-content">
            <h3>{card.name}</h3>
            {card.type === 'property' && (
              <div 
                className="property-color" 
                style={{ backgroundColor: card.color }}
              />
            )}
          </div>
        </>
      ) : (
        <div className="card-back">
          <span>Monopoly Deal</span>
        </div>
      )}
    </div>
  );
};