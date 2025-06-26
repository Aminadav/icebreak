import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { getDeviceId, setDeviceId, generateUUID } from '../utils/deviceManager';
import { env } from '../env';
interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
  error: string | null;
  deviceId: string | null;
  isLoggedIn: boolean | null 
  userData: any | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceIdState] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<any>(null);

  useEffect(() => {
    // console.log('🚀 SocketProvider: Initializing socket connection...');
    
    // Get or create device ID immediately
    let currentDeviceId = getDeviceId();
    if (!currentDeviceId) {
      currentDeviceId = generateUUID();
      setDeviceId(currentDeviceId);
      // console.log('🆔 Generated new device ID:', currentDeviceId);
    } else {
      // console.log('🆔 Using existing device ID from localStorage:', currentDeviceId);
    }

    // Set device ID in state
    setDeviceIdState(currentDeviceId);

    // Create socket connection with device ID as query parameter
    const backendUrl = env.BACKEND_URL
    const newSocket = io(backendUrl, {
      transports: ['polling', 'websocket'],
      timeout: 10000,
      query: {
        deviceId: currentDeviceId
      }
    });

    newSocket.prependAny((eventName, ...args) => {
      console.groupCollapsed(`%c<< ${eventName}`,'color:lightgreen')
      console.log(...args)
      console.groupEnd()
    })
    newSocket.prependAnyOutgoing((eventName, ...args) => {
      console.groupCollapsed(`%c>> ${eventName}`,'color:skyblue')
      console.log(...args)
      console.groupEnd()
    })

    // Handle connection
    newSocket.on('connect', () => {
      // console.log('✅ Socket connected! ID:', newSocket.id, 'Device ID:', currentDeviceId);
      setSocket(newSocket);
      setIsConnected(true);
      setError(null);
      
      // Device registration happens automatically on backend
      // console.log('🔄 Device registration handled automatically by backend');
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    // Handle disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('📱 Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Handle device registration response
    newSocket.on('device_registered', (data) => {
      // console.log('✅ Device registered successfully:', data);
      
      if (data.success) {
        // Device ID is already managed, just log confirmation
        // console.log('✅ Device registration confirmed. User ID:', data.userId || 'None (not verified)');
      } else {
        console.error('❌ Device registration failed:', data);
      }
    });

    function userDataUpdatedHandler(data:any) {
      setIsLoggedIn(!!data?.name)
      console.log({data})
      setUserData(data);
    }
    newSocket.on('user_data_updated',userDataUpdatedHandler)
    newSocket.emit('get_user_data')

    // Handle server errors
    newSocket.on('error', (data) => {
      console.error('❌ Server error:', data);
      setError(data.message || 'Unknown server error');
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 SocketProvider: Cleaning up socket connection...');
      newSocket.off('user_data_updated',userDataUpdatedHandler);
      newSocket.disconnect();
    };
  }, []); // No dependencies - device ID is managed internally

  const value: SocketContextType = {
    //@ts-ignore
    socket,
    isConnected,
    error,
    deviceId,
    isLoggedIn,
    userData,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * @return  {SocketContextType}
 */
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
