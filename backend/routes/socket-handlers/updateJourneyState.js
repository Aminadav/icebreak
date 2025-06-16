const Device = require('../../models/Device');
const { validateDeviceRegistration } = require('./utils');

async function handleUpdateJourneyState(socket, data) {
  try {
    const { journeyState } = data;
    
    validateDeviceRegistration(socket);
    
    if (!journeyState) {
      throw new Error('Journey state is required');
    }
    
    // Update journey state
    await Device.updateJourneyState(socket.deviceId, journeyState);
    
    console.log(`🎯 Journey state updated to ${journeyState} for device: ${socket.deviceId}`);
    
    socket.emit('journey_state_updated', {
      success: true,
      journeyState: journeyState,
      message: `Journey state updated to ${journeyState}`
    });
    
  } catch (error) {
    console.error('Error updating journey state:', error);
    socket.emit('error', {
      message: 'Failed to update journey state',
      error: error.message
    });
  }
}

module.exports = handleUpdateJourneyState;
