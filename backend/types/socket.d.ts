import { Socket as SocketIOSocket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    deviceId?: string;
  }
}
