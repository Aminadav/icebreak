const Device = require('../../models/Device');

module.exports.registerPingHandler = async function(socket) {
  socket.on('ping', async () => {
    if (socket.deviceId) {
      try {
        await Device.updateLastSeen(socket.deviceId);
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    }
  });
};
