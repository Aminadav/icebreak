const Device = require('../models/Device');
const Game = require('../models/Game');
const User = require('../models/User');
const { sendVerificationCode, verifyCode } = require('../utils/smsService');

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
        socket.userId = result.userId; // May be null if device not yet verified
        
        socket.emit('device_registered', {
          deviceId: result.deviceId,
          userId: result.userId,
          success: true,
          isVerified: !!result.userId // True if user already exists (device was verified before)
        });
        
        if (result.userId) {
          console.log(`✅ Device registered: ${result.deviceId} → Existing User: ${result.userId}`);
        } else {
          console.log(`✅ Device registered: ${result.deviceId} → No user yet (needs verification)`);
        }
      } catch (error) {
        console.error('Error registering device:', error);
        socket.emit('error', {
          message: 'Failed to register device',
          error: error.message
        });
      }
    });
    
    // שמירת שם המשחק בזיכרון (לא ביצירה מיידית)
    socket.on('set_game_name', async (data) => {
      try {
        const { gameName } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!gameName || gameName.trim().length === 0) {
          throw new Error('Game name is required');
        }
        
        // שמירת שם המשחק ב-socket עד לאימות
        socket.pendingGameName = gameName.trim();
        
        socket.emit('game_name_saved', {
          gameName: socket.pendingGameName,
          success: true,
          message: 'Game name saved. Please verify your phone number to create the game.'
        });
        
        console.log(`🎮 Game name saved: "${socket.pendingGameName}" for device: ${socket.deviceId}`);
      } catch (error) {
        console.error('Error saving game name:', error);
        socket.emit('error', {
          message: 'Failed to save game name',
          error: error.message
        });
      }
    });

    // יצירת משחק בפועל (רק לאחר אימות)
    socket.on('create_game_now', async () => {
      try {
        if (!socket.userId || !socket.isPhoneVerified) {
          throw new Error('User must be verified with phone number to create games');
        }
        
        if (!socket.pendingGameName) {
          throw new Error('No game name found. Please set a game name first.');
        }
        
        const game = await Game.createGame(socket.pendingGameName, socket.userId);
        
        // הצטרפות לחדר המשחק
        socket.join(game.game_id);
        
        socket.emit('game_created', {
          gameId: game.game_id,
          gameName: game.name,
          status: game.status,
          createdAt: game.created_at,
          success: true
        });
        
        // מחיקת שם המשחק הממתין
        delete socket.pendingGameName;
        
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
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!phoneNumber || phoneNumber.trim().length === 0) {
          throw new Error('Phone number is required');
        }
        
        console.log(`📱 Phone number submitted: ${phoneNumber} by device: ${socket.deviceId}`);
        
        // שליחת SMS אמיתי עם קוד אימות
        const smsResult = await sendVerificationCode(phoneNumber);
        
        if (smsResult.success) {
          // שמירת מספר הטלפון ב-socket לשימוש באימות
          socket.phoneNumber = smsResult.phoneNumber;
          
          socket.emit('sms_sent', {
            phoneNumber: smsResult.phoneNumber,
            success: true,
            message: 'SMS sent successfully'
          });
          
          console.log(`✅ SMS sent successfully to: ${smsResult.phoneNumber}`);
        } else {
          throw new Error(smsResult.error || 'Failed to send SMS');
        }
        
      } catch (error) {
        console.error('Error processing phone number:', error);
        socket.emit('error', {
          message: 'Failed to process phone number',
          error: error.message,
          context: 'sms'
        });
      }
    });
    
    // טיפול באימות קוד 2FA
    socket.on('verify_2fa_code', async (data) => {
      try {
        const { code } = data;
        
        if (!socket.deviceId) {
          throw new Error('Device not registered');
        }
        
        if (!socket.phoneNumber) {
          throw new Error('Phone number not found. Please submit phone number first.');
        }
        
        if (!code || code.trim().length === 0) {
          throw new Error('Verification code is required');
        }
        
        console.log(`🔐 Verifying 2FA code: ${code} for phone: ${socket.phoneNumber}`);
        
        // אימות הקוד
        const isValid = verifyCode(socket.phoneNumber, code.trim());
        
        if (isValid) {
          // הקוד נכון - יצירת או איתור משתמש
          console.log(`✅ 2FA verification successful for: ${socket.phoneNumber}`);
          
          // Find or create user with verified phone
          const user = await User.findOrCreateUser(socket.phoneNumber);
          
          // Associate the current device with this user
          await User.associateDeviceWithUser(socket.deviceId, user.user_id);
          
          // Update socket with user information
          socket.userId = user.user_id;
          socket.isPhoneVerified = true;
          
          // Get user stats for response
          const userStats = await User.getUserStats(user.user_id);
          
          // אם יש שם משחק ממתין, ניצור את המשחק עכשיו
          let gameCreated = null;
          if (socket.pendingGameName) {
            try {
              const game = await Game.createGame(socket.pendingGameName, user.user_id);
              socket.join(game.game_id);
              gameCreated = {
                gameId: game.game_id,
                gameName: game.name,
                status: game.status,
                createdAt: game.created_at
              };
              delete socket.pendingGameName;
              console.log(`🎮 Auto-created game: ${game.name} (${game.game_id}) after verification`);
            } catch (gameError) {
              console.error('Error auto-creating game after verification:', gameError);
              // Don't fail the verification if game creation fails
            }
          }
          
          socket.emit('2fa_verified', {
            success: true,
            message: 'Phone number verified successfully',
            phoneNumber: socket.phoneNumber,
            user: {
              userId: user.user_id,
              phoneNumber: user.phone_number,
              createdAt: user.created_at,
              deviceCount: userStats.deviceCount,
              gamesCreated: userStats.gamesCreated
            },
            gameCreated: gameCreated // Will be null if no pending game
          });
          
          console.log(`🎉 User logged in successfully: ${user.user_id} with ${userStats.deviceCount} devices`);
        } else {
          socket.emit('2fa_verification_failed', {
            success: false,
            message: 'Invalid verification code'
          });
          
          console.log(`❌ 2FA verification failed for: ${socket.phoneNumber}, code: ${code}`);
        }
        
      } catch (error) {
        console.error('Error verifying 2FA code:', error);
        socket.emit('error', {
          message: 'Failed to verify code',
          error: error.message,
          context: '2fa'
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
