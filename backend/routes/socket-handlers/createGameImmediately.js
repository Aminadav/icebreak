const Game = require('../../models/Game');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');
const { push_user_to_next_screen } = require('./push-user-next-screen');
const { generateGameId } = require('../../utils/idGenerator');
const pool = require('../../config/database');
const { awardBadge } = require('./badgeHelpers');
const { BADGES } = require('../../../shared/badge-list');

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
    
    const creatorMetadata = {
    };
    
    await pool.query(
      'INSERT INTO game_user_state (user_id, game_id, metadata) VALUES ($1, $2, $3)',
      [userId, gameId, JSON.stringify(creatorMetadata)]
    );

    await awardBadge(userId, gameId, BADGES[0].id);
    
    
    
    // Join the game room
    socket.join(gameId);
    
    socket.emit('game_created_immediately', {
      gameId: gameId,
      gameName: gameName,
      success: true,
      message: 'Game created successfully. Complete verification to claim ownership.'
    });
    await push_user_to_next_screen(socket, gameId, userId);

    // console.log(`🎮 Game created immediately: ${gameName} (${gameId}) for device: ${socket.deviceId}`);
  });
};
