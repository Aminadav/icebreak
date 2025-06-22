const Device = require('../../models/Device');
const User = require('../../models/User');
const Game = require('../../models/Game');
const { verifyCode } = require('../../utils/smsService');
const { sendToMixpanel, setUserProfile, trackLogin, trackRegistration } = require('../../utils/mixpanelService');
const { validateDeviceRegistration } = require('./utils');
const moveUserToGameState = require('./moveUserToGameState');

async function handleVerify2FACode(socket, data) {
  try {
    const { code,gameId } = data;
    
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
      
      
      moveUserToGameState(socket, gameId, user.user_id, {
        screenName: 'ASK_FOR_EMAIL',
      })

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
