const pool = require("../../config/database");

/**
 * Get game information including game name and creator name
 * @param {Object} socket - The socket connection
 * @param {Object} data - The request data containing gameId
 * @returns {Promise<void>} Emits game_info or error event
 */
async function getGameInfo(socket, data) {
  try {
    const { gameId } = data;
    
    if (!gameId) {
      socket.emit('error', { message: 'Game ID is required' });
      return;
    }

    // Get game info with creator name
    const query = `
      SELECT 
        g.name as game_name,
        u.name as creator_name
      FROM games g
      LEFT JOIN users u ON g.creator_user_id = u.user_id
      WHERE g.game_id = $1
    `;
    
    const result = await pool.query(query, [gameId]);
    
    if (result.rows.length === 0) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    const gameInfo = result.rows[0];
    
    socket.emit('game_info', {
      gameName: gameInfo.game_name || '',
      creatorName: gameInfo.creator_name || 'משתמש לא ידוע'
    });
    
  } catch (error) {
    console.error('Error getting game info:', error);
    socket.emit('error', { message: 'Failed to get game information' });
  }
}

/**
 * Register the get game info handler
 * @param {Object} socket - The socket connection
 */
function registerGetGameInfoHandler(socket) {
  socket.on('get_game_info', (data) => getGameInfo(socket, data));
}

module.exports = { registerGetGameInfoHandler };
