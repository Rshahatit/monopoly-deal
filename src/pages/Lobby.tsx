import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const Lobby = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>(['']);
  const initializeGame = useGameStore(state => state.initializeGame);

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, '']);
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    if (validPlayers.length >= 2) {
      initializeGame(validPlayers);
      navigate('/game');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="mb-8 text-white flex items-center gap-2 hover:text-gray-200"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Game Lobby</h2>
          </div>

          <div className="space-y-4">
            {players.map((player, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player {index + 1}
                </label>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  placeholder={`Enter player ${index + 1} name`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {players.length < 4 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addPlayer}
                className="w-full py-2 px-4 border-2 border-purple-600 text-purple-600 rounded-md flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
              >
                <UserPlus size={20} />
                Add Player
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              disabled={players.filter(name => name.trim() !== '').length < 2}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Start Game
            </motion.button>
          </div>
        </div>

        <div className="mt-4 text-center text-white text-sm">
          {players.filter(name => name.trim() !== '').length < 2 ? (
            <p>Add at least 2 players to start the game</p>
          ) : (
            <p>Ready to start! Click the button above to begin.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};