import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useParams } from 'react-router-dom';
import { env } from '../env';

interface GameData {
  gameId: string;
  gameName: string;
  status: "waiting_for_creator_answers" | "ready";
  createdAt: string;
  answeredQuestionsAboutThemself?: number;
  answeredQuestionsAboutOthers?: number;
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
  answeredQuestionsAboutMe: number;
  answeredQuestionsAboutOthers: number;
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
            createdAt: data.createdAt,
            answeredQuestionsAboutThemself: data.answeredQuestionsAboutThemself || 0,
            answeredQuestionsAboutOthers: data.answeredQuestionsAboutOthers || 0
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

      socket.emit('get_game_data', { gameId });
      
      // Request complete user data on page load
      socket.emit('get_user_game_data', { gameId });
    };

    // Listen for user data updates (complete user data from server)
    const userDataUpdatedHandler = (data: any) => {
      if (data.success) {
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
        // Request complete user data instead of setting partial data
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    // Listen for successful 2FA verification which creates/finds the user
    const twoFAVerifiedHandler = (data: any) => {
      if (data.success && data.user) {
        // Request complete user data instead of setting partial data
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    // Listen for user data updates (name saved, gender saved, etc.)
    const nameUpdatedHandler = (data: any) => {
      if (data.success && data.name) {
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const emailUpdatedHandler = (data: any) => {
      if (data.success && data.email) {
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const genderUpdatedHandler = (data: any) => {
      if (data.success && data.gender) {
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    const smsSentHandler = (data: any) => {
      if (data.success && data.phoneNumber) {
        if (gameId) {
          socket.emit('get_user_game_data', { gameId });
        }
      }
    };

    // Listen for points updates
    const pointsUpdatedHandler = (data: any) => {
      if (data.success && typeof data.points === 'number') {
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

    // Listen for game data updates (answer counts)
    const gameDataUpdatedHandler = (data: any) => {
      if (data.success && data.gameId === gameId) {
        // console.log('📊 GameContext: Game data updated:', data);
        setGameData(data);
        setIsLoading(false);
      }
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
    socket.on('game_data_updated', gameDataUpdatedHandler);

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
      socket.off('game_data_updated', gameDataUpdatedHandler);
    };
  }, [gameId, socket,socket?.connected]);

  // Debug: Listen for Control key press to get user metadata
  useEffect(() => {
    if (!env.is_dev || !socket || !gameId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        socket.emit('debug_get_user_metadata', { gameId });
      }
    };


    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, gameId]);

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
    answeredQuestionsAboutMe: gameData?.answeredQuestionsAboutThemself || 0,
    answeredQuestionsAboutOthers: gameData?.answeredQuestionsAboutOthers || 0,
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
