import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card as CardType, Player, PropertyColor } from '../types/game';
import { PROPERTY_COLORS } from '../lib/cards';
import { Card } from './Card';

interface CardPlayModalProps {
  card: CardType;
  players: Player[];
  onClose: () => void;
  onAction: (targetPlayerId?: string, selectedColor?: PropertyColor, targetPropertyId?: string) => void;
}

export function CardPlayModal({ card, players, onClose, onAction }: CardPlayModalProps) {
  const [selectedColor, setSelectedColor] = useState<PropertyColor | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const handleAction = () => {
    onAction(selectedPlayer || undefined, selectedColor || undefined, selectedProperty || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Play Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <Card card={card} className="transform-none hover:transform-none" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">{card.name}</h3>
            <p className="text-gray-600">Select how you want to play this card:</p>
          </div>
        </div>

        {card.type === 'property' && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Select Property Color:</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(PROPERTY_COLORS).map(([color, { name, hex }]) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color as PropertyColor)}
                  className={`p-2 rounded ${
                    selectedColor === color ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  <span className="sr-only">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {card.type === 'action' && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Select Target Player:</h4>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`p-2 rounded border ${
                    selectedPlayer === player.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={card.type === 'property' ? !selectedColor : false}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            Play Card
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}