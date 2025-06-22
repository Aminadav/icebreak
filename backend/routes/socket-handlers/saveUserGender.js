const Device = require('../../models/Device');
const User = require('../../models/User');
const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');
const moveUserToGameState = require('./moveUserToGameState');

module.exports.registerSaveUserGenderHandler = async function(socket) {
  socket.on('save_user_gender', async (data) => {
    try {
      const { gender, name, gameId } = data;
      
      if (!gender || !['male', 'female'].includes(gender)) {
        throw new Error('Invalid gender. Must be "male" or "female"');
      }
      
      // Security: Always derive userId from deviceId
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!targetUserId) {
        throw new Error('User not authenticated. Please complete phone verification first.');
      }
      
      console.log(`⚤ Saving gender for user ${targetUserId}: ${gender}`);
      
      // If name is provided, update both name and gender, otherwise just gender
      let result;
      if (name && name.trim()) {
        result = await User.updateUserNameAndGender(targetUserId, name.trim(), gender);
      } else {
        result = await pool.query(
          'UPDATE users SET gender = $1 WHERE user_id = $2 RETURNING *',
          [gender, targetUserId]
        );
        
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }
        
        result = {
          success: true,
          user: result.rows[0],
          message: 'Gender updated successfully'
        };
      }
      
      if (result.success) {
        
        moveUserToGameState(socket, gameId, targetUserId, {
          screenName: 'ASK_FOR_PICTURE',
        })
        
        console.log(`✅ Gender saved successfully for user ${targetUserId}: ${gender}`);
      } else {
        throw new Error(result.error || 'Failed to save gender');
      }
      
    } catch (error) {
      console.error('Error saving gender:', error);
      
      socket.emit('gender_save_error', {
        success: false,
        message: error.message || 'Failed to save gender',
        context: 'gender_save'
      });
    }
  });
};
