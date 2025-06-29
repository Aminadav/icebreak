const pool = require('../../config/database');
const moveUserToGameState = require('./moveUserToGameState');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for admin set page
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerAdminSetPageHandler(socket) {
  socket.on('admin-set-page', async (data) => {
    console.log('⭐ Admin: Setting page for current user', data);
    var {gameState, gameId} = data;  
    var userId = await getUserIdFromDevice(socket.deviceId);
    
    console.log({gameState,gameId})
    let result;
    
    // Update only state
    result = await pool.query(
      'UPDATE game_user_state SET state = $1 WHERE user_id = $2', 
      [gameState, userId]
    );
    console.log(`⭐ Admin: Updated ${result.rowCount} game states with state only for user ${userId}`);
      
    // socket.emit('admin_page_set', { 
    //   success: true, 
    //   message: `Successfully set ${result.rowCount} games to new state${metadata ? ' with metadata' : ''}`,
    //   updatedCount: result.rowCount 
    // });
    moveUserToGameState(socket, gameId, userId, gameState)
  });
}

module.exports = {
  registerAdminSetPageHandler
};
