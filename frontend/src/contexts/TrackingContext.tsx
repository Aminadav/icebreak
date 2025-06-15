import { createContext, useContext, ReactNode } from 'react';
import { useSocket } from './SocketContext';

interface TrackingContextType {
  trackEvent: (trackingId: string, eventData?: Record<string, any>) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

interface TrackingProviderProps {
  children: ReactNode;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  const { socket, deviceId, userId } = useSocket();

  const trackEvent = (trackingId: string, eventData: Record<string, any> = {}) => {
    if (!socket || !trackingId) {
      console.warn('🚫 Cannot track event: socket not connected or trackingId missing');
      return;
    }

    const eventPayload = {
      trackingId,
      deviceId,
      userId,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    console.log('📊 Tracking event:', eventPayload);
    
    // שליחת האירוע לשרת
    socket.emit('trackEvent', eventPayload);
  };

  const value: TrackingContextType = {
    trackEvent
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking(): TrackingContextType {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}
