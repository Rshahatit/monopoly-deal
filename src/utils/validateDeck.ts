import { Card } from './types';

export function validateDeck(deck: Card[]): boolean {
  // Validate total card count
  if (deck.length !== 110) {
    console.error(`Invalid deck size: ${deck.length}, expected 110`);
    return false;
  }

  // Count cards by type
  const counts = {
    property: 0,
    money: 0,
    action: 0
  };

  // First validate card structure
  for (const card of deck) {
    if (!card.id || !card.type || !card.name || typeof card.value !== 'number') {
      console.error('Invalid card structure:', card);
      return false;
    }

    // Validate required fields for each type
    switch (card.type) {
      case 'property':
        if (!card.propertySetId || !card.rentValues) {
          console.error('Invalid property card:', card);
          return false;
        }
        break;
      case 'action':
        if (!card.subType) {
          console.error('Missing subType for card:', card);
          return false;
        }
        break;
      case 'money':
        if (!card.subType || !card.value) {
          console.error('Invalid money card:', card);
          return false;
        }
        break;
    }

    if (card.type in counts) {
      counts[card.type as keyof typeof counts]++;
    }
  };

  // Validate card type distribution
  const testCounts = {
    property: counts.property,
    money: counts.money,
    action: counts.action
  };

  const isValid = (
    testCounts.property === 28 &&
    testCounts.money === 20 &&
    testCounts.action === 62 // All action, rent and wildcards count as action cards
  );

  if (!isValid) {
    console.error('Invalid card distribution:', counts);
    console.error('Expected: property=28, money=20, action=62');
  }

  return isValid;
}