const pool = require('../config/database');

/**
 * Adds points to a user and emits points_updated event
 * @param {string} userId - The user ID
 * @param {string} gameId - The game ID  
 * @param {number} amount - Points to add
 * @param {Object} socket - Socket instance to emit to
 * @returns {Promise<number>} New total points for the user in this game
 */
async function addPointsAndEmit(userId, gameId, amount, socket) {
  // Insert point transaction
  await pool.query(`
    INSERT INTO user_points (user_id, game_id, points)
    VALUES ($1, $2, $3)
  `, [userId, gameId, amount]);
  
  // Calculate new total points for this user in this game
  const totalResult = await pool.query(`
    SELECT COALESCE(SUM(points), 0) as total_points
    FROM user_points 
    WHERE user_id = $1 AND game_id = $2
  `, [userId, gameId]);
  
  const totalPoints = parseInt(totalResult.rows[0].total_points);
  
  // Emit points updated event to the user
  socket.emit('points_updated', {
    success: true,
    points: totalPoints,
    pointsAdded: amount
  });
  
  return totalPoints;
}

/**
 * Gets total points for a user in a game
 * @param {string} userId - The user ID
 * @param {string} gameId - The game ID
 * @returns {Promise<number>} Total points for the user in this game
 */
async function getUserTotalPoints(userId, gameId) {
  const result = await pool.query(`
    SELECT COALESCE(SUM(points), 0) as total_points
    FROM user_points 
    WHERE user_id = $1 AND game_id = $2
  `, [userId, gameId]);
  
  return parseInt(result.rows[0].total_points);
}

module.exports = {
  addPointsAndEmit,
  getUserTotalPoints
};
