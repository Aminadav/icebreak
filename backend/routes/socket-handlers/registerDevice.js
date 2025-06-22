const Device = require('../../models/Device');
const { getUserDetails } = require('./utils');

module.exports.registerRegisterDeviceHandler = async function(socket) {
  socket.on('register_device', async (data) => {
    console.log('@@@@')
    try {
      // Use device ID from socket (attached during connection) or fallback to data
      const deviceId = socket.deviceId || data?.deviceId;
      
      if (!deviceId) {
        throw new Error('No device ID available for registration');
      }
      
      const result = await Device.registerDevice(deviceId);
      
      // שמירת המידע בsocket לשימוש עתידי
      socket.deviceId = result.deviceId;
      socket.userId = result.userId; // May be null if device not yet verified
      
      // Get user details if userId exists
      const userDetails = await getUserDetails(result.userId);
      
      socket.emit('device_registered', {
        deviceId: result.deviceId,
        userId: result.userId,
        success: true,
        isVerified: !!result.userId,
        ...userDetails
      });

    } catch (error) {
      console.error('Error registering device:', error);
      socket.emit('error', {
        message: 'Failed to register device',
        error: error.message
      });
    }
  });
};
