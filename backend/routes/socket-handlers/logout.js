const pool = require('../../config/database');
const { sendUserDataToClient } = require('./utils');

/**
 * Handle user logout - clears user_id from device and performs cleanup
 * @param {import('socket.io').Socket} socket - The Socket.IO socket instance.
 */
module.exports.registerLogoutHandler = function(socket) {
  socket.on('logout', async (data) => {
    try {
      const deviceId = socket.deviceId;
      
      if (!deviceId) {
        socket.emit('logout_response', {
          success: false,
          error: 'No device ID found'
        });
        return;
      }

      // Clear the user_id from the devices table
      await pool.query(
        'UPDATE devices SET user_id = NULL WHERE device_id = $1',
        [deviceId]
      );

      console.log(`🚪 User logged out from device: ${deviceId}`);

      // Note: Socket user data will be refreshed on next device registration

      socket.emit('logout_response', {
        success: true,
        message: 'Logged out successfully'
      });
      await sendUserDataToClient(socket, null)

    } catch (error) {
      console.error('Error during logout:', error);
      socket.emit('logout_response', {
        success: false,
        error: error.message
      });
    }
  });
};
