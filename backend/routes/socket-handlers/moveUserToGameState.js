var { Socket } =require( "socket.io");
var  pool=require("../../config/database");
const { getGameUserRoom } = require("../../socket-room");
const { getGlobalIo } = require("../../utils/socketGlobal");
const { recordActivity } = require("../../utils/userActivityUtils");

/**
 * Handles the 'moveToScreen' event for a game.
 * @param {Socket} socket - The socket instance.
 * @param {string} gameId - The ID of the game.
 * @param {string} userId - The ID of the game.
 * @param {GAME_STATES} gameState - The name of the screen to move to.
 */
module.exports=async function moveUserToGameState(socket,gameId,userId, gameState) {
  if(socket) {
      // socket.emit('update-game-state',gameState)
      // console.log(`Send to ${getGameUserRoom(gameId, userId)}`)
      const io = getGlobalIo();
      io.to(getGameUserRoom(gameId, userId)).emit('update-game-state', gameState
      )
  }
  
  // Update current state
  await pool.query(`
      INSERT INTO game_user_state (game_id, user_id, state) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (game_id, user_id) 
      DO UPDATE SET state = $3, updated_at = CURRENT_TIMESTAMP
  `, [gameId, userId, gameState]);
  
  // Record screen visit in user_activities
  if (gameState && gameState.screenName) {
    await recordActivity(gameId, userId, 'screen_visit', gameState.screenName);
  }
}