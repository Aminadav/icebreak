const Device = require('../../models/Device');
const User = require('../../models/User');
const Game = require('../../models/Game');
const { verifyCode } = require('../../utils/smsService');
const { sendToMixpanel, setUserProfile, trackLogin, trackRegistration } = require('../../utils/mixpanelService');
const { validateDeviceRegistration } = require('./utils');

async function handleVerify2FACode(socket, data) {
  try {
    const { code } = data;
    
    validateDeviceRegistration(socket);
    
    if (!socket.phoneNumber) {
      // Try to get phone number from database if not in socket memory
      const journeyData = await Device.getJourneyState(socket.deviceId);
      if (journeyData.pendingPhoneNumber) {
        socket.phoneNumber = journeyData.pendingPhoneNumber;
      } else {
        throw new Error('Phone number not found. Please submit phone number first.');
      }
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
      
      // Track user authentication (registration or login)
      const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime()) < 5000; // Created in last 5 seconds
      if (isNewUser) {
        await trackRegistration(user.user_id, socket.deviceId, socket.phoneNumber, {
          device_count: userStats.deviceCount,
          games_created: userStats.gamesCreated
        });
        await setUserProfile(user.user_id, {
          phoneNumber: socket.phoneNumber,
          createdAt: user.created_at,
          deviceCount: userStats.deviceCount,
          gamesCreated: userStats.gamesCreated
        });
      } else {
        await trackLogin(user.user_id, socket.deviceId, {
          device_count: userStats.deviceCount,
          games_created: userStats.gamesCreated,
          phone_number: socket.phoneNumber
        });
      }
      
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
          
          // Track auto game creation after verification
          await sendToMixpanel({
            trackingId: 'game_created_after_verification',
            userId: user.user_id,
            deviceId: socket.deviceId,
            timestamp: new Date().toISOString(),
            game_id: game.game_id,
            game_name: game.name,
            socketId: socket.id
          });
          
          console.log(`🎮 Auto-created game: ${game.name} (${game.game_id}) after verification`);
        } catch (gameError) {
          console.error('Error auto-creating game after verification:', gameError);
          // Don't fail the verification if game creation fails
        }
      }
      
      // Update journey state to PHONE_VERIFIED and clear pending phone number
      await Device.updateJourneyState(socket.deviceId, 'PHONE_VERIFIED', {
        pendingPhoneNumber: null
      });
      
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
}

module.exports = handleVerify2FACode;
