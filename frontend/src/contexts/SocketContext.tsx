import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { getDeviceId, setDeviceId, generateUUID } from '../utils/deviceManager';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  deviceId: string | null;
  userId: string | null;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceId, setDeviceIdState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 SocketProvider: Initializing socket connection...');
    
    // Create socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['polling', 'websocket'],
      timeout: 10000
    });

    // Handle connection
    newSocket.on('connect', () => {
      console.log('✅ Socket connected! ID:', newSocket.id);
      setSocket(newSocket);
      setIsConnected(true);
      setError(null);
      
      // Register device after connection
      registerDevice(newSocket);
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
      console.log('✅ Device registered successfully:', data);
      if (data.success) {
        setDeviceIdState(data.deviceId);
        setUserId(data.userId);
        // Save device ID to localStorage for future use
        setDeviceId(data.deviceId);
      }
    });

    // Handle server errors
    newSocket.on('error', (data) => {
      console.error('❌ Server error:', data);
      setError(data.message || 'Unknown server error');
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 SocketProvider: Cleaning up socket connection...');
      newSocket.disconnect();
    };
  }, []);

  const registerDevice = (socketInstance: Socket) => {
    // Get existing device ID or generate a new one
    let currentDeviceId = getDeviceId();
    
    if (!currentDeviceId) {
      currentDeviceId = generateUUID();
      console.log('🆔 Generated new device ID:', currentDeviceId);
    } else {
      console.log('🆔 Using existing device ID:', currentDeviceId);
    }

    // Emit register_device event
    console.log('📤 Emitting register_device event with deviceId:', currentDeviceId);
    socketInstance.emit('register_device', { deviceId: currentDeviceId });
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    deviceId,
    userId,
    error
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
