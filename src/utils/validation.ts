import { Schema } from '../../amplify/data/resource';
import { Card } from './CardDeck';
import { logError } from './logger';

export const validateCard = (card: any): card is Card => {
  if (!card) {
    logError("Card validation failed", "Card is null or undefined");
    return false;
  }

  const requiredFields = ['id', 'type', 'name', 'value'];
  const missingFields = requiredFields.filter(field => !(field in card));
  
  if (missingFields.length > 0) {
    logError("Card validation failed", {
      card,
      missingFields
    });
    return false;
  }

  return true;
};

export const validatePlayerState = (
  playerState: Schema["PlayerGameState"]["type"]
): boolean => {
  if (!playerState) {
    logError("Player state validation failed", "PlayerState is null");
    return false;
  }

  const requiredFields = ['id', 'playerId', 'gameId', 'hand', 'properties', 'bank'];
  const missingFields = requiredFields.filter(field => !(field in playerState));

  if (missingFields.length > 0) {
    logError("Player state validation failed", {
      playerState,
      missingFields
    });
    return false;
  }

  return true;
};