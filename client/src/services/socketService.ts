import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.error('No auth token available for socket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
      auth: { token },
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.reconnectAttempts = 0;
      useGameStore.getState().setError(null);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      useGameStore.getState().setError('שגיאה בחיבור לשרת');
      this.reconnect();
    });

    // Game events
    this.socket.on('roomUpdated', (room) => {
      useGameStore.getState().updateRoom(room);
    });

    this.socket.on('playerJoined', (player) => {
      useGameStore.getState().addPlayer(player);
    });

    this.socket.on('playerLeft', (playerId) => {
      useGameStore.getState().removePlayer(playerId);
    });

    this.socket.on('questionAdded', (question) => {
      useGameStore.getState().addQuestion(question);
    });

    this.socket.on('answerReceived', (answer) => {
      useGameStore.getState().addAnswer(answer);
    });

    this.socket.on('playersPage', (players) => {
      useGameStore.getState().setPlayers(players);
    });

    this.socket.on('error', (message) => {
      useGameStore.getState().setError(message);
    });
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      useGameStore.getState().setError('לא הצליח להתחבר לשרת');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room actions
  joinRoom(roomCode: string) {
    this.socket?.emit('joinRoom', roomCode);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leaveRoom', roomId);
  }

  createRoom(roomName: string) {
    this.socket?.emit('createRoom', roomName);
  }

  // Question actions
  addQuestion(roomId: string, questionText: string) {
    this.socket?.emit('addQuestion', roomId, questionText);
  }

  submitAnswer(questionId: string, answer: string) {
    this.socket?.emit('submitAnswer', questionId, answer);
  }

  // Pagination
  getPlayers(roomId: string, page: number, limit: number = 20) {
    this.socket?.emit('getPlayers', roomId, page, limit);
  }

  getQuestions(roomId: string, page: number, limit: number = 20) {
    this.socket?.emit('getQuestions', roomId, page, limit);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
