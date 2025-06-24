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
      throw new Error('Every request must have deviceID')
    }
    
    // Try to insert device first with ON CONFLICT to handle race conditions
    const user_id = generateUserId();
    
    // First, try to create the user (with ON CONFLICT in case it exists)
    await pool.query(
      'INSERT INTO users (user_id, is_temp_user) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [user_id, true]
    );
    
    // Now try to insert device with ON CONFLICT to handle existing devices
    const result = await pool.query(
      `INSERT INTO devices (device_id, user_id) VALUES ($1, $2) 
       ON CONFLICT (device_id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP 
       RETURNING device_id, user_id`,
      [deviceId, user_id]
    );
    
    const device = result.rows[0];
    // console.log(`📱 Device registered: ${device.device_id} (User: ${device.user_id})`);
    
    return {
      deviceId: device.device_id,
      userId: device.user_id
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
