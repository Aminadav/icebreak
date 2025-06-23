const Game = require('../../models/Game');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');
var moveUserToGameState=require( './moveUserToGameState');
const { generateGameId } = require('../../utils/idGenerator');
const pool = require('../../config/database');

/**
 * @typedef {import('../../GAME_METADATA_INTERFACE').GameMetadata} GameMetadata
 */

module.exports.registerCreateGameImmediatelyHandler = async function(socket) {

  /**
   * @param {import('socket.io').Socket} socket - The Socket.IO socket instance.
   */
  socket.on('create_game_immediately', async (data) => {
    const { gameName } = data;
    
    if (!socket.deviceId) {
      throw new Error('Device not registered');
    }
    
    // if (!gameName || gameName.trim().length === 0) {
    //   throw new Error('Game name is required');
    // }
    
    // Create game with anonymous creator (will be updated after verification)
    var userId = await getUserIdFromDevice(socket.deviceId);
    const gameId = generateGameId();
    
    const result = await pool.query(
      'INSERT INTO games (game_id, name, creator_user_id) VALUES ($1, $2, $3) RETURNING *',
      [gameId, gameName, userId]
    );
    
    // Create game_user_state with IS_CREATOR metadata
    /** @type {GameMetadata} */
    const creatorMetadata = {
      IS_CREATOR: true
    };
    
    await pool.query(
      'INSERT INTO game_user_state (user_id, game_id, metadata) VALUES ($1, $2, $3)',
      [userId, gameId, JSON.stringify(creatorMetadata)]
    );
    
    
    
    // Join the game room
    socket.join(gameId);
    
    socket.emit('game_created_immediately', {
      gameId: gameId,
      gameName: gameName,
      success: true,
      message: 'Game created successfully. Complete verification to claim ownership.'
    });
    var userId = await getUserIdFromDevice(socket.deviceId);
    await moveUserToGameState(socket, gameId, userId, { screenName: 'GIVE_GAME_NAME' });

    console.log(`🎮 Game created immediately: ${gameName} (${gameId}) for device: ${socket.deviceId}`);
  });
};
