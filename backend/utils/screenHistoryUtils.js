const pool = require("../config/database");

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
  getAnswersAboutMyselfCount
};
