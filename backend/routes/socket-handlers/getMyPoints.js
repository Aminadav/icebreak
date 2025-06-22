const pool = require('../../config/database');
const { getUserIdFromDevice, validateDeviceRegistration } = require('./utils');

module.exports.registerGetMyPointsHandler = async function(socket) {
  socket.on('my_points', async (data, callback) => {
    try {
      validateDeviceRegistration(socket);
      
      const { gameId } = data;
      
      if (!gameId) {
        const error = { success: false, message: 'Game ID is required' };
        if (callback) callback(error);
        return;
      }
      
      // Security: Always derive userId from deviceId
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!targetUserId) {
        const error = { success: false, message: 'User not authenticated. Please complete phone verification first.' };
        if (callback) callback(error);
        return;
      }
      
      const result = await pool.query(
        'SELECT points FROM user_points WHERE user_id = $1 AND game_id = $2',
        [targetUserId, gameId]
      );
      
      let points = 0;
      if (result.rows.length > 0) {
        points = result.rows[0].points;
      } else {
        // If no record exists, create one with 0 points
        await pool.query(
          'INSERT INTO user_points (user_id, game_id, points) VALUES ($1, $2, $3) ON CONFLICT (user_id, game_id) DO NOTHING',
          [targetUserId, gameId, 0]
        );
      }
      
      const response = {
        success: true,
        points: points,
        userId: targetUserId,
        gameId: gameId
      };
      
      // Use callback if provided, otherwise emit
      if (callback) {
        callback(response);
      } else {
        socket.emit('my_points', response);
      }
      
    } catch (error) {
      console.error('Error getting user points:', error);
      
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to get user points',
        context: 'get_my_points'
      };
      
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('my_points_error', errorResponse);
      }
    }
  });
};
