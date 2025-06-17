import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getDeviceId, setDeviceId, generateUUID } from '../utils/deviceManager';
import { NavigationController, type JourneyState } from '../utils/NavigationController';
import { useNavigation } from './NavigationContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  deviceId: string | null;
  userId: string | null;
  error: string | null;
  resetAutoNavigation: () => void;
  resetJourneyState: () => void;
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
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  const isInitialConnectionRef = useRef(true);
  
  // Get navigation functions
  const { reset: navigationReset } = useNavigation();

  useEffect(() => {
    console.log('🚀 SocketProvider: Initializing socket connection...');
    
    // Create socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      transports: ['polling', 'websocket'],
      timeout: 10000
    });

    // Handle connection
    newSocket.on('connect', () => {
      console.log('✅ Socket connected! ID:', newSocket.id);
      console.log('🔍 Is initial connection:', isInitialConnectionRef.current);
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
      // Mark that subsequent connections are reconnections
      isInitialConnectionRef.current = false;
    });

    // Handle device registration response
    newSocket.on('device_registered', (data) => {
      console.log('✅ Device registered successfully:', data);
      console.log('🔍 Journey state received:', data.journeyState);
      console.log('🔍 Journey state type:', typeof data.journeyState);
      console.log('🔍 Has already auto-navigated?', hasAutoNavigated);
      console.log('🔍 NavigationController.shouldAutoNavigate result:', data.journeyState ? NavigationController.shouldAutoNavigate(data.journeyState as JourneyState) : 'No journey state');
      console.log('🔍 Should auto-navigate?', data.journeyState && NavigationController.shouldAutoNavigate(data.journeyState as JourneyState) && !hasAutoNavigated);
      
      if (data.success) {
        setDeviceIdState(data.deviceId);
        setUserId(data.userId);
        // Save device ID to localStorage for future use
        setDeviceId(data.deviceId);
        
        // Check if we're on the admin page - don't auto-navigate in that case
        const isOnAdminPage = window.location.pathname === '/admin';
        
        // Handle auto-navigation based on journey state (only on initial connection, not reconnections)
        const shouldAutoNavigate = data.journeyState && 
          NavigationController.shouldAutoNavigate(data.journeyState as JourneyState) && 
          !hasAutoNavigated && 
          !isOnAdminPage && 
          isInitialConnectionRef.current; // Only auto-navigate on initial connection
        
        if (shouldAutoNavigate) {
          console.log(`🎯 Auto-navigating to journey state: ${data.journeyState}`);
          console.log('📊 Navigation data:', data);
          
          try {
            console.log(0)
            const targetComponent = NavigationController.getComponentForJourneyState(
              data.journeyState as JourneyState,
              data
            );
            console.log(1)
            
            console.log('🎯 Target component:', typeof targetComponent.type === 'function' ? targetComponent.type.name : targetComponent.type);
            console.log('🎯 Target component props:', targetComponent.props);
            
            if (targetComponent) {
              // Set flag to prevent future auto-navigation
              setHasAutoNavigated(true);
              
              // Use setTimeout to ensure navigation happens after current render cycle
              setTimeout(() => {
                console.log('🚀 Executing navigation reset...');
                console.log('🚀 Navigation reset function available?', !!navigationReset);
                navigationReset(targetComponent);
                console.log('🚀 Navigation reset completed');
              }, 100);
            } else {
              console.warn('⚠️ Target component is null/undefined');
            }
          } catch (error) {
            console.error('❌ Error during auto-navigation:', error);
          }
        } else {
          console.log('⏭️ Skipping auto-navigation - reasons:');
          console.log('  - Has journey state?', !!data.journeyState);
          console.log('  - Should auto-navigate?', data.journeyState ? NavigationController.shouldAutoNavigate(data.journeyState as JourneyState) : false);
          console.log('  - Already auto-navigated?', hasAutoNavigated);
          console.log('  - Is on admin page?', window.location.pathname === '/admin');
          console.log('  - Is initial connection?', isInitialConnectionRef.current);
        }
      } else {
        console.error('❌ Device registration failed:', data);
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
  }, []); // Remove navigationReset from dependencies to prevent infinite loop

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

  const resetAutoNavigation = () => {
    console.log('🔄 Resetting auto-navigation flag');
    setHasAutoNavigated(false);
    isInitialConnectionRef.current = true; // Reset to allow auto-navigation again
  };

  const resetJourneyState = () => {
    if (!socket) {
      console.warn('⚠️ Cannot reset journey state - socket not connected');
      return;
    }
    
    console.log('🔄 Resetting journey state to INITIAL');
    socket.emit('reset_journey_state');
    
    // Reset the auto-navigation flag and initial connection flag so it can work again after reset
    setHasAutoNavigated(false);
    isInitialConnectionRef.current = true;
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    deviceId,
    userId,
    error,
    resetAutoNavigation,
    resetJourneyState
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
