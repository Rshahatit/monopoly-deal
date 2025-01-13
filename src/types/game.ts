export type GameStatus = 'waiting' | 'ready' | 'active' | 'completed';

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  playerIds: string[];
  deck: string[];
  discardPile: string[];
  currentPlayerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerGameState {
  id: string;
  gameId: string;
  playerId: string;
  hand: string[];
  properties: string[];
  bank: string[];
  isCreator: boolean;
}