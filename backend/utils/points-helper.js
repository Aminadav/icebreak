const pool = require('../config/database');

/**
 * Adds points to a user, checks for new badges, and emits points_updated event
 * @param {string} userId - The user ID
 * @param {string} gameId - The game ID  
 * @param {number} amount - Points to add
 * @param {Object} socket - Socket instance to emit to
 * @returns {Promise<{totalPoints: number, earnedBadge: Object|null}>} New total points and any earned badge
 */
async function addPointsWithBadgeCheckAndEmit(userId, gameId, amount, socket) {
  console.log('addPointsWithBadgeCheckAndEmit', { userId, gameId, amount });
  // Get current points before adding new points
  const oldPoints = await getUserTotalPoints(userId, gameId);
  
  // Insert point transaction
  await pool.query(`
    INSERT INTO user_points (user_id, game_id, points)
    VALUES ($1, $2, $3)
  `, [userId, gameId, amount]);
  
  // Calculate new total points for this user in this game
  const totalPoints = oldPoints + amount;
  
  // Check if user should get a new badge but don't award it here
  // The screen flow will handle badge awarding when user continues from GOT_POINTS
  const { checkForMissingBadge } = require('../routes/socket-handlers/badgeHelpers');
  const badgeToAward = await checkForMissingBadge(userId, gameId);

  console.log('badgeToAward (for info only)', {badgeToAward});
  
  // Emit points updated event to the user (without badge info for now)
  socket.emit('points_updated', {
    success: true,
    points: totalPoints,
    pointsAdded: amount,
    hasPendingBadge: badgeToAward !== null // Let frontend know there might be a badge coming
  });
  
  return {
    totalPoints,
    earnedBadge: badgeToAward // Return badge info for backward compatibility but don't award yet
  };
}

/**
 * Legacy function for backward compatibility - use addPointsWithBadgeCheckAndEmit instead
 * @deprecated Use addPointsWithBadgeCheckAndEmit for automatic badge checking
 */
async function addPointsAndEmit(userId, gameId, amount, socket) {
  const result = await addPointsWithBadgeCheckAndEmit(userId, gameId, amount, socket);
  return result.totalPoints;
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
  addPointsWithBadgeCheckAndEmit,
  getUserTotalPoints
};
