import { Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import Play from '../pages/play';

function GameRoutes(): JSX.Element {
  const { gameId, gameData, isLoading, error } = useGame();

  if (!gameId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-red-400">Invalid game ID</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-white">טוען נתוני משחק...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-red-400">
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="play" 
        element={<Play />} 
      />
    </Routes>
  );
}

export default function GameRouter(): JSX.Element {
  return (
    <GameProvider>
      <GameRoutes />
    </GameProvider>
  );
}
