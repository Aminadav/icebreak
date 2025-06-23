import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useParams } from 'react-router-dom';

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
  points?: number;
}

interface GameContextType {
  gameId: string | null;
  gameData: GameData | null;
  userData: UserData;
  points: number;
  isLoading: boolean;
  error: string | null;
  refreshPoints: () => void;
  gameEmitter:(eventName:string,data:Object,callback?:Function)=>void
  emitMoveToNextPage: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const { socket } = useSocket();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPoints = () => {
    if (socket && gameId && userData.userId) {
      console.log('🎯 GameContext: Refreshing points for user', userData.userId, 'in game', gameId);
      socket.emit('my_points', { gameId }, (response: any) => {
        if (response?.success && typeof response.points === 'number') {
          console.log('🎯 GameContext: Points refreshed:', response.points);
          setUserData(prev => ({
            ...prev,
            points: response.points
          }));
        }
      });
    }
  };

  // Validate game and load data
  useEffect(() => {
    if (!gameId || !socket) {
      setIsLoading(false);
      return;
    }

    // Set a timeout to show error if socket doesn't connect within reasonable time
    const socketTimeout = setTimeout(() => {
      if (!socket) {
        setError('Unable to connect to game server');
        setIsLoading(false);
      }
    }, 5000);

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
      console.log('🎮 GameContext: Requesting device registration to get latest user data');
      socket.emit('register_device', {});
    };

    // Also listen for device registration to get user data
    const deviceRegisteredHandler = (data: any) => {
      if (data.success) {
        console.log('🎮 GameContext: Device registered with user data:', data);
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
        console.log('🎮 GameContext: 2FA verified, updating userData with user info:', data.user);
        setUserData(prev => ({
          ...prev,
          phoneNumber: data.user.phoneNumber,
          userId: data.user.userId
        }));
      }
    };

    // Listen for user data updates (email saved, name saved, etc.)
    const nameUpdatedHandler = (data: any) => {
      if (data.success && data.name) {
        console.log('🎮 GameContext: Name updated:', data.name);
        setUserData(prev => ({
          ...prev,
          name: data.name
        }));
      }
    };

    const emailUpdatedHandler = (data: any) => {
      if (data.success && data.email) {
        console.log('🎮 GameContext: Email updated');
        setUserData(prev => ({
          ...prev,
          email: data.email
        }));
      }
    };

    const genderUpdatedHandler = (data: any) => {
      if (data.success && data.gender) {
        console.log('🎮 GameContext: Gender updated');
        setUserData(prev => ({
          ...prev,
          gender: data.gender
        }));
      }
    };

    const smsSentHandler = (data: any) => {
      if (data.success && data.phoneNumber) {
        console.log('🎮 GameContext: SMS sent, updating userData with phone number:', data.phoneNumber);
        setUserData(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber
        }));
      }
    };

    // Listen for points updates
    const pointsUpdatedHandler = (data: any) => {
      if (data.success && typeof data.points === 'number') {
        console.log('🎯 GameContext: Points updated:', data.points);
        setUserData(prev => ({
          ...prev,
          points: data.points
        }));
      }
    };

    socket.on('device_registered', deviceRegisteredHandler);
    socket.on('2fa_verified', twoFAVerifiedHandler);
    socket.on('sms_sent', smsSentHandler);
    socket.on('name_saved', nameUpdatedHandler);
    socket.on('gender_saved', genderUpdatedHandler);
    socket.on('my_points', pointsUpdatedHandler);
    socket.on('points_updated', pointsUpdatedHandler);

    loadGameData();

    return () => {
      socket.off('device_registered', deviceRegisteredHandler);
      socket.off('2fa_verified', twoFAVerifiedHandler);
      socket.off('sms_sent', smsSentHandler);
      socket.off('name_saved', nameUpdatedHandler);
      socket.off('gender_saved', genderUpdatedHandler);
      socket.off('my_points', pointsUpdatedHandler);
      socket.off('points_updated', pointsUpdatedHandler);
    };
  }, [gameId, socket]);

  // Load user points when both gameId and userId are available
  useEffect(() => {
    if (socket && gameId && userData.userId && userData.points === undefined) {
      console.log('🎯 GameContext: Loading points for user', userData.userId, 'in game', gameId);
      socket.emit('my_points', { gameId }, (response: any) => {
        if (response?.success && typeof response.points === 'number') {
          console.log('🎯 GameContext: Points loaded:', response.points);
          setUserData(prev => ({
            ...prev,
            points: response.points
          }));
        }
      });
    }
  }, [socket, gameId, userData.userId, userData.points]);

  function gameEmitter(eventName:string,data:any={},callback:Function | undefined = undefined) {
    data.gameId= gameId;
    socket.emit(eventName,data,callback);
  }
  function emitMoveToNextPage(){
    gameEmitter('get_next_screen')
  }



  const value: GameContextType = {
    gameId: gameId || null,
    gameData,
    userData,
    points: userData.points || 0,
    isLoading,
    error,
    refreshPoints,
    gameEmitter,
    emitMoveToNextPage
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function usePoints() {
  const { points, refreshPoints } = useGame();
  return { points, refreshPoints };
}
