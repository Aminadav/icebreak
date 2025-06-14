const pool = require('../config/database');
const { generateDeviceId, generateUserId } = require('../utils/idGenerator');

/**
 * יצירת מכשיר חדש או החזרת קיים
 */
async function registerDevice(existingDeviceId = null) {
  try {
    let deviceId = existingDeviceId;
    
    // אם לא נשלח device_id, ניצור חדש
    if (!deviceId) {
      deviceId = generateDeviceId();
    }
    
    // בדיקה אם המכשיר כבר קיים
    const existingDevice = await pool.query(
      'SELECT * FROM devices WHERE device_id = $1',
      [deviceId]
    );
    
    // יצירת user_id חדש בכל מקרה
    const userId = generateUserId();
    
    if (existingDevice.rows.length > 0) {
      // עדכון המכשיר הקיים עם user_id חדש
      await pool.query(
        'UPDATE devices SET user_id = $1, last_seen = CURRENT_TIMESTAMP WHERE device_id = $2',
        [userId, deviceId]
      );
    } else {
      // יצירת מכשיר חדש
      await pool.query(
        'INSERT INTO devices (device_id, user_id) VALUES ($1, $2)',
        [deviceId, userId]
      );
    }
    
    return {
      deviceId,
      userId
    };
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
}

/**
 * עדכון זמן הביקור האחרון של המכשיר
 */
async function updateLastSeen(deviceId) {
  try {
    await pool.query(
      'UPDATE devices SET last_seen = CURRENT_TIMESTAMP WHERE device_id = $1',
      [deviceId]
    );
  } catch (error) {
    console.error('Error updating last seen:', error);
    throw error;
  }
}

/**
 * קבלת פרטי המכשיר
 */
async function getDevice(deviceId) {
  try {
    const result = await pool.query(
      'SELECT * FROM devices WHERE device_id = $1',
      [deviceId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting device:', error);
    throw error;
  }
}

module.exports = {
  registerDevice,
  updateLastSeen,
  getDevice
};
