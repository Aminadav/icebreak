const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for getting original image hash
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerGetOriginalImageHashHandler(socket) {
  socket.on('get_original_image_hash', async (callback) => {
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    // get pending_image for user
    var res = await pool.query('SELECT pending_image FROM users WHERE user_id = $1', [targetUserId])
    
    var originalImageHash = res.rows[0].pending_image;
    callback({ originalImageHash: originalImageHash });
  });
}

module.exports = {
  registerGetOriginalImageHashHandler
};
