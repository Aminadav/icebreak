const Device = require('../../models/Device');
const User = require('../../models/User');

/**
 * Securely get userId from deviceId
 * @param {string} deviceId - The device ID from the client
 * @returns {Promise<string|null>} - The user ID or null if not found/verified
 */
async function getUserIdFromDevice(deviceId) {
  if (!deviceId) {
    return null;
  }
  
  try {
    const device = await Device.getDevice(deviceId);
    return device?.user_id || null;
  } catch (error) {
    console.error('Error getting userId from deviceId:', error);
    return null;
  }
}

/**
 * Validate that a socket has a registered device
 * @param {Object} socket - The socket instance
 * @throws {Error} - If device is not registered
 */
function validateDeviceRegistration(socket) {
  if (!socket.deviceId) {
    throw new Error('Device not registered');
  }
}

/**
 * Get user details by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - User details object
 */
async function getUserDetails(userId) {
  if (!userId) {
    return {};
  }
  
  try {
    const user = await User.getUserById(userId);
    if (user) {
      return {
        phoneNumber: user.phone_number,
        email: user.email,
        name: user.name,
        gender: user.gender,
        pendingImage: user.pending_image
      };
    }
  } catch (error) {
    console.error('Error getting user details:', error);
  }
  
  return {};
}

module.exports = {
  getUserIdFromDevice,
  validateDeviceRegistration,
  getUserDetails
};
