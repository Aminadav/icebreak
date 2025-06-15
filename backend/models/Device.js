const pool = require('../config/database');
const { generateDeviceId } = require('../utils/idGenerator');

/**
 * יצירת מכשיר חדש או החזרת קיים (ללא user_id עד לאימות)
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
    
    if (existingDevice.rows.length > 0) {
      // עדכון המכשיר הקיים עם זמן ביקור חדש
      await pool.query(
        'UPDATE devices SET last_seen = CURRENT_TIMESTAMP WHERE device_id = $1',
        [deviceId]
      );
      
      const device = existingDevice.rows[0];
      console.log(`📱 Device reconnected: ${deviceId}${device.user_id ? ` (User: ${device.user_id})` : ' (No user yet)'}`);
      
      return {
        deviceId,
        userId: device.user_id // May be null if not verified yet
      };
    } else {
      // יצירת מכשיר חדש ללא user_id (ימולא לאחר אימות)
      await pool.query(
        'INSERT INTO devices (device_id, user_id) VALUES ($1, $2)',
        [deviceId, null]
      );
      
      console.log(`📱 New device created: ${deviceId} (No user yet)`);
      
      return {
        deviceId,
        userId: null // Will be set after 2FA verification
      };
    }
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
