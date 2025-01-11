type CardType = 'property' | 'money' | 'action';

interface Card {
  id: string;
  type: CardType;
  name: string;
  value: number;
  color?: string;
  imageUrl?: string;
}

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initialize the standard Monopoly Deal deck
export function initializeDeck(): Card[] {
  const deck: Card[] = [];

  // Property Cards
  const properties = [
    { color: 'brown', names: ['Mediterranean Avenue', 'Baltic Avenue'], value: 1 },
    { color: 'blue', names: ['Boardwalk', 'Park Place'], value: 4 },
    { color: 'green', names: ['Pacific Avenue', 'North Carolina Avenue', 'Pennsylvania Avenue'], value: 4 },
    { color: 'yellow', names: ['Atlantic Avenue', 'Ventnor Avenue', 'Marvin Gardens'], value: 3 },
    { color: 'red', names: ['Kentucky Avenue', 'Indiana Avenue', 'Illinois Avenue'], value: 3 },
    { color: 'orange', names: ['St. James Place', 'Tennessee Avenue', 'New York Avenue'], value: 2 },
    { color: 'purple', names: ['St. Charles Place', 'Virginia Avenue', 'States Avenue'], value: 2 },
    { color: 'light-blue', names: ['Connecticut Avenue', 'Vermont Avenue', 'Oriental Avenue'], value: 1 },
  ];

  properties.forEach(set => {
    set.names.forEach(name => {
      deck.push({
        id: generateId(),
        type: 'property',
        name,
        value: set.value,
        color: set.color,
      });
    });
  });

  // Money Cards
  const moneyValues = [
    { value: 1, count: 6 },
    { value: 2, count: 5 },
    { value: 3, count: 3 },
    { value: 4, count: 3 },
    { value: 5, count: 2 },
    { value: 10, count: 1 },
  ];

  moneyValues.forEach(({ value, count }) => {
    for (let i = 0; i < count; i++) {
      deck.push({
        id: generateId(),
        type: 'money',
        name: `${value}M`,
        value,
      });
    }
  });

  // Action Cards
  const actions = [
    { name: 'Deal Breaker', count: 2, value: 5 },
    { name: 'Just Say No', count: 3, value: 4 },
    { name: 'Sly Deal', count: 3, value: 3 },
    { name: 'Forced Deal', count: 3, value: 3 },
    { name: 'Debt Collector', count: 3, value: 3 },
    { name: 'It\'s My Birthday', count: 3, value: 2 },
    { name: 'Double The Rent', count: 2, value: 1 },
    { name: 'House', count: 3, value: 3 },
    { name: 'Hotel', count: 2, value: 4 },
    { name: 'Pass Go', count: 10, value: 1 },
  ];

  actions.forEach(({ name, count, value }) => {
    for (let i = 0; i < count; i++) {
      deck.push({
        id: generateId(),
        type: 'action',
        name,
        value,
      });
    }
  });

  return shuffleDeck(deck);
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal initial cards to players
export function dealInitialHands(deck: Card[], playerCount: number): {
  hands: Card[][],
  remainingDeck: Card[]
} {
  const hands: Card[][] = Array(playerCount).fill([]).map(() => []);
  const remainingDeck = [...deck];

  // Deal 5 cards to each player
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < playerCount; j++) {
      if (remainingDeck.length > 0) {
        const card = remainingDeck.pop()!;
        hands[j] = [...hands[j], card];
      }
    }
  }

  return { hands, remainingDeck };
}

export type { Card, CardType };