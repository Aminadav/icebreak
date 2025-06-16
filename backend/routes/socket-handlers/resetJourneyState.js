const Device = require('../../models/Device');
const { validateDeviceRegistration } = require('./utils');

async function handleResetJourneyState(socket) {
  try {
    validateDeviceRegistration(socket);
    
    // Reset journey state to INITIAL and clear pending data
    await Device.updateJourneyState(socket.deviceId, 'INITIAL', {
      pendingGameName: null
    });
    
    console.log(`🔄 Journey state reset to INITIAL for device: ${socket.deviceId}`);
    
    socket.emit('journey_state_reset', {
      success: true,
      message: 'Journey state reset successfully'
    });
    
  } catch (error) {
    console.error('Error resetting journey state:', error);
    socket.emit('error', {
      message: 'Failed to reset journey state',
      error: error.message
    });
  }
}

module.exports = handleResetJourneyState;
