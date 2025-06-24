const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');

/**
 * Handles the 'get_user_badges' event to get user's current badges
 * @param {Object} socket - The socket instance
 */
module.exports.registerGetUserBadgesHandler = async function (socket) {
  socket.on('get_user_badges', async (data, callback) => {
    const { gameId } = data;
    const userId = await getUserIdFromDevice(socket.deviceId);
    
    try {
      // Get user's badges with badge details
      const badgesResult = await pool.query(`
        SELECT b.badge_id, b.created_at
        FROM badges b
        WHERE b.user_id = $1 AND b.game_id = $2
        ORDER BY b.created_at DESC
      `, [userId, gameId]);
      
      // Get badge details from shared badge list
      const { BADGES } = require("../../../shared/badge-list");
      
      const userBadges = badgesResult.rows.map(row => {
        const badgeDetails = BADGES.find(badge => badge.id === row.badge_id);
        return {
          ...badgeDetails,
          earnedAt: row.created_at
        };
      });
      
      // Get current badge (most recent one)
      const currentBadge = userBadges.length > 0 ? userBadges[0] : null;
      
      const response = {
        success: true,
        currentBadge,
        allBadges: userBadges
      };
      
      // Send response via callback if provided
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      
      // Also emit for real-time updates
      socket.emit('user_badges_updated', response);
      
    } catch (error) {
      console.error('Error getting user badges:', error);
      const errorResponse = { success: false, message: 'Failed to get user badges' };
      
      if (callback && typeof callback === 'function') {
        callback(errorResponse);
      }
      
      socket.emit('error', errorResponse);
    }
  });
};
