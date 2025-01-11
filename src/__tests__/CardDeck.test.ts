import { initializeDeck, shuffleDeck, dealInitialHands } from '../utils/CardDeck';

describe('CardDeck', () => {
  describe('initializeDeck', () => {
    it('should create a deck with the correct number of cards', () => {
      const deck = initializeDeck();
      expect(deck.length).toBe(110); // Total number of cards in Monopoly Deal
    });

    it('should have the correct distribution of card types', () => {
      const deck = initializeDeck();
      const propertyCards = deck.filter(card => card.type === 'property');
      const moneyCards = deck.filter(card => card.type === 'money');
      const actionCards = deck.filter(card => card.type === 'action');

      expect(propertyCards.length).toBe(28); // Total property cards
      expect(moneyCards.length).toBe(20); // Total money cards
      expect(actionCards.length).toBe(62); // Total action cards
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with the same number of cards', () => {
      const deck = initializeDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled.length).toBe(deck.length);
    });

    it('should maintain all original cards after shuffle', () => {
      const deck = initializeDeck();
      const shuffled = shuffleDeck(deck);
      
      const originalIds = new Set(deck.map(card => card.id));
      const shuffledIds = new Set(shuffled.map(card => card.id));
      
      expect(shuffledIds.size).toBe(originalIds.size);
      shuffled.forEach(card => {
        expect(originalIds.has(card.id)).toBe(true);
      });
    });
  });

  describe('dealInitialHands', () => {
    it('should deal correct number of cards to each player', () => {
      const deck = initializeDeck();
      const playerCount = 3;
      const { hands, remainingDeck } = dealInitialHands(deck, playerCount);
      
      expect(hands.length).toBe(playerCount);
      hands.forEach(hand => {
        expect(hand.length).toBe(5); // Each player should get 5 cards
      });
      expect(remainingDeck.length).toBe(deck.length - (playerCount * 5));
    });

    it('should not modify the original deck', () => {
      const deck = initializeDeck();
      const originalDeckLength = deck.length;
      dealInitialHands(deck, 3);
      expect(deck.length).toBe(originalDeckLength);
    });
  });
});