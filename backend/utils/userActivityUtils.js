const pool = require("../config/database");

/**
 * Check if user has performed a specific activity
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} activityType - The activity type ('screen_visit', 'button_click', etc.)
 * @param {string} activityName - The activity name
 * @returns {Promise<boolean>} True if activity was performed at least once
 */
async function userDidActivity(gameId, userId, activityType, activityName) {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM user_activities 
    WHERE game_id = $1 AND user_id = $2 AND activity_type = $3 AND activity_name = $4
  `, [gameId, userId, activityType, activityName]);
  
  return parseInt(result.rows[0].count) > 0;
}

/**
 * Check if user has NOT performed a specific activity
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} activityType - The activity type
 * @param {string} activityName - The activity name
 * @returns {Promise<boolean>} True if activity was NOT performed
 */
async function userDidNotActivity(gameId, userId, activityType, activityName) {
  return !(await userDidActivity(gameId, userId, activityType, activityName));
}

/**
 * Check if user has visited a specific screen
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} screenName - The screen name
 * @returns {Promise<boolean>} True if screen was visited at least once
 */
async function userVisited(gameId, userId, screenName) {
  return userDidActivity(gameId, userId, 'screen_visit', screenName);
}

/**
 * Check if user has NOT visited a specific screen
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} screenName - The screen name
 * @returns {Promise<boolean>} True if screen was NOT visited
 */
async function userNotVisited(gameId, userId, screenName) {
  return userDidNotActivity(gameId, userId, 'screen_visit', screenName);
}

/**
 * Check if user has clicked a specific button/element
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} buttonName - The button/element name
 * @returns {Promise<boolean>} True if button was clicked at least once
 */
async function userClicked(gameId, userId, buttonName) {
  return userDidActivity(gameId, userId, 'button_click', buttonName);
}

/**
 * Check if user has NOT clicked a specific button/element
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} buttonName - The button/element name
 * @returns {Promise<boolean>} True if button was NOT clicked
 */
async function userNotClicked(gameId, userId, buttonName) {
  return userDidNotActivity(gameId, userId, 'button_click', buttonName);
}

/**
 * Record a user activity in the database
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} activityType - The activity type
 * @param {string} activityName - The activity name
 * @returns {Promise<void>}
 */
async function recordActivity(gameId, userId, activityType, activityName) {
  await pool.query(`
    INSERT INTO user_activities (game_id, user_id, activity_type, activity_name)
    VALUES ($1, $2, $3, $4)
  `, [gameId, userId, activityType, activityName]);
}

module.exports = {
  userDidActivity,
  userDidNotActivity,
  userVisited,
  userNotVisited,
  userClicked,
  userNotClicked,
  recordActivity
};
