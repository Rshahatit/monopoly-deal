import { logGameState } from './logger';

export const validateGameState = (gameState: any) => {
  if (!gameState) {
    console.error("[Validation] Game state is null");
    return false;
  }

  const issues = [];

  if (!gameState.id) issues.push("Missing game ID");
  if (!gameState.status) issues.push("Missing game status");
  if (!gameState.playerIds || !Array.isArray(gameState.playerIds)) {
    issues.push("Invalid playerIds");
  }
  if (!gameState.deck || !Array.isArray(gameState.deck)) {
    issues.push("Invalid deck");
  }

  if (issues.length > 0) {
    logGameState("Game state validation failed", { issues, gameState });
    return false;
  }

  logGameState("Game state validation passed", {
    id: gameState.id,
    status: gameState.status,
    playerCount: gameState.playerIds.length,
    deckSize: gameState.deck.length
  });

  return true;
};