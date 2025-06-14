import { io, Socket } from 'socket.io-client';
import type { DeviceRegisteredResponse, GameCreatedResponse, ErrorResponse } from './types';

class SocketService {
  private socket: Socket | null = null;
  private connectionPromise: Promise<void> | null = null;
  
  // Event callbacks
  private onDeviceRegistered?: (data: DeviceRegisteredResponse) => void;
  private onGameCreated?: (data: GameCreatedResponse) => void;
  private onError?: (data: ErrorResponse) => void;
  private onConnect?: () => void;
  private onDisconnect?: () => void;

  /**
   * התחברות לשרת Socket.io
   */
  connect(): Promise<void> {
    console.log('🎯 SocketService.connect() called');
    
    // אם כבר מחובר
    if (this.socket?.connected) {
      console.log('✅ Already connected');
      return Promise.resolve();
    }

    // אם כבר יש חיבור בתהליך, נחזיר את הpromise הקיים
    if (this.connectionPromise) {
      console.log('⏳ Connection already in progress, returning existing promise');
      return this.connectionPromise;
    }

    console.log('🚀 Starting new connection...');
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🔌 Creating socket.io connection to http://localhost:3001');
        this.socket = io('http://localhost:3001', {
          transports: ['polling'], // רק polling בינתיים, בלי websocket
          timeout: 20000,
          forceNew: true,
          reconnection: false, // נבטל reconnection אוטומטי לעכשיו
        });

        // חיבור מוצלח
        this.socket.on('connect', () => {
          console.log('✅ Connected to server successfully');
          console.log('🔗 Socket ID:', this.socket?.id);
          this.connectionPromise = null;
          this.onConnect?.();
          resolve();
        });

        // נתונים שנשלחו ל/מהשרת
        this.socket.onAny((event, ...args) => {
          console.log('📤 Socket event:', event, args);
        });

        // שגיאת חיבור
        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          this.connectionPromise = null;
          reject(new Error(`Connection failed: ${error.message || 'Unknown error'}`));
        });

        // התנתקות
        this.socket.on('disconnect', (reason) => {
          console.log('📱 Disconnected:', reason);
          this.connectionPromise = null;
          this.onDisconnect?.();
          
          // אם ההתנתקות לא הייתה מכוונת, נסה להתחבר מחדש
          if (reason === 'io server disconnect') {
            console.log('🔄 Server disconnected us, attempting to reconnect...');
            setTimeout(() => this.connect(), 2000);
          }
        });

        // רישום מכשיר - תגובה
        this.socket.on('device_registered', (data: DeviceRegisteredResponse) => {
          console.log('✅ Device registered:', data);
          this.onDeviceRegistered?.(data);
        });

        // משחק נוצר - תגובה
        this.socket.on('game_created', (data: GameCreatedResponse) => {
          console.log('🎮 Game created:', data);
          this.onGameCreated?.(data);
        });

        // שגיאה
        this.socket.on('error', (data: ErrorResponse) => {
          console.error('❌ Server error:', data);
          this.onError?.(data);
        });

      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * רישום מכשיר בשרת
   */
  registerDevice(deviceId?: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('📱 Registering device:', deviceId || 'new device');
    this.socket.emit('register_device', { deviceId });
  }

  /**
   * יצירת משחק חדש
   */
  createGame(gameName: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    if (!gameName.trim()) {
      throw new Error('Game name is required');
    }

    console.log('🎮 Creating game:', gameName);
    this.socket.emit('create_game', { gameName: gameName.trim() });
  }

  /**
   * ping לשמירת החיבור
   */
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  /**
   * התנתקות מהשרת
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
  }

  /**
   * בדיקה אם מחובר
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * הגדרת callback לרישום מכשיר
   */
  setOnDeviceRegistered(callback: (data: DeviceRegisteredResponse) => void): void {
    this.onDeviceRegistered = callback;
  }

  /**
   * הגדרת callback ליצירת משחק
   */
  setOnGameCreated(callback: (data: GameCreatedResponse) => void): void {
    this.onGameCreated = callback;
  }

  /**
   * הגדרת callback לשגיאות
   */
  setOnError(callback: (data: ErrorResponse) => void): void {
    this.onError = callback;
  }

  /**
   * הגדרת callback לחיבור
   */
  setOnConnect(callback: () => void): void {
    this.onConnect = callback;
  }

  /**
   * הגדרת callback להתנתקות
   */
  setOnDisconnect(callback: () => void): void {
    this.onDisconnect = callback;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
