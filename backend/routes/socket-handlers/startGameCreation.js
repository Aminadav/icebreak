const Device = require('../../models/Device');
const User = require('../../models/User');
const Game = require('../../models/Game');
const { validateDeviceRegistration } = require('./utils');

async function handleStartGameCreation(socket) {
  try {
    if (!socket.deviceId) {
      throw new Error('Device not registered');
    }
    
    // Create temporary user
    const tempUser = await User.createTemporaryUser();
    
    // Associate device with temporary user
    await User.associateDeviceWithUser(socket.deviceId, tempUser.user_id);
    
    // Create game with temporary user as creator
    const game = await Game.createGame('Untitled Game', tempUser.user_id); // Temporary name, will be updated later
    
    
    socket.emit('game_creation_started', {
      success: true,
      message: 'Game creation flow started',
      gameId: game.game_id,
    });
    
    console.log(`🎮 Game creation flow started for device: ${socket.deviceId}, temp user: ${tempUser.user_id}, game: ${game.game_id}`);
  } catch (error) {
    console.error('Error starting game creation:', error);
    socket.emit('error', {
      message: 'Failed to start game creation',
      error: error.message
    });
  }
}

module.exports = handleStartGameCreation;
