const Game = require('../../models/Game');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');
var moveUserToGameState=require( './moveUserToGameState');
const { generateGameId } = require('../../utils/idGenerator');
const pool = require('../../config/database');
/**
 * Handle immediate game creation with name
 * This creates a game immediately without requiring phone verification
 * Used for the new URL-based navigation system
 */
async function handleCreateGameImmediately(socket, data) {
    const { gameName } = data;
    
    if (!socket.deviceId) {
      throw new Error('Device not registered');
    }
    
    // if (!gameName || gameName.trim().length === 0) {
    //   throw new Error('Game name is required');
    // }
    
    // For immediate game creation, we create an anonymous game first
    // The user will be prompted to verify later to claim the game
    const trimmedGameName = gameName.trim();
    
    // Create game with anonymous creator (will be updated after verification)
    var userId = await getUserIdFromDevice(socket.deviceId);
      const gameId = generateGameId();
    
    const result = await pool.query(
      'INSERT INTO games (game_id, name, creator_user_id) VALUES ($1, $2, $3) RETURNING *',
      [gameId, gameName, userId]
    );
    
    
    
    // Join the game room
    socket.join(gameId);
    
    socket.emit('game_created_immediately', {
      gameId: gameId,
      gameName: gameName,
      success: true,
      message: 'Game created successfully. Complete verification to claim ownership.'
    });
    var userId=await getUserIdFromDevice(socket.deviceId);
    await moveUserToGameState(socket, gameId, userId, { screenName: 'GIVE_GAME_NAME' });

    console.log(`🎮 Game created immediately: ${gameName} (${gameId}) for device: ${socket.deviceId}`);
}

module.exports = handleCreateGameImmediately;
