const pool = require('../config/database');
const { generateUserId } = require('../utils/idGenerator');
const { formatPhoneNumber } = require('../utils/smsService');

/**
 * Find user by phone number
 * @param {string} phoneNumber - Phone number in any format
 * @returns {Object|null} - User object or null if not found
 */
async function findUserByPhone(phoneNumber) {
  try {
    const normalizedPhone = formatPhoneNumber(phoneNumber);
    const result = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [normalizedPhone]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by phone:', error);
    throw error;
  }
}

/**
 * Create a new user with verified phone number
 * @param {string} phoneNumber - Phone number in any format
 * @returns {Object} - Created user object
 */
async function createUser(phoneNumber) {
  try {
    const normalizedPhone = formatPhoneNumber(phoneNumber);
    const userId = generateUserId();
    
    const result = await pool.query(
      'INSERT INTO users (user_id, phone_number) VALUES ($1, $2) RETURNING *',
      [userId, normalizedPhone]
    );
    
    console.log(`✅ Created new user: ${userId} with phone: ${normalizedPhone}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Find existing user by phone or create new one (only after verification)
 * @param {string} phoneNumber - Phone number in any format
 * @returns {Object} - User object (existing or newly created)
 */
async function findOrCreateUser(phoneNumber) {
  try {
    // First try to find existing user
    let user = await findUserByPhone(phoneNumber);
    
    if (user) {
      console.log(`📱 Found existing user: ${user.user_id} for phone: ${user.phone_number}`);
      return user;
    }
    
    // Create new user if not found
    user = await createUser(phoneNumber);
    return user;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
}

/**
 * Associate a device with a user
 * @param {string} deviceId - Device ID
 * @param {string} userId - User ID
 * @returns {Object} - Updated device information
 */
async function associateDeviceWithUser(deviceId, userId) {
  try {
    const result = await pool.query(
      'UPDATE devices SET user_id = $1, last_seen = CURRENT_TIMESTAMP WHERE device_id = $2 RETURNING *',
      [userId, deviceId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Device ${deviceId} not found`);
    }
    
    console.log(`🔗 Associated device ${deviceId} with user ${userId}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error associating device with user:', error);
    throw error;
  }
}

/**
 * Get all devices for a user
 * @param {string} userId - User ID
 * @returns {Array} - Array of device objects
 */
async function getUserDevices(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM devices WHERE user_id = $1 ORDER BY last_seen DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user devices:', error);
    throw error;
  }
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Object} - User statistics
 */
async function getUserStats(userId) {
  try {
    // Get device count
    const deviceResult = await pool.query(
      'SELECT COUNT(*) as device_count FROM devices WHERE user_id = $1',
      [userId]
    );
    
    // Get games created count
    const gamesResult = await pool.query(
      'SELECT COUNT(*) as games_created FROM games WHERE creator_user_id = $1',
      [userId]
    );
    
    return {
      deviceCount: parseInt(deviceResult.rows[0].device_count),
      gamesCreated: parseInt(gamesResult.rows[0].games_created)
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

module.exports = {
  findUserByPhone,
  createUser,
  findOrCreateUser,
  associateDeviceWithUser,
  getUserDevices,
  getUserStats
};
