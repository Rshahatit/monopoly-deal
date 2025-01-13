// Utility functions for logging game state

export const logGameState = (message: string, data: any) => {
  console.log(`[Game State] ${message}:`, JSON.stringify(data, null, 2));
};

export const logPlayerState = (message: string, data: any) => {
  console.log(`[Player State] ${message}:`, JSON.stringify(data, null, 2));
};

export const logError = (message: string, error: any) => {
  console.error(`[Error] ${message}:`, error);
};