const pool = require('../config/database');
const { generateDeviceId, generateUserId } = require('../utils/idGenerator');

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
      // console.log(`📱 Device reconnected: ${deviceId}${device.user_id ? ` (User: ${device.user_id})` : ' (No user yet)'}`);
      
      return {
        deviceId,
        userId: device.user_id // May be null if not verified yet
      };
    } else {
      const user_id=generateUserId()
      await pool.query('INSERT INTO users (user_id,is_temp_user) VALUES ($1,$2)', [user_id,true]);
      await pool.query(
        'INSERT INTO devices (device_id, user_id) VALUES ($1, $2)',
        [deviceId, user_id]
      );
      
      console.log(`📱 New device created: ${deviceId} ${user_id})`);
      
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
    // if there is no user for that device, create new user and return it
    // if(result.rows.length === 0) {
    //   const userId = generateUserId();
    //   await pool.query('insert into users set user_id = $1', [userId]);

    // }
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting device:', error);
    throw error;
  }
}

module.exports = {
  registerDevice,
  updateLastSeen,
  getDevice,
};
