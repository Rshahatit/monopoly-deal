import { create } from 'zustand';
import { GameState, Player, Card, PropertyColor } from '../types/game';
import { createDeck } from '../lib/cards';

interface GameStore extends GameState {
  initializeGame: (playerNames: string[]) => void;
  drawCard: () => void;
  playCard: (playerId: string, cardId: string, targetPlayerId?: string, selectedColor?: PropertyColor, targetPropertyId?: string) => void;
  endTurn: () => void;
  canPlayCard: (card: Card) => boolean;
  getPropertySet: (color: PropertyColor) => number;
  isSetComplete: (playerId: string, color: PropertyColor) => boolean;
  cardsPlayedThisTurn: number;
  discardCard: (playerId: string, cardId: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  currentPlayer: 0,
  deck: [],
  discardPile: [],
  winner: null,
  actionInProgress: null,
  cardsPlayedThisTurn: 0,

  initializeGame: (playerNames) => {
    const deck = createDeck();
    const players = playerNames.map((name, index) => {
      const playerHand = deck.splice(0, 5);
      return {
        id: `player-${index}`,
        name,
        hand: playerHand,
        properties: [],
        money: [],
        bank: 0
      };
    });

    set({ 
      players, 
      deck, 
      currentPlayer: 0, 
      discardPile: [], 
      winner: null,
      cardsPlayedThisTurn: 0 
    });
  },

  drawCard: () => {
    set(state => {
      // Only allow drawing at the start of turn
      if (state.cardsPlayedThisTurn > 0) return state;

      // Handle empty deck
      let newDeck = [...state.deck];
      if (newDeck.length === 0) {
        if (state.discardPile.length === 0) return state;
        newDeck = [...state.discardPile].sort(() => Math.random() - 0.5);
      }

      // Draw 2 cards
      const drawnCards = newDeck.splice(0, 2);
      if (drawnCards.length === 0) return state;

      // Update player's hand
      const newPlayers = [...state.players];
      const currentPlayer = newPlayers[state.currentPlayer];
      if (!currentPlayer) return state;

      newPlayers[state.currentPlayer] = {
        ...currentPlayer,
        hand: [...currentPlayer.hand, ...drawnCards]
      };

      // Return new state
      return {
        ...state,
        deck: newDeck,
        players: newPlayers,
        cardsPlayedThisTurn: state.cardsPlayedThisTurn + 1,
        discardPile: newDeck.length === 0 ? [] : state.discardPile
      };
    });
  },

  // ... rest of the store implementation remains the same
}));