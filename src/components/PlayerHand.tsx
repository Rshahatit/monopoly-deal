import { motion } from 'framer-motion';
import { Card } from './Card';
import { Card as CardType } from '../types/game';

interface PlayerHandProps {
  cards: CardType[];
  onPlayCard: (card: CardType) => void;
}

export const PlayerHand = ({ cards, onPlayCard }: PlayerHandProps) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 p-4 overflow-x-auto"
      initial={{ y: 200 }}
      animate={{ y: 0 }}
    >
      <div className="flex gap-2 min-w-max px-4 mx-auto max-w-[90vw]">
        {cards.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{ zIndex: index }}
          >
            <Card
              card={card}
              onClick={() => onPlayCard(card)}
              className="hover:-translate-y-4 transition-transform"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};