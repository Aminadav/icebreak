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
 * Find user by user ID
 * @param {string} userId - User ID
 * @returns {Object|null} - User object or null if not found
 */
async function getUserById(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
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

/**
 * Update user email address
 * @param {string} userId - User ID
 * @param {string} email - Email address (normalized)
 * @returns {Object} - Success result or error
 */
async function updateUserEmail(userId, email) {
  try {
    const result = await pool.query(
      'UPDATE users SET email = $1, email_verified = FALSE WHERE user_id = $2 RETURNING *',
      [email, userId]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      user: result.rows[0],
      message: 'Email updated successfully'
    };
  } catch (error) {
    console.error('Error updating user email:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505' && error.constraint === 'unique_email_lower') {
      return { success: false, error: 'Email address already exists' };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Update user name and gender
 * @param {string} userId - User ID
 * @param {string} name - User name
 * @param {string} gender - User gender ('male' or 'female')
 * @returns {Object} - Success result or error
 */
async function updateUserNameAndGender(userId, name, gender) {
  try {
    // Validate gender
    if (gender && !['male', 'female'].includes(gender)) {
      return { success: false, error: 'Invalid gender. Must be "male" or "female"' };
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, gender = $2 WHERE user_id = $3 RETURNING *',
      [name, gender, userId]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      user: result.rows[0],
      message: 'Name and gender updated successfully'
    };
  } catch (error) {
    console.error('Error updating user name and gender:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user name only
 * @param {string} userId - User ID
 * @param {string} name - User name
 * @returns {Object} - Success result or error
 */
async function updateUserName(userId, name) {
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *',
      [name, userId]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      user: result.rows[0],
      message: 'Name updated successfully'
    };
  } catch (error) {
    console.error('Error updating user name:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user selected image
 * @param {string} userId - User ID
 * @param {string} imageHash - Selected image hash
 * @returns {Object} - Success result or error
 */
async function updateUserImage(userId, imageHash) {
  try {
    const result = await pool.query(
      'UPDATE users SET image = $1, has_image = TRUE WHERE user_id = $2 RETURNING *',
      [imageHash, userId]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      user: result.rows[0],
      message: 'User image updated successfully'
    };
  } catch (error) {
    console.error('Error updating user image:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  findUserByPhone,
  getUserDevices,
  getUserStats,
  updateUserEmail,
  updateUserNameAndGender,
  updateUserName,
  getUserById,
  updateUserImage
};
