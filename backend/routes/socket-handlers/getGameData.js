const Game = require('../../models/Game');
const { validateDeviceRegistration } = require('./utils');

async function handleGetGameData(socket, data) {
  try {
    const { gameId } = data;
    
    validateDeviceRegistration(socket);
    
    if (!gameId) {
      throw new Error('Game ID is required');
    }
    
    // console.log(`🎮 Getting game data for: ${gameId}`);
    
    // Get game data
    const game = await Game.getGame(gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Emit success with game data
    socket.emit('game_data', {
      success: true,
      gameId: game.game_id,
      gameName: game.name,
      status: game.status,
      createdAt: game.created_at,
      creatorUserId: game.creator_user_id
    });
    
    // console.log(`✅ Game data sent for: ${gameId}`);
    
  } catch (error) {
    console.error('Error getting game data:', error);
    socket.emit('error', {
      message: 'Failed to get game data',
      error: error.message,
      context: 'get_game_data'
    });
  }
}

module.exports = handleGetGameData;
