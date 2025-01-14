import { motion } from 'framer-motion';
import { PlayIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-white mb-8">
          Monopoly Deal Online
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 text-white px-8 py-4 rounded-full text-xl font-bold flex items-center gap-2"
          onClick={() => navigate('/lobby')}
        >
          <PlayIcon />
          Play Now
        </motion.button>
      </motion.div>
    </div>
  );
};