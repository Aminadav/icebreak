const pool = require('../../config/database');
const Device = require('../../models/Device');
const User = require('../../models/User');
const { generateUserId } = require('../../utils/idGenerator');

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
    var deviceResult = await pool.query(
      'SELECT * FROM devices WHERE device_id = $1',
      [deviceId]
    );
    
    // If no device row exists, create one with a temporary user
    if (deviceResult.rows.length === 0) {
      const userId = generateUserId();
      
      // Create temporary user
      await pool.query(
        'INSERT INTO users (user_id, is_temp_user) VALUES ($1, $2)',
        [userId, true]
      );
      
      // Create device row
      await pool.query(
        'INSERT INTO devices (device_id, user_id) VALUES ($1, $2)',
        [deviceId, userId]
      );
      
      console.log(`Created device ${deviceId} with temporary user ${userId}`);
      return userId;
    }
    
    const device = deviceResult.rows[0];
    
    // If device exists but no userId, create temporary user
    if (!device.user_id) {
      const userId = generateUserId();
      
      // Create temporary user
      await pool.query(
        'INSERT INTO users (user_id, is_temp_user) VALUES ($1, $2)',
        [userId, true]
      );
      
      // Update device with userId
      await pool.query(
        'UPDATE devices SET user_id = $1 WHERE device_id = $2',
        [userId, deviceId]
      );
      
      console.log(`Created temporary user ${userId} for existing device ${deviceId}`);
      return userId;
    }
    
    return device.user_id;
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
        pendingImage: user.pending_image,
        is_temp_user: user.is_temp_user
      };
    }
  } catch (error) {
    console.error('Error getting user details:', error);
  }
  
  return {};
}

/**
 * Send updated user data to client
 * @param {Object} socket - The socket instance
 * @param {string} userId - The user ID
 */
async function sendUserDataToClient(socket, userId) {
  try {
    if (!userId) {
      return;
    }
    
    const userDetails = await getUserDetails(userId);
    
    socket.emit('user_data_updated', {
      deviceId: socket.deviceId,
      userId: userId,
      success: true,
      isVerified: userDetails.phoneNumber && !userDetails.is_temp_user,
      ...userDetails
    });
    
    console.log(`Sent updated user data to client for user ${userId}`);
  } catch (error) {
    console.error('Error sending user data to client:', error);
  }
}

module.exports = {
  getUserIdFromDevice,
  validateDeviceRegistration,
  getUserDetails,
  sendUserDataToClient
};
