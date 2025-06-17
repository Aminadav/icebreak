// Simple socket test
import { io } from 'socket.io-client';

console.log('🧪 Testing direct socket connection...');

const socket = io('http://localhost:4001', {
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  query: {
    clientId: 'direct-test-' + new Date().getTime(),
    debug: 'true'
  }
});

socket.on('connect', () => {
  console.log('✅ DIRECT CONNECTION SUCCESS! Socket ID:', socket.id);
});

socket.on('connect_error', (error: any) => {
  console.error('❌ DIRECT CONNECTION ERROR:', error);
});

socket.on('disconnect', (reason: string) => {
  console.log('📱 DIRECT DISCONNECTION:', reason);
});

(window as any).testSocket = socket;