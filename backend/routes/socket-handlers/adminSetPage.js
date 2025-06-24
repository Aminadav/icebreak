const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for admin set page
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerAdminSetPageHandler(socket) {
  socket.on('admin-set-page', async (data) => {
    console.log('⭐ Admin: Setting page for current user', data);
      
    var userId = await getUserIdFromDevice(socket.deviceId);
    
    // Extract state and metadata from the data
    const gameState = data.state || data; // Support both new format {state, metadata} and old format (direct state)
    const metadata = data.metadata || null;
    
    let result;
    
    if (metadata) {
      // Update both state and metadata
      result = await pool.query(
        'UPDATE game_user_state SET state = $1, metadata = $2 WHERE user_id = $3', 
        [gameState, JSON.stringify(metadata), userId]
      );
      console.log(`⭐ Admin: Updated ${result.rowCount} game states with state and metadata for user ${userId}`);
    } else {
      // Update only state
      result = await pool.query(
        'UPDATE game_user_state SET state = $1 WHERE user_id = $2', 
        [gameState, userId]
      );
      console.log(`⭐ Admin: Updated ${result.rowCount} game states with state only for user ${userId}`);
    }
      
    socket.emit('admin_page_set', { 
      success: true, 
      message: `Successfully set ${result.rowCount} games to new state${metadata ? ' with metadata' : ''}`,
      updatedCount: result.rowCount 
    });
  });
}

module.exports = {
  registerAdminSetPageHandler
};
