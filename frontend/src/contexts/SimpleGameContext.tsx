import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { simpleSocketService } from '../services/simpleSocketService';

console.log('📁 SimpleGameContext module loaded');

interface SimpleGameContextType {
  isConnected: boolean;
  error: string | null;
  testConnection: () => void;
}

const SimpleGameContext = createContext<SimpleGameContextType | undefined>(undefined);

interface SimpleGameProviderProps {
  children: ReactNode;
}

export function SimpleGameProvider({ children }: SimpleGameProviderProps) {
  console.log('🚀 SimpleGameProvider rendered');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 SimpleGameProvider useEffect triggered');
    
    const testConnection = async () => {
      try {
        console.log('🧪 Testing connection...');
        const socket = await simpleSocketService.connect();
        console.log('✅ Connection successful:', socket.id);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('❌ Connection failed:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    testConnection();

    return () => {
      console.log('🧹 SimpleGameProvider cleanup');
      simpleSocketService.disconnect();
    };
  }, []);

  const testConnection = async () => {
    try {
      setError(null);
      console.log('🔄 Manual connection test...');
      const socket = await simpleSocketService.connect();
      console.log('✅ Manual test successful:', socket.id);
      setIsConnected(true);
    } catch (err) {
      console.error('❌ Manual test failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    }
  };

  const value: SimpleGameContextType = {
    isConnected,
    error,
    testConnection,
  };

  return (
    <SimpleGameContext.Provider value={value}>
      {children}
    </SimpleGameContext.Provider>
  );
}

export function useSimpleGame(): SimpleGameContextType {
  const context = useContext(SimpleGameContext);
  if (context === undefined) {
    throw new Error('useSimpleGame must be used within a SimpleGameProvider');
  }
  return context;
}
