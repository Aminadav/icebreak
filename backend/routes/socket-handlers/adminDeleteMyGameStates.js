const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for admin delete my game states
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerAdminDeleteMyGameStatesHandler(socket) {
  socket.on('admin-delete-my-game-states', async () => {
    console.log('🗑️ Admin: Deleting game states for current user');
    try {
      console.log('🗑️ Admin: Deleting all game states for current user');
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!userId) {
        socket.emit('error', { message: 'No user found for this device' });
        return;
      }

      // Delete all game states for the current user
      const result = await pool.query('DELETE FROM game_user_state WHERE user_id = $1', [userId]);
      
      console.log(`🗑️ Admin: Deleted ${result.rowCount} game states for user ${userId}`);
      socket.emit('admin_game_states_deleted', { 
        success: true, 
        message: `Successfully deleted ${result.rowCount} game states`,
        deletedCount: result.rowCount 
      });
    } catch (error) {
      console.error('❌ Admin: Error deleting game states:', error);
      socket.emit('error', { message: 'Failed to delete game states: ' + error.message });
    }
  });
}

module.exports = {
  registerAdminDeleteMyGameStatesHandler
};
