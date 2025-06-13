export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  emailNotifications: boolean;
  lastEmailSent?: Date | null;
}

export interface GameRoom {
  id: string;
  name: string;
  code: string;
  hostId: string;
  isActive: boolean;
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
  players: User[];
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  textEn?: string | null;
  orderIndex: number;
  gameRoomId: string;
  createdAt: Date;
}

export interface GameAnswer {
  id: string;
  answer: string;
  userId: string;
  questionId: string;
  gameRoomId: string;
  createdAt: Date;
  user: User;
  question: Question;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Socket Events
export interface ServerToClientEvents {
  // Game Room Events
  roomUpdated: (room: GameRoom) => void;
  playerJoined: (player: User) => void;
  playerLeft: (playerId: string) => void;
  
  // Question Events
  questionAdded: (question: Question) => void;
  answerReceived: (answer: GameAnswer) => void;
  
  // Pagination Events
  playersPage: (data: PaginatedResponse<User>) => void;
  questionsPage: (data: PaginatedResponse<Question>) => void;
  
  // Error Events
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  // Room Management
  joinRoom: (roomCode: string) => void;
  leaveRoom: (roomId: string) => void;
  createRoom: (roomName: string) => void;
  
  // Questions & Answers
  addQuestion: (roomId: string, questionText: string) => void;
  submitAnswer: (questionId: string, answer: string) => void;
  
  // Pagination
  getPlayers: (roomId: string, page: number, limit: number) => void;
  getQuestions: (roomId: string, page: number, limit: number) => void;
}

export interface SocketData {
  userId: string;
  roomId?: string;
}

// Analytics
export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties?: Record<string, any>;
}
