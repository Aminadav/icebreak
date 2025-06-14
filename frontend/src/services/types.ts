// Socket.io Event Types
export interface SocketEvents {
  // Client to Server
  register_device: (data: { deviceId?: string }) => void;
  create_game: (data: { gameName: string }) => void;
  ping: () => void;
  
  // Server to Client
  device_registered: (data: DeviceRegisteredResponse) => void;
  game_created: (data: GameCreatedResponse) => void;
  error: (data: ErrorResponse) => void;
}

// Response Types
export interface DeviceRegisteredResponse {
  deviceId: string;
  userId: string;
  success: boolean;
}

export interface GameCreatedResponse {
  gameId: string;
  gameName: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  error: string;
}

// Game Data Types
export interface GameData {
  gameId: string;
  gameName: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
}

// User Data Types
export interface UserData {
  deviceId: string;
  userId: string;
}
