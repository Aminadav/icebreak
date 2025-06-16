// Simple Socket Service for debugging
import { io, Socket } from 'socket.io-client';

console.log('🔧 Creating simple socket service...');

class SimpleSocketService {
  private socket: Socket | null = null;
  
  connect(): Promise<Socket> {
    console.log('🚀 SimpleSocketService.connect() called');
    
    return new Promise((resolve, reject) => {
      console.log('📡 Creating socket connection...');
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      this.socket = io(backendUrl, {
        transports: ['polling', 'websocket'],
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('✅ SimpleSocketService connected! ID:', this.socket?.id);
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ SimpleSocketService connection error:', error);
        reject(error);
      });

      // Timeout fallback
      setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('⏰ SimpleSocketService timeout');
          reject(new Error('Connection timeout'));
        }
      }, 15000);
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const simpleSocketService = new SimpleSocketService();
