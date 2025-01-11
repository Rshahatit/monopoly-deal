import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { initializeDeck, shuffleDeck, dealInitialHands, type Card } from '../utils/CardDeck';

const client = generateClient<Schema>();

interface GameContextState {
  gameState: Schema["Game"]["type"] | null;
  playerState: Schema["PlayerGameState"]["type"] | null;
  cards: { [key: string]: Card };
  loading: boolean;
  error: string | null;
}

interface GameContextValue extends GameContextState {
  joinGame: (gameId: string) => Promise<void>;
  createGame: () => Promise<string>;
  playCard: (cardId: string, targetPlayerId?: string) => Promise<void>;
  drawCard: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

type GameAction =
  | { type: 'SET_GAME_STATE'; payload: Schema["Game"]["type"] }
  | { type: 'SET_PLAYER_STATE'; payload: Schema["PlayerGameState"]["type"] }
  | { type: 'SET_CARDS'; payload: { [key: string]: Card } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const gameReducer = (state: GameContextState, action: GameAction): GameContextState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_PLAYER_STATE':
      return { ...state, playerState: action.payload };
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialState: GameContextState = {
    gameState: null,
    playerState: null,
    cards: {},
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(gameReducer, initialState);

  const createGame = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const deck = initializeDeck();
      const shuffledDeck = shuffleDeck(deck);
      const cardMap = deck.reduce((acc, card) => ({ ...acc, [card.id]: card }), {});
      
      dispatch({ type: 'SET_CARDS', payload: cardMap });
      
      const newGame = await client.models.Game.create({
        status: 'waiting',
        playerIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deck: shuffledDeck.map(card => card.id),
        discardPile: []
      });

      dispatch({ type: 'SET_GAME_STATE', payload: newGame });
      return newGame.id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create game' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const joinGame = useCallback(async (gameId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const game = await client.models.Game.get({ id: gameId });
      if (!game) throw new Error('Game not found');
      
      dispatch({ type: 'SET_GAME_STATE', payload: game });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join game' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const playCard = useCallback(async (cardId: string, targetPlayerId?: string) => {
    if (!state.gameState || !state.playerState) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await client.models.Move.create({
        gameId: state.gameState.id,
        playerId: state.playerState.playerId,
        type: 'play',
        cardIds: [cardId],
        timestamp: new Date().toISOString(),
        targetPlayerId
      });

      const updatedHand = state.playerState.hand.filter(id => id !== cardId);
      await client.models.PlayerGameState.update({
        id: state.playerState.id,
        hand: updatedHand
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to play card' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.gameState, state.playerState]);

  const drawCard = useCallback(async () => {
    if (!state.gameState || !state.playerState) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const deck = [...state.gameState.deck];
      const drawnCard = deck.pop();
      
      if (!drawnCard) throw new Error('No cards left in deck');

      await client.models.Game.update({
        id: state.gameState.id,
        deck
      });

      await client.models.PlayerGameState.update({
        id: state.playerState.id,
        hand: [...state.playerState.hand, drawnCard]
      });

      await client.models.Move.create({
        gameId: state.gameState.id,
        playerId: state.playerState.playerId,
        type: 'draw',
        cardIds: [drawnCard],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to draw card' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.gameState, state.playerState]);

  const value = {
    ...state,
    createGame,
    joinGame,
    playCard,
    drawCard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};