const pool = require("../config/database");

/**
 * Get count of times a user has seen a specific screen
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} screenName - The screen name to check
 * @returns {Promise<number>} Number of times the screen was visited
 */
async function getSeenScreenCount(gameId, userId, screenName) {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM screen_visits 
    WHERE game_id = $1 AND user_id = $2 AND calc_screen_name = $3
  `, [gameId, userId, screenName]);
  
  return parseInt(result.rows[0].count);
}

/**
 * Check if user has seen a specific screen at least once
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} screenName - The screen name to check
 * @returns {Promise<boolean>} True if screen was visited at least once
 */
async function hasSeenScreen(gameId, userId, screenName) {
  const count = await getSeenScreenCount(gameId, userId, screenName);
  return count > 0;
}

/**
 * Get count of answers about myself (from user_answers table)
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Number of answers about myself
 */
async function getAnswersAboutMyselfCount(gameId, userId) {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM user_answers 
    WHERE gameid = $1 AND answering_user_id = $2 AND is_about_me = true
  `, [gameId, userId]);
  
  return parseInt(result.rows[0].count);
}

module.exports = {
  getSeenScreenCount,
  hasSeenScreen,
  getAnswersAboutMyselfCount
};
