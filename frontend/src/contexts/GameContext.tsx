import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { simpleSocketService } from '../services/simpleSocketService';
import { getDeviceId, setDeviceId, generateUUID } from '../utils/deviceManager';
import type { UserData, GameData, DeviceRegisteredResponse, GameCreatedResponse, ErrorResponse } from '../services/types';

console.log('📁 GameContext module loaded');

interface GameContextType {
  // State
  userData: UserData | null;
  currentGame: GameData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createGame: (gameName: string) => Promise<void>;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  console.log('🚀 GameProvider rendered');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize socket connection and device registration
  useEffect(() => {
    console.log('🔄 GameContext useEffect triggered, isInitialized:', isInitialized);
    console.log('🔄 Current timestamp:', new Date().toISOString());
    if (!isInitialized) {
      console.log('▶️ Starting initialization...');
      setIsInitialized(true);
      initializeConnection();
    } else {
      console.log('⏭️ Already initialized, skipping...');
    }
    
    return () => {
      console.log('🧹 GameContext useEffect cleanup called');
      socketService.disconnect();
    };
  }, [isInitialized]);

  const initializeConnection = async () => {
    try {
      console.log('🔗 Initializing socket connection...');
      console.log('📊 Current socket state:', {
        isConnected: socketService.isConnected(),
        socketId: socketService.getSocketId()
      });
      setIsLoading(true);
      setError(null);

      // Set up socket event listeners
      socketService.setOnConnect(() => {
        console.log('✅ Socket connected successfully');
        console.log('✅ Transport type:', socketService.getTransportType());
        console.log('✅ Socket ID:', socketService.getSocketId());
        setIsConnected(true);
        
        // Register device when connected
        const existingDeviceId = getDeviceId();
        socketService.registerDevice(existingDeviceId || generateUUID());
      });

      socketService.setOnDisconnect(() => {
        console.log('📱 Socket disconnected');
        setIsConnected(false);
      });

      socketService.setOnDeviceRegistered((data: DeviceRegisteredResponse) => {
        // Save device ID to localStorage
        setDeviceId(data.deviceId);
        
        // Update user data
        setUserData({
          deviceId: data.deviceId,
          userId: data.userId
        });
        
        setIsLoading(false);
        console.log('✅ User registered:', data);
      });

      socketService.setOnGameCreated((data: GameCreatedResponse) => {
        setCurrentGame({
          gameId: data.gameId,
          gameName: data.gameName,
          status: data.status,
          createdAt: data.createdAt
        });
        
        setIsLoading(false);
        
        // Show success in console
        console.log(`✅ המשחק "${data.gameName}" נוצר בהצלחה!`);
        
        console.log('🎮 Game created successfully:', data);
      });

      socketService.setOnError((data: ErrorResponse) => {
        setError(data.message);
        setIsLoading(false);
        console.error('❌ Socket error:', data);
      });

      // Connect to server with timeout
      console.log('🔌 Attempting to connect to server...');
      console.log('📞 About to call socketService.connect()');
      
      const connectionTimeout = setTimeout(() => {
        console.error('⏰ Connection timeout after 30 seconds');
        setError('חיבור לשרת נכשל - נסה לרענן את הדף');
        setIsLoading(false);
      }, 30000); // הגדלנו ל-30 שניות
      
      try {
        console.log('📡 Calling socketService.connect()...');
        await socketService.connect();
        console.log('✅ socketService.connect() completed successfully');
        clearTimeout(connectionTimeout);
      } catch (error) {
        console.error('❌ socketService.connect() failed:', error);
        clearTimeout(connectionTimeout);
        throw error;
      }
      
    } catch (error) {
      console.error('❌ Connection initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to server');
      setIsLoading(false);
      setIsConnected(false);
    }
  };

  const createGame = async (gameName: string): Promise<void> => {
    try {
      if (!isConnected) {
        throw new Error('לא מחובר לשרת');
      }

      if (!userData) {
        throw new Error('משתמש לא רשום');
      }

      if (!gameName.trim()) {
        throw new Error('שם המשחק נדרש');
      }

      setIsLoading(true);
      setError(null);
      
      socketService.createGame(gameName);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה ביצירת המשחק');
      setIsLoading(false);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: GameContextType = {
    userData,
    currentGame,
    isConnected,
    isLoading,
    error,
    createGame,
    clearError,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
