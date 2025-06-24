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
  currentBadge: any | null;
  allBadges: any[];
  isLoading: boolean;
  error: string | null;
  refreshPoints: () => void;
  refreshBadges: () => void;
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
  const [currentBadge, setCurrentBadge] = useState<any | null>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log({userData})

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

  const refreshBadges = () => {
    if (socket && gameId && userData.userId) {
      console.log('🏆 GameContext: Refreshing badges for user', userData.userId, 'in game', gameId);
      socket.emit('get_user_badges', { gameId }, (response: any) => {
        if (response?.success) {
          console.log('🏆 GameContext: Badges refreshed:', response);
          setCurrentBadge(response.currentBadge);
          setAllBadges(response.allBadges || []);
        }
      });
    }
  };

  // Validate game and load data
  console.log('@@',{gameId,socket})
  console.log('##',socket?.connected)
  useEffect(() => {
    console.log('InEffect1')
    if (!gameId || !socket) {
      setIsLoading(false);
      return;
    }
    console.log('InEffect2')

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
      console.log('####')
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

      console.log('THE BIG EMIT')
      socket.emit('get_game_data', { gameId });
      
      // Request complete user data on page load
      console.log('🎮 GameContext: Requesting complete user data on page load');
      socket.emit('get_user_game_data', { gameId });
    };

    // Listen for user data updates (complete user data from server)
    const userDataUpdatedHandler = (data: any) => {
      if (data.success) {
        console.log('🎮 GameContext: User data updated:', data);
        setUserData({
          phoneNumber: data.phoneNumber,
          userId: data.userId,
          email: data.email,
          name: data.name,
          gender: data.gender,
          selectedImageHash: data.selectedImageHash,
          points: data.points
        });
        
        // Update badges if provided
        if (data.currentBadge !== undefined) {
          setCurrentBadge(data.currentBadge);
        }
        if (data.allBadges !== undefined) {
          setAllBadges(data.allBadges || []);
        }
      }
    };

    // Also listen for device registration to get user data (backward compatibility)
    const deviceRegisteredHandler = (data: any) => {
      if (data.success) {
        console.log('🎮 GameContext: Device registered, requesting complete user data');
        // Request complete user data instead of setting partial data
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    // Listen for successful 2FA verification which creates/finds the user
    const twoFAVerifiedHandler = (data: any) => {
      if (data.success && data.user) {
        console.log('🎮 GameContext: 2FA verified, requesting complete user data');
        // Request complete user data instead of setting partial data
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    // Listen for user data updates (name saved, gender saved, etc.)
    const nameUpdatedHandler = (data: any) => {
      if (data.success && data.name) {
        console.log('🎮 GameContext: Name updated, requesting complete user data');
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const emailUpdatedHandler = (data: any) => {
      if (data.success && data.email) {
        console.log('🎮 GameContext: Email updated, requesting complete user data');
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const genderUpdatedHandler = (data: any) => {
      if (data.success && data.gender) {
        console.log('🎮 GameContext: Gender updated, requesting complete user data');
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const smsSentHandler = (data: any) => {
      if (data.success && data.phoneNumber) {
        console.log('🎮 GameContext: SMS sent, requesting complete user data');
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
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
        
        // If points updated included badge info, refresh all user data to get updated badges
        if (data.earnedBadge || data.hasPendingBadge) {
          console.log('🏆 GameContext: Badge-related points update, requesting complete user data');
          if (gameId) {
            socket.emit('get_user_game_data', { gameId });
          }
        }
      }
    };

    // Listen for badge updates
    const badgeUpdatedHandler = (data: any) => {
      console.log('🏆 GameContext: Badges updated:', data);
      setCurrentBadge(data.currentBadge);
      setAllBadges(data.allBadges || []);
    };

    socket.on('user_game_data_updated', userDataUpdatedHandler);
    socket.on('device_registered', deviceRegisteredHandler);
    socket.on('2fa_verified', twoFAVerifiedHandler);
    socket.on('sms_sent', smsSentHandler);
    socket.on('name_saved', nameUpdatedHandler);
    socket.on('gender_saved', genderUpdatedHandler);
    socket.on('my_points', pointsUpdatedHandler);
    socket.on('points_updated', pointsUpdatedHandler);
    socket.on('user_badges_updated', badgeUpdatedHandler);

    loadGameData();

    return () => {
      socket.off('user_game_data_updated', userDataUpdatedHandler);
      socket.off('device_registered', deviceRegisteredHandler);
      socket.off('2fa_verified', twoFAVerifiedHandler);
      socket.off('sms_sent', smsSentHandler);
      socket.off('name_saved', nameUpdatedHandler);
      socket.off('gender_saved', genderUpdatedHandler);
      socket.off('my_points', pointsUpdatedHandler);
      socket.off('points_updated', pointsUpdatedHandler);
      socket.off('user_badges_updated', badgeUpdatedHandler);
    };
  }, [gameId, socket,socket?.connected]);

  // Note: User data loading is now handled by get_user_game_data socket event
  // No separate effects needed for points/badges loading

  function gameEmitter(eventName:string,data:any={},callback:Function | undefined = undefined) {
    data.gameId= gameId;
    // console.log(`🎮 GameContext: Emitting event ${eventName} with data`, data);
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
    currentBadge,
    allBadges,
    isLoading,
    error,
    refreshPoints,
    refreshBadges,
    gameEmitter,
    emitMoveToNextPage
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext)!;
  return context;
}

export function usePoints() {
  const { points, refreshPoints } = useGame();
  return { points, refreshPoints };
}
