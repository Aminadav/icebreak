const Game = require('../../models/Game');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');
var moveUserToGameState=require( './moveUserToGameState');
/**
 * Handle immediate game creation with name
 * This creates a game immediately without requiring phone verification
 * Used for the new URL-based navigation system
 */
async function handleCreateGameImmediately(socket, data) {
  try {
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
    const game = await Game.createGame(trimmedGameName, null);
    
    // Store game info in socket for later association
    socket.pendingGameId = game.game_id;
    socket.pendingGameName = trimmedGameName;
    
    // Track game creation
    await sendToMixpanel({
      trackingId: 'game_created_immediately',
      deviceId: socket.deviceId,
      timestamp: new Date().toISOString(),
      game_id: game.game_id,
      game_name: game.name,
      socketId: socket.id,
      creation_type: 'immediate_anonymous'
    });
    
    // Join the game room
    socket.join(game.game_id);
    
    socket.emit('game_created_immediately', {
      gameId: game.game_id,
      gameName: game.name,
      status: game.status,
      createdAt: game.created_at,
      success: true,
      message: 'Game created successfully. Complete verification to claim ownership.'
    });
    var userId=await getUserIdFromDevice(socket.deviceId);
    await moveUserToGameState(socket, game.game_id, userId, { screenName: 'GIVE_GAME_NAME' });

    console.log(`🎮 Game created immediately: ${game.name} (${game.game_id}) for device: ${socket.deviceId}`);
    
  } catch (error) {
    console.error('Error creating game immediately:', error);
    socket.emit('error', {
      message: 'Failed to create game',
      error: error.message,
      context: 'create_game_immediately'
    });
  }
}

module.exports = handleCreateGameImmediately;
