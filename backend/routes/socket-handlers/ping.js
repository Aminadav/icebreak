const Device = require('../../models/Device');

async function handlePing(socket) {
  if (socket.deviceId) {
    try {
      await Device.updateLastSeen(socket.deviceId);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }
}

module.exports = handlePing;
