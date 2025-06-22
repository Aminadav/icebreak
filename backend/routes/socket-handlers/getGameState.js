const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for getting game state
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerGetGameStateHandler(socket) {
  socket.on('get-game-state', async ({gameId}) => {
    /** @type {GAME_STATES}*/
    var gameState = {screenName:'EMPTY_GAME_STATE'};
    var userId = await getUserIdFromDevice(socket.deviceId);
    // get from pool for current device id and current user id
    var res = await pool.query('SELECT * FROM game_user_state WHERE user_id = $1 AND game_id = $2', [userId, gameId])
    
    if(res.rows.length == 0) {
      gameState = {screenName:'BEFORE_START_ABOUT_YOU'}
      await pool.query('INSERT INTO game_user_state (user_id, game_id, state) VALUES ($1, $2, $3)', [userId, gameId, gameState]);
    } else {
      gameState = res.rows[0].state;
    }

    socket.emit('update-game-state', gameState);
  });
}

module.exports = {
  registerGetGameStateHandler
};
