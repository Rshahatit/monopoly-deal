import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigateToGame = () => {
  const navigate = useNavigate();

  return useCallback((gameId: string) => {
    navigate(`/game/${gameId}`);
  }, [navigate]);
};