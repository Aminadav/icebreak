const Device = require('../models/Device');
const Game = require('../models/Game');

function setupSocketHandlers(io) {
  console.log('🔧 Setting up Socket.io handlers...');
  console.log('🎯 IO instance received:', !!io);
  console.log('🎯 IO engine:', !!io.engine);
  console.log('🎯 IO supported transports:', io.engine.opts.transports);
  console.log('🎯 IO CORS settings:', JSON.stringify(io.engine.opts.cors, null, 2));
  
  // Add middleware to log all connections
  io.use((socket, next) => {
    console.log('🔌 Socket middleware: New connection attempt from:', socket.handshake.address);
    console.log('🔌 Socket middleware: Headers:', socket.handshake.headers.origin);
    console.log('🔌 Socket middleware: Query params:', JSON.stringify(socket.handshake.query));
    next();
  });
  
  io.on('connection', (socket) => {
    console.log('✅ Socket.io client connected:', socket.id);
    console.log('🤝 Transport type:', socket.conn.transport.name);
    console.log(`📱 NEW HIGH-LEVEL CONNECTION: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);
    
    // רישום מכשיר
    socket.on('register_device', async (data) => {
      try {
        const { deviceId } = data || {};
        
        const result = await Device.registerDevice(deviceId);
        
        // שמירת המידע בsocket לשימוש עתידי
        socket.deviceId = result.deviceId;
        socket.userId = result.userId;
        
        socket.emit('device_registered', {
          deviceId: result.deviceId,
          userId: result.userId,
          success: true
        });
        
        console.log(`✅ Device registered: ${result.deviceId} → User: ${result.userId}`);
      } catch (error) {
        console.error('Error registering device:', error);
        socket.emit('error', {
          message: 'Failed to register device',
          error: error.message
        });
      }
    });
    
    // יצירת משחק חדש
    socket.on('create_game', async (data) => {
      try {
        const { gameName } = data;
        
        if (!socket.userId) {
          throw new Error('User not registered');
        }
        
        if (!gameName || gameName.trim().length === 0) {
          throw new Error('Game name is required');
        }
        
        const game = await Game.createGame(gameName.trim(), socket.userId);
        
        // הצטרפות לחדר המשחק
        socket.join(game.game_id);
        
        socket.emit('game_created', {
          gameId: game.game_id,
          gameName: game.name,
          status: game.status,
          createdAt: game.created_at,
          success: true
        });
        
        console.log(`🎮 Game created: ${game.name} (${game.game_id}) by user: ${socket.userId}`);
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', {
          message: 'Failed to create game',
          error: error.message
        });
      }
    });
    
    // טיפול בהגשת מספר טלפון
    socket.on('submit_phone_number', async (data) => {
      try {
        const { phoneNumber } = data;
        
        if (!socket.userId) {
          throw new Error('User not registered');
        }
        
        if (!phoneNumber || phoneNumber.trim().length === 0) {
          throw new Error('Phone number is required');
        }
        
        // TODO: בעתיד כאן נשלח SMS אמיתי
        console.log(`📱 Phone number submitted: ${phoneNumber} by user: ${socket.userId}`);
        
        // סימולציה של שליחת SMS
        setTimeout(() => {
          socket.emit('sms_sent', {
            phoneNumber: phoneNumber,
            success: true,
            message: 'SMS sent successfully'
          });
        }, 1000); // דחיית שנייה לסימולציה
        
        console.log(`📤 SMS simulation sent to: ${phoneNumber}`);
      } catch (error) {
        console.error('Error processing phone number:', error);
        socket.emit('error', {
          message: 'Failed to process phone number',
          error: error.message
        });
      }
    });
    
    // עדכון זמן הביקור האחרון
    socket.on('ping', async () => {
      if (socket.deviceId) {
        try {
          await Device.updateLastSeen(socket.deviceId);
        } catch (error) {
          console.error('Error updating last seen:', error);
        }
      }
    });
    
    // התנתקות
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
