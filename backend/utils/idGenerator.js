const { v4: uuidv4 } = require('uuid');

/**
 * יצירת device ID חדש
 */
function generateDeviceId() {
  return uuidv4();
}

/**
 * יצירת user ID חדש
 */
function generateUserId() {
  return uuidv4();
}

/**
 * יצירת game ID חדש
 */
function generateGameId() {
  return uuidv4();
}

module.exports = {
  generateDeviceId,
  generateUserId,
  generateGameId
};
