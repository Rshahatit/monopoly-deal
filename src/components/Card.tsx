import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';
import { PROPERTY_COLORS } from '../lib/cards';
import { cn } from '../lib/utils';
import { DollarSign, Zap } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  className?: string;
  miniature?: boolean;
}

export const Card = ({ card, onClick, className, miniature = false }: CardProps) => {
  const baseClasses = miniature
    ? 'w-16 h-24 text-xs'
    : 'w-32 h-48 text-sm';

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={cn(
        'relative rounded-lg shadow-lg',
        'bg-white border-2',
        baseClasses,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 p-2 flex flex-col">
        <div className={cn(
          "font-bold mb-1 truncate",
          miniature ? "text-[8px]" : "text-sm"
        )}>
          {card.name}
        </div>
        {card.color && (
          <div 
            className="w-full h-2 rounded"
            style={{ backgroundColor: PROPERTY_COLORS[card.color].hex }}
          />
        )}
        {card.type === 'money' && (
          <div className="flex-1 flex items-center justify-center">
            <DollarSign size={miniature ? 16 : 32} className="text-green-600" />
          </div>
        )}
        {card.type === 'action' && (
          <div className="flex-1 flex items-center justify-center">
            <Zap size={miniature ? 16 : 32} className="text-yellow-500" />
          </div>
        )}
        <div className={cn(
          "absolute bottom-2 right-2 font-bold",
          miniature ? "text-sm" : "text-xl"
        )}>
          {card.value}M
        </div>
      </div>
    </motion.div>
  );
};