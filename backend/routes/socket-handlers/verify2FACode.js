const Device = require('../../models/Device');
const User = require('../../models/User');
const Game = require('../../models/Game');
const pool = require('../../config/database');
const { verifyCode, formatPhoneNumber } = require('../../utils/smsService');
const { sendToMixpanel, setUserProfile, trackLogin, trackRegistration } = require('../../utils/mixpanelService');
const { updateUserIdAcrossAllTables } = require('../../utils/updateUserIdAcrossAllTables');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');
const moveUserToGameState = require('./moveUserToGameState');
const Socket = require('socket.io').Socket;

module.exports.registerVerify2FACodeHandler = async function(socket) {
  socket.on('verify_2fa_code', async (data) => {
    try {
      const { code, gameId } = data;
      var userId = await getUserIdFromDevice(socket.deviceId);
      
      var rows = await pool.query('SELECT phone_number FROM users WHERE user_id = $1', [userId]);
      var phoneNumber = rows.rows[0]?.phone_number;
      if (!phoneNumber) {
        throw new Error('Phone number not found for user');
      }
      if (!code || code.trim().length === 0) {
        throw new Error('Verification code is required');
      }
      
      console.log(`🔐 Verifying 2FA code: ${code} for phone: ${phoneNumber}`);
      
      // אימות הקוד
      const isValid = verifyCode(phoneNumber, code.trim());
      
      console.log(`✅ 2FA verification successful for: ${phoneNumber}`);
      
      // check if user already exists
      const tempUserId = await getUserIdFromDevice(socket.deviceId);
      var realUserId = await pool.query('SELECT * FROM users WHERE phone_number = $1 and phone_verified=true and user_id<> $2 and is_temp_user=false', [formatPhoneNumber(phoneNumber), tempUserId]);

      if (realUserId.rows.length > 0) {
        // user already exists, transfer temp user to real user
        // then we can delete the temp user
        var theRealUser_id = realUserId.rows[0].user_id;
        
        await updateUserIdAcrossAllTables(tempUserId, theRealUser_id);
        await pool.query('DELETE FROM users WHERE user_id = $1', [tempUserId]);
      } else {
        // user does not exist, the temp user will be the real user
        const result = await pool.query(
          'UPDATE users SET phone_verified = true, updated_at = CURRENT_TIMESTAMP,is_temp_user=false WHERE user_id = $1 RETURNING *',
          [tempUserId]
        );
        theRealUser_id = tempUserId 
      }
      
      moveUserToGameState(socket, gameId, theRealUser_id, {
        screenName: 'ASK_FOR_EMAIL',
      });

    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      socket.emit('error', {
        message: 'Failed to verify code',
        error: error.message,
        context: '2fa'
      });
    }
  });
};
