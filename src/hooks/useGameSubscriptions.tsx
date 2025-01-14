import { generateClient } from "@aws-amplify/api";
import { Hub } from '@aws-amplify/core';
import { CONNECTION_STATE_CHANGE, ConnectionState } from '@aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { useGameStore } from '../store/gameStore';
import { useEffect } from 'react';
import { getCardById } from "../lib/cards"

const client = generateClient<Schema>();

type Game = Schema['Game']['type'];
type PlayerGameState = Schema['PlayerGameState']['type'];
type Move = Schema['Move']['type'];

// Helper function to calculate bank total from money cards
const calculateBankTotal = (cardIds: string[]): number => {
    return cardIds
      .map(getCardById)
      .filter(card => card?.type === 'money')
      .reduce((total, card) => total + (card?.value || 0), 0);
  };
  
export function useGameSubscriptions(gameId: string) {
  const { 
    currentPlayer,
  } = useGameStore();

  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game state changes
    const gameSub = client.models.Game.onUpdate({
      filter: { id: { eq: gameId } }
    }).subscribe({
      next: (gameData: Game) => {
        if (!gameData) return;
        
        // Update game state based on changes
        if (gameData.status === 'completed' && gameData.winner) {
          useGameStore.setState({ winner: gameData.winner });
        }
        
        if (gameData.currentPlayerIndex !== currentPlayer) {
          useGameStore.setState({ currentPlayer: gameData.currentPlayerIndex });
        }

        // Update deck and discard pile if they exist
        if (gameData.deck && gameData.discardPile) {
                      const newDeck = gameData.deck?.filter((cardId): cardId is string => cardId !== null).map(cardId => getCardById(cardId))
                const newDiscardPile = gameData.discardPile?.filter((cardId): cardId is string => cardId !== null).map(cardId => getCardById(cardId))
          useGameStore.setState({
            deck: newDeck,
            discardPile: newDiscardPile
          });
        }
      },
      error: (error) => console.error('Game subscription error:', error)
    });

      // Subscribe to player game state changes
      const playerStateSub = client.models.PlayerGameState.onUpdate({
        filter: { gameId: { eq: gameId } }
      }).subscribe({
        next: (playerData: PlayerGameState) => {
          if (!playerData) return;
          
          useGameStore.setState(state => ({
            players: state.players.map(player => 
              player.id === playerData.playerId ? {
                ...player,
                hand: (playerData.hand || [])
                  .filter((id): id is string => id !== null)
                  .map(getCardById),
                properties: [(playerData.properties || [])
                  .filter((id): id is string => id !== null)
                  .map(getCardById)],
                bank: calculateBankTotal((playerData.bank || [])
                  .filter((id): id is string => id !== null))
              } : player
            )
          }));
        },
        error: (error) => console.error('Player state subscription error:', error)
      });

// Subscribe to new moves
const moveSub = client.models.Move.onCreate({
    filter: { gameId: { eq: gameId } }
  }).subscribe({
    next: (moveData: Move) => {
      if (!moveData) return;
      
      switch (moveData.type) {
        case 'draw':
          useGameStore.setState(state => ({
            deck: state.deck,
            players: state.players.map(player =>
              player.id === moveData.playerId ? {
                ...player,
                hand: [...player.hand, ...moveData.cardIds.filter((id): id is string => id !== null).map(getCardById)]              } : player
            )
          }));
          break;
        
    //     case 'play':
    //       useGameStore.setState(state => {
    //         const updatedPlayers = state.players.map(player => {
    //           if (player.id === moveData.playerId) {
    //             // If the card being played is a money card, update the bank
    //             const playedCards = moveData.cardIds.map(getCardById);
    //             const moneyCards = playedCards.filter(card => card?.type === 'money');
    //             const newBankTotal = player.bank + moneyCards.reduce((sum, card) => sum + (card?.value || 0), 0);
                
    //             return {
    //               ...player,
    //               hand: player.hand.filter(card => !moveData.cardIds.includes(card.id)),
    //               bank: newBankTotal
    //             };
    //           }
    //           return player;
    //         });
    //         return { players: updatedPlayers };
    //       });
    //       break;
          
    //     // case 'discard':
    //     //   useGameStore.setState(state => ({
    //     //     discardPile: [...state.discardPile, ...moveData.cardIds],
    //     //     players: state.players.map(player =>
    //     //       player.id === moveData.playerId ? {
    //     //         ...player,
    //     //         hand: player.hand.filter(card => !moveData.cardIds.includes(card.id))
    //     //       } : player
    //     //     )
    //     //   }));
    //       break;
      }
    },
    error: (error) => console.error('Move subscription error:', error)
  });

    // Monitor connection state
    const connectionSub = Hub.listen('api', (data) => {
      const { payload } = data;
      if (payload.event === CONNECTION_STATE_CHANGE && 
          payload.data && 
          typeof payload.data === 'object' && 
          'connectionState' in payload.data) {
        const connectionState = payload.data.connectionState as ConnectionState;
        console.log('Subscription connection state:', connectionState);
      }
    });

    // Cleanup subscriptions
    return () => {
      gameSub.unsubscribe();
      playerStateSub.unsubscribe();
      moveSub.unsubscribe();
      connectionSub();
    };
  }, [gameId, currentPlayer]);
}