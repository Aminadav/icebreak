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
        path="name" 
        element={<GiveGameNamePage gameId={gameId} initialGameName={gameData.gameName} />} 
      />
      <Route 
        path="phone" 
        element={<EnterPhoneNumberPage gameId={gameId} />} 
      />
      <Route 
        path="verify" 
        element={
          <Enter2faCodePage 
            gameId={gameId} 
            phoneNumber={userData.phoneNumber || ''} 
          />
        } 
      />
      <Route 
        path="email" 
        element={
          <EnterEmailPage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
          />
        } 
      />
      <Route 
        path="player-name" 
        element={
          <EnterNamePage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
            email={userData.email || ''}
          />
        } 
      />
      <Route 
        path="gender" 
        element={
          <SelectGenderPage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
            email={userData.email || ''}
            name={userData.name || ''}
          />
        } 
      />
      <Route 
        path="avatar" 
        element={
          <PictureUploadPage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
            email={userData.email || ''}
            name={userData.name || ''}
            gender={userData.gender || ''}
          />
        } 
      />
      <Route 
        path="camera" 
        element={
          <CameraPage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
            email={userData.email || ''}
            name={userData.name || ''}
            gender={userData.gender || ''}
          />
        } 
      />
      <Route 
        path="gallery" 
        element={
          <ImageGalleryPage 
          />
        } 
      />
      <Route 
        path="ready" 
        element={
          <CreatorGameReadyPage 
            gameId={gameId}
            phoneNumber={userData.phoneNumber || ''}
            userId={userData.userId || ''}
            email={userData.email || ''}
            name={userData.name || ''}
            gender={userData.gender || ''}
            selectedImageHash={userData.selectedImageHash || 'no-image'}
          />
        } 
      />

      <Route 
        path="play" 
        element={<Play />} 
      />
      {/* Default redirect to name step */}
      <Route 
        path="*" 
        element={<Navigate to={`/game/${gameId}/name`} replace />} 
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
