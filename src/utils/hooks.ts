import { useRef, useEffect } from 'react';
import type { Schema } from '../../amplify/data/resource';
import { logGameState } from './logger';

export function useGameSubscription(
  gameId: string | undefined,
  onGameUpdate: (game: Schema["Game"]["type"]) => void
) {
  useEffect(() => {
    if (!gameId) return;

    logGameState("Setting up game subscription", { gameId });

    const sub = client.models.Game.observeQuery({
      filter: { id: { eq: gameId } }
    }).subscribe({
      next: ({ items }) => {
        const game = items[0];
        if (game) {
          logGameState("Game update received", {
            id: game.id,
            status: game.status
          });
          onGameUpdate(game);
        }
      }
    });

    return () => {
      logGameState("Cleaning up game subscription", { gameId });
      sub.unsubscribe();
    };
  }, [gameId]);
}

export function useUpdateEffect(effect: () => void, deps: any[]) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
}