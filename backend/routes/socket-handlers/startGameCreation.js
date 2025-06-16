const Device = require('../../models/Device');
const { validateDeviceRegistration } = require('./utils');

async function handleStartGameCreation(socket) {
  try {
    validateDeviceRegistration(socket);
    
    // Update journey state to GAME_NAME_ENTRY
    await Device.updateJourneyState(socket.deviceId, 'GAME_NAME_ENTRY');
    
    socket.emit('game_creation_started', {
      success: true,
      message: 'Game creation flow started'
    });
    
    console.log(`🎮 Game creation flow started for device: ${socket.deviceId}`);
  } catch (error) {
    console.error('Error starting game creation:', error);
    socket.emit('error', {
      message: 'Failed to start game creation',
      error: error.message
    });
  }
}

module.exports = handleStartGameCreation;
