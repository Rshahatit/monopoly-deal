// Game Constants

export const adjectives = [
  "Red", "Blue", "Green", "Golden", "Silver", "Brave", "Mighty", "Swift",
  "Clever", "Wise", "Royal", "Ancient", "Mystic", "Magic", "Wild",
  "Epic", "Grand", "Noble", "Bold", "Daring"
];

export const nouns = [
  "Phoenix", "Dragon", "Knight", "Warrior", "Quest", "Journey", "Adventure",
  "Legend", "Tale", "Saga", "Crown", "Kingdom", "Realm", "Victory",
  "Challenge", "Battle", "Contest", "Game", "Match", "Tournament"
];
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  INITIAL_HAND_SIZE: 5,
  MAX_HAND_SIZE: 7,
  MAX_PROPERTIES_PER_SET: 4
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_GAME_STATE: "Game state is missing or invalid",
  NO_PLAYER_STATE: "Player state is missing or invalid",
  NO_CARDS: "No cards found in game state",
  NOT_ENOUGH_PLAYERS: (current: number) => 
    `Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players. Current: ${current}`,
  NOT_ENOUGH_CARDS: (needed: number, available: number) =>
    `Not enough cards in deck. Need ${needed}, have ${available}`
};

// Status Messages
export const STATUS_MESSAGES = {
  WAITING: "Waiting for players to join...",
  ACTIVE: (playerId: string) => `Game in progress - ${playerId}'s turn`,
  COMPLETED: "Game completed",
  LOADING: "Loading game state..."
};