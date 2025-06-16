const Device = require('../../models/Device');
const { validateDeviceRegistration } = require('./utils');

async function handleSetGameName(socket, data) {
  try {
    const { gameName } = data;
    
    validateDeviceRegistration(socket);
    
    if (!gameName || gameName.trim().length === 0) {
      throw new Error('Game name is required');
    }
    
    // שמירת שם המשחק ב-socket ובמסד הנתונים
    socket.pendingGameName = gameName.trim();
    
    // Update journey state to GAME_NAME_SET
    await Device.updateJourneyState(socket.deviceId, 'GAME_NAME_SET', {
      pendingGameName: gameName.trim()
    });
    
    socket.emit('game_name_saved', {
      gameName: socket.pendingGameName,
      success: true,
      message: 'Game name saved. Please verify your phone number to create the game.'
    });
    
    console.log(`🎮 Game name saved: "${socket.pendingGameName}" for device: ${socket.deviceId}`);
  } catch (error) {
    console.error('Error saving game name:', error);
    socket.emit('error', {
      message: 'Failed to save game name',
      error: error.message
    });
  }
}

module.exports = handleSetGameName;
