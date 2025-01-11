import { isPropertySetComplete, organizeProperties, canPlayCard, calculatePropertyValue, isGameWon } from '../utils/gameLogic';
import type { Card } from '../utils/CardDeck';

describe('Game Logic', () => {
  const mockPropertyCard = (color: string): Card => ({
    id: Math.random().toString(),
    type: 'property',
    name: `Test ${color}`,
    value: 1,
    color
  });

  describe('isPropertySetComplete', () => {
    it('should return true for a complete brown set', () => {
      const cards = [
        mockPropertyCard('brown'),
        mockPropertyCard('brown')
      ];
      expect(isPropertySetComplete(cards)).toBe(true);
    });

    it('should return false for an incomplete brown set', () => {
      const cards = [mockPropertyCard('brown')];
      expect(isPropertySetComplete(cards)).toBe(false);
    });

    it('should return true for a complete green set', () => {
      const cards = [
        mockPropertyCard('green'),
        mockPropertyCard('green'),
        mockPropertyCard('green')
      ];
      expect(isPropertySetComplete(cards)).toBe(true);
    });
  });

  describe('organizeProperties', () => {
    it('should group properties by color', () => {
      const cards = [
        mockPropertyCard('blue'),
        mockPropertyCard('blue'),
        mockPropertyCard('red'),
        mockPropertyCard('red'),
      ];

      const organized = organizeProperties(cards);
      expect(organized).toHaveLength(2); // Two color groups
      expect(organized[0].cards).toHaveLength(2); // Two blue cards
      expect(organized[1].cards).toHaveLength(2); // Two red cards
    });

    it('should mark complete sets', () => {
      const cards = [
        mockPropertyCard('brown'),
        mockPropertyCard('brown'), // Complete brown set
        mockPropertyCard('green'), // Incomplete green set
      ];

      const organized = organizeProperties(cards);
      const brownSet = organized.find(set => set.color === 'brown');
      const greenSet = organized.find(set => set.color === 'green');

      expect(brownSet?.isComplete).toBe(true);
      expect(greenSet?.isComplete).toBe(false);
    });
  });

  describe('isGameWon', () => {
    it('should return true with 3 complete property sets', () => {
      const cards: { [key: string]: Card } = {
        'b1': mockPropertyCard('brown'),
        'b2': mockPropertyCard('brown'),
        'bl1': mockPropertyCard('blue'),
        'bl2': mockPropertyCard('blue'),
        'g1': mockPropertyCard('green'),
        'g2': mockPropertyCard('green'),
        'g3': mockPropertyCard('green'),
      };

      const playerState = {
        id: '1',
        playerId: '1',
        gameId: '1',
        properties: Object.keys(cards),
        hand: [],
        bank: []
      };

      expect(isGameWon(playerState, cards)).toBe(true);
    });

    it('should return false with incomplete sets', () => {
      const cards: { [key: string]: Card } = {
        'b1': mockPropertyCard('brown'),
        'bl1': mockPropertyCard('blue'),
        'g1': mockPropertyCard('green'),
      };

      const playerState = {
        id: '1',
        playerId: '1',
        gameId: '1',
        properties: Object.keys(cards),
        hand: [],
        bank: []
      };

      expect(isGameWon(playerState, cards)).toBe(false);
    });
  });
});