export type PropertyColor = 
  | 'brown'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'orange'
  | 'pink'
  | 'lightBlue'
  | 'railroad'
  | 'utility';

export type CardType = 
  | 'property'
  | 'money'
  | 'action'
  | 'rent'
  | 'wildcard';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  value: number;
  color?: PropertyColor;
  imageUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  properties: Card[][];
  money: Card[];
  bank: number;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  deck: Card[];
  discardPile: Card[];
  winner: string | null;
  actionInProgress: string | null;
}