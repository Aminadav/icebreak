export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface GameRoom {
  id: string;
  name: string;
  code: string;
  hostId: string;
  isActive: boolean;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  players: User[];
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  textEn?: string | null;
  orderIndex: number;
  gameRoomId: string;
  createdAt: string;
}

export interface GameAnswer {
  id: string;
  answer: string;
  userId: string;
  questionId: string;
  gameRoomId: string;
  createdAt: string;
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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface GameState {
  currentRoom: GameRoom | null;
  players: PaginatedResponse<User> | null;
  questions: Question[];
  answers: GameAnswer[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  language: 'he' | 'en';
  isRTL: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Socket Events (matching server types)
export interface ServerToClientEvents {
  roomUpdated: (room: GameRoom) => void;
  playerJoined: (player: User) => void;
  playerLeft: (playerId: string) => void;
  questionAdded: (question: Question) => void;
  answerReceived: (answer: GameAnswer) => void;
  playersPage: (data: PaginatedResponse<User>) => void;
  questionsPage: (data: PaginatedResponse<Question>) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  joinRoom: (roomCode: string) => void;
  leaveRoom: (roomId: string) => void;
  createRoom: (roomName: string) => void;
  addQuestion: (roomId: string, questionText: string) => void;
  submitAnswer: (questionId: string, answer: string) => void;
  getPlayers: (roomId: string, page: number, limit: number) => void;
  getQuestions: (roomId: string, page: number, limit: number) => void;
}
