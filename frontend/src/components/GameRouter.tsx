import { Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import GiveGameNamePage from '../pages/GiveGameNamePage';
import EnterPhoneNumberPage from '../pages/EnterPhoneNumberPage';
import Enter2faCodePage from '../pages/Enter2faCodePage';
import EnterEmailPage from '../pages/EnterEmailPage';
import EnterNamePage from '../pages/EnterNamePage';
import SelectGenderPage from '../pages/SelectGenderPage';
import PictureUploadPage from '../pages/PictureUploadPage';
import CameraPage from '../pages/CameraPage';
import ImageGalleryPage from '../pages/ImageGalleryPage';
import CreatorGameReadyPage from '../pages/CreatorGameReadyPage';
import Play from '../pages/play';

function GameRoutes(): JSX.Element {
  const { gameId, gameData, userData, isLoading, error } = useGame();

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
          {error || 'משחק לא נמצא'}
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
