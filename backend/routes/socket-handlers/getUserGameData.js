const { getUserIdFromDevice } = require('./utils');
const { getUserTotalPoints } = require('../../utils/points-helper');
const pool = require('../../config/database');

/**
 * Get complete user data and emit user_game_data_updated event
 */
module.exports.registerGetUserGameDataHandler = function(socket) {
  socket.on('get_user_game_data', async (data) => {
    try {
      const { gameId } = data;
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!userId) {
        console.log('❌ getUserData: No user found for device');
        return;
      }

      // console.log(`📋 Getting user data for user ${userId} in game ${gameId}`);

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

      // Get user points for this game
      const points = await getUserTotalPoints(userId, gameId);

      // Get user badges for this game
      const { checkForMissingBadge } = require('./badgeHelpers');
      const badgesResult = await pool.query(`
        SELECT badge_id FROM badges 
        WHERE user_id = $1 AND game_id = $2
      `, [userId, gameId]);

      const userBadgeIds = badgesResult.rows.map(row => row.badge_id);
      
      // Get current badge based on points
      const { getCurrentBadge } = require('../../../shared/badge-list');
      const currentBadge = getCurrentBadge(points);

      // console.log(`📋 User data loaded: ${user.name}, ${points} points, ${userBadgeIds.length} badges`);

      // Emit complete user data
      socket.emit('user_game_data_updated', {
        success: true,
        userId: userId,
        phoneNumber: user.phone_number,
        email: user.email,
        name: user.name,
        gender: user.gender,
        image: user.image,
        points: points,
        currentBadge: currentBadge,
        allBadges: userBadgeIds
      });

    } catch (error) {
      console.error('❌ getUserData error:', error);
      socket.emit('user_game_data_updated', {
        success: false,
        message: 'Failed to load user data'
      });
    }
  });
};
