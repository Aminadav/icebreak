// Socket.io Event Types
export interface SocketEvents {
  // Client to Server
  register_device: (data: { deviceId?: string }) => void;
  create_game: (data: { gameName: string }) => void;
  submit_phone_number: (data: { phoneNumber: string }) => void;
  reset_journey_state: () => void;
  ping: () => void;
  
  // Server to Client
  device_registered: (data: DeviceRegisteredResponse) => void;
  game_created: (data: GameCreatedResponse) => void;
  sms_sent: (data: SmsSentResponse) => void;
  journey_state_reset: (data: { success: boolean; message: string }) => void;
  error: (data: ErrorResponse) => void;
}

// Response Types
export interface DeviceRegisteredResponse {
  deviceId: string;
  userId: string | null;
  success: boolean;
  isVerified: boolean;
  journeyState?: string;
  pendingGameName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface GameCreatedResponse {
  gameId: string;
  gameName: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
  success: boolean;
}

export interface SmsSentResponse {
  phoneNumber: string;
  success: boolean;
  message: string;
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
  isVerified?: boolean;
}

export interface VerifiedUserData {
  userId: string;
  phoneNumber: string;
  createdAt: string;
  deviceCount: number;
  gamesCreated: number;
}

export interface TwoFAVerificationSuccess {
  success: true;
  message: string;
  phoneNumber: string;
  user: VerifiedUserData;
}

export interface TwoFAVerificationFailure {
  success: false;
  message: string;
}
