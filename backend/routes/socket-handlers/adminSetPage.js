const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for admin set page
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerAdminSetPageHandler(socket) {
  socket.on('admin-set-page', async (gameState) => {
    console.log('⭐ Admin: Setting page to GOT_POINTS for current user');
      
    var userId = await getUserIdFromDevice(socket.deviceId);
      // Update all game states for the current user to GOT_POINTS
      const result = await pool.query('UPDATE game_user_state SET state = $1 WHERE user_id = $2', [gameState, userId]);
      
      console.log(`⭐ Admin: Updated ${result.rowCount} game states to GOT_POINTS for user ${userId}`);
      socket.emit('admin_page_set', { 
        success: true, 
        message: `Successfully set ${result.rowCount} games to Got Points page`,
        updatedCount: result.rowCount 
      });
  });
}

module.exports = {
  registerAdminSetPageHandler
};
