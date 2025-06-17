import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
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
import BeforeStartAskAboutYou from '../pages/BeforeStartAskAboutYou';

interface GameData {
  gameId: string;
  gameName: string;
  status: string;
  createdAt: string;
}

interface UserData {
  phoneNumber?: string;
  userId?: string;
  email?: string;
  name?: string;
  gender?: string;
  selectedImageHash?: string;
}

export default function GameRouter(): JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const { socket } = useSocket();
  const location = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Early return if no gameId
  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl">Invalid game ID</div>
      </div>
    );
  }

  console.log('🎮 GameRouter: gameId =', gameId, 'type:', typeof gameId);
  console.log('🎮 GameRouter: userData =', userData);
  console.log('🎮 GameRouter: gameData =', gameData);

  // Validate game and load data
  useEffect(() => {
    // Set a timeout to show error if socket doesn't connect within reasonable time
    const socketTimeout = setTimeout(() => {
      if (!socket) {
        setError('Unable to connect to game server');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    if (!socket) {
      // Don't set error immediately - socket might still be connecting
      return () => clearTimeout(socketTimeout);
    }

    // Clear timeout since we have socket
    clearTimeout(socketTimeout);

    const loadGameData = () => {
      // Set up listeners for game data
      const gameDataHandler = (data: any) => {
        if (data.success && data.gameId === gameId) {
          setGameData({
            gameId: data.gameId,
            gameName: data.gameName,
            status: data.status,
            createdAt: data.createdAt
          });
          setIsLoading(false);
        }
        socket.off('game_data', gameDataHandler);
      };

      const errorHandler = (data: any) => {
        setError(data.message || 'Failed to load game data');
        setIsLoading(false);
        socket.off('game_data', gameDataHandler);
        socket.off('error', errorHandler);
      };

      socket.on('game_data', gameDataHandler);
      socket.on('error', errorHandler);

      // Request game data
      socket.emit('get_game_data', { gameId });
      
      // Also request current device registration to get latest user data
      console.log('🎮 GameRouter: Requesting device registration to get latest user data');
      socket.emit('register_device', {});
    };

    // Also listen for device registration to get user data
    const deviceRegisteredHandler = (data: any) => {
      if (data.success) {
        console.log('🎮 GameRouter: Device registered with user data:', data);
        console.log('🎮 GameRouter: pendingPhoneNumber from device registration:', data.phoneNumber);
        setUserData({
          phoneNumber: data.phoneNumber,
          userId: data.userId,
          email: data.email,
          name: data.name,
          gender: data.gender
        });
      }
    };

    // Listen for successful 2FA verification which creates/finds the user
    const twoFAVerifiedHandler = (data: any) => {
      if (data.success && data.user) {
        console.log('🎮 GameRouter: 2FA verified, updating userData with user info:', data.user);
        setUserData(prev => ({
          ...prev,
          phoneNumber: data.user.phoneNumber,
          userId: data.user.userId
        }));
      }
    };

    // Listen for user data updates (email saved, name saved, etc.)
    const nameUpdatedHandler = (data: any) => {
      console.log('🎮 GameRouter: Received name_saved event:', data);
      if (data.success && data.name) {
        console.log('🎮 GameRouter: Name updated, updating userData with name:', data.name);
        setUserData(prev => {
          const newUserData = {
            ...prev,
            name: data.name
          };
          console.log('🎮 GameRouter: Updated userData:', newUserData);
          return newUserData;
        });
      } else {
        console.log('🎮 GameRouter: Name update failed or missing name in data:', data);
      }
    };

    const emailUpdatedHandler = (data: any) => {
      if (data.success && data.email) {
        console.log('🎮 GameRouter: Email updated, updating userData');
        setUserData(prev => ({
          ...prev,
          email: data.email
        }));
      }
    };

    const genderUpdatedHandler = (data: any) => {
      if (data.success && data.gender) {
        console.log('🎮 GameRouter: Gender updated, updating userData');
        setUserData(prev => ({
          ...prev,
          gender: data.gender
        }));
      }
    };

    const smsSentHandler = (data: any) => {
      if (data.success && data.phoneNumber) {
        console.log('🎮 GameRouter: SMS sent, updating userData with phone number:', data.phoneNumber);
        setUserData(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber
        }));
      }
    };

    socket.on('device_registered', deviceRegisteredHandler);
    socket.on('2fa_verified', twoFAVerifiedHandler);
    socket.on('sms_sent', smsSentHandler);
    socket.on('name_saved', nameUpdatedHandler);
    socket.on('email_saved', emailUpdatedHandler);
    socket.on('gender_saved', genderUpdatedHandler);

    loadGameData();

    return () => {
      socket.off('device_registered', deviceRegisteredHandler);
      socket.off('2fa_verified', twoFAVerifiedHandler);
      socket.off('sms_sent', smsSentHandler);
      socket.off('name_saved', nameUpdatedHandler);
      socket.off('email_saved', emailUpdatedHandler);
      socket.off('gender_saved', genderUpdatedHandler);
    };
  }, [gameId, socket]);

  // Debug current route and userData whenever they change
  useEffect(() => {
    console.log('🎮 GameRouter: Current gameId:', gameId);
    console.log('🎮 GameRouter: Current userData:', userData);
    console.log('🎮 GameRouter: Current gameData:', gameData);
    console.log('🎮 GameRouter: Current pathname:', location.pathname);
    
    // Check conditions for gender page
    const hasRequiredForGender = userData.phoneNumber && userData.userId && userData.email && userData.name;
    console.log('🎮 GameRouter: Has required data for gender page:', hasRequiredForGender);
    console.log('🎮 GameRouter: Individual checks - phoneNumber:', !!userData.phoneNumber, 'userId:', !!userData.userId, 'email:', !!userData.email, 'name:', !!userData.name);
  }, [gameId, userData, gameData, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">טוען נתוני משחק...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl">
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
        path="before-start" 
        element={
          <BeforeStartAskAboutYou/>
        } 
      />
      <Route 
        path="questions" 
        element={
          <BeforeStartAskAboutYou 
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
      {/* Default redirect to name step */}
      <Route 
        path="*" 
        element={<Navigate to={`/game/${gameId}/name`} replace />} 
      />
    </Routes>
  );
}
