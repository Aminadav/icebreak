import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { ClientToServerEvents, ServerToClientEvents, SocketData, PaginatedResponse } from '../types';
import { AnalyticsService } from '../services/analyticsService';

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
  prisma: PrismaClient
) => {
  const analytics = new AnalyticsService(prisma);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) => {
    console.log(`User ${socket.data.userId} connected`);

    // Track connection
    analytics.track('user_connected', socket.data.userId);

    // Join Room
    socket.on('joinRoom', async (roomCode: string) => {
      try {
        const room = await prisma.gameRoom.findUnique({
          where: { code: roomCode },
          include: {
            players: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailNotifications: true
              }
            },
            questions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        });

        if (!room) {
          socket.emit('error', 'חדר לא נמצא');
          return;
        }

        if (!room.isActive) {
          socket.emit('error', 'החדר לא פעיל');
          return;
        }

        if (room.players.length >= room.maxPlayers) {
          socket.emit('error', 'החדר מלא');
          return;
        }

        // Add user to room if not already there
        const isPlayerInRoom = room.players.some((p: any) => p.id === socket.data.userId);
        if (!isPlayerInRoom) {
          await prisma.gameRoom.update({
            where: { id: room.id },
            data: {
              players: {
                connect: { id: socket.data.userId }
              }
            }
          });

          const user = await prisma.user.findUnique({
            where: { id: socket.data.userId },
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
              emailNotifications: true
            }
          });

          // Notify other players
          socket.to(room.id).emit('playerJoined', user!);
        }

        // Join socket room
        socket.join(room.id);
        socket.data.roomId = room.id;

        // Send updated room data
        const updatedRoom = await prisma.gameRoom.findUnique({
          where: { id: room.id },
          include: {
            players: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailNotifications: true
              }
            },
            questions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        });

        socket.emit('roomUpdated', updatedRoom!);
        analytics.track('room_joined', socket.data.userId, { roomId: room.id });

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', 'שגיאה בהצטרפות לחדר');
      }
    });

    // Create Room
    socket.on('createRoom', async (roomName: string) => {
      try {
        // Generate unique room code
        let roomCode: string;
        let isUnique = false;
        
        while (!isUnique) {
          roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const existingRoom = await prisma.gameRoom.findUnique({
            where: { code: roomCode }
          });
          isUnique = !existingRoom;
        }

        const room = await prisma.gameRoom.create({
          data: {
            name: roomName,
            code: roomCode!,
            hostId: socket.data.userId,
            players: {
              connect: { id: socket.data.userId }
            }
          },
          include: {
            players: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailNotifications: true
              }
            },
            questions: true
          }
        });

        socket.join(room.id);
        socket.data.roomId = room.id;
        socket.emit('roomUpdated', room);
        
        analytics.track('room_created', socket.data.userId, { roomId: room.id });

      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', 'שגיאה ביצירת החדר');
      }
    });

    // Get Players with Pagination
    socket.on('getPlayers', async (roomId: string, page: number, limit: number) => {
      try {
        const offset = (page - 1) * limit;
        
        const [players, total] = await Promise.all([
          prisma.user.findMany({
            where: {
              gameRooms: {
                some: { id: roomId }
              }
            },
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
              emailNotifications: true
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'asc' }
          }),
          prisma.user.count({
            where: {
              gameRooms: {
                some: { id: roomId }
              }
            }
          })
        ]);

        const response: PaginatedResponse<any> = {
          data: players,
          total,
          page,
          limit,
          hasMore: offset + limit < total
        };

        socket.emit('playersPage', response);
        analytics.track('players_page_requested', socket.data.userId, { page, limit });

      } catch (error) {
        console.error('Get players error:', error);
        socket.emit('error', 'שגיאה בטעינת השחקנים');
      }
    });

    // Submit Answer
    socket.on('submitAnswer', async (questionId: string, answer: string) => {
      try {
        if (!socket.data.roomId) {
          socket.emit('error', 'לא מחובר לחדר');
          return;
        }

        const gameAnswer = await prisma.gameAnswer.create({
          data: {
            answer,
            userId: socket.data.userId,
            questionId,
            gameRoomId: socket.data.roomId
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailNotifications: true
              }
            },
            question: true
          }
        });

        // Notify all players in the room
        io.to(socket.data.roomId).emit('answerReceived', gameAnswer);
        analytics.track('answer_submitted', socket.data.userId, { questionId });

      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', 'שגיאה בשליחת התשובה');
      }
    });

    // Leave Room
    socket.on('leaveRoom', async (roomId: string) => {
      try {
        await prisma.gameRoom.update({
          where: { id: roomId },
          data: {
            players: {
              disconnect: { id: socket.data.userId }
            }
          }
        });

        socket.leave(roomId);
        socket.to(roomId).emit('playerLeft', socket.data.userId);
        socket.data.roomId = undefined;
        
        analytics.track('room_left', socket.data.userId, { roomId });

      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.data.userId} disconnected`);
      
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('playerLeft', socket.data.userId);
      }
      
      analytics.track('user_disconnected', socket.data.userId);
    });
  });
};
