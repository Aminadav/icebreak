const { getUserIdFromDevice, sendUserDataToClient } = require('./utils');
const { getUserTotalPoints } = require('../../utils/points-helper');
const pool = require('../../config/database');

/**
 * Get complete user data and emit user_game_data_updated event
 */
module.exports.registerGetUserDataHandler = function(socket) {
  socket.on('get_user_data', async (data) => {
    try {
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!userId) {
        console.log('❌ getUserData: No user found for device');
        return;
      }

      // Get user basic info
      const userResult = await pool.query(`
        SELECT phone_number, email, name, gender, image 
        FROM users 
        WHERE user_id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        console.log('❌ getUserData: User not found in database');
        return;
      }

      const user = userResult.rows[0];
      // Emit complete user data
      await sendUserDataToClient(socket, userId);

    } catch (error) {
      console.error('❌ getUserData error:', error);
      socket.emit('user_data_updated', {
        success: false,
        message: 'Failed to load user data'
      });
    }
  });
};
