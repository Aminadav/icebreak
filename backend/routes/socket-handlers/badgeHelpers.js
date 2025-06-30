const pool = require('../../config/database');
const { getUserTotalPoints } = require('../../utils/points-helper');
const moveUserToGameState = require('./moveUserToGameState');
const { emitBadgeUpdateToGameRoom } = require('./getDataForBadgePage');

/**
 * Award a badge to a user and show the badge screen
 * This function can be called from any handler to award special badges
 * @param {Object} socket - Socket instance
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {string} badgeId - Badge ID to award
 * @returns {Promise<Object>} - The awarded badge object
 */
async function awardBadgeAndShowScreen(socket, userId, gameId, badgeId) {
  // Check if user already has this badge
  const existingBadgeResult = await pool.query(`
    SELECT id FROM badges 
    WHERE user_id = $1 AND game_id = $2 AND badge_id = $3
  `, [userId, gameId, badgeId]);
  
  if (existingBadgeResult.rows.length > 0) {
    console.log(`⚠️ User ${userId} already has badge ${badgeId} in game ${gameId}`);
    return null;
  }
  
  // Award the badge
  await pool.query(`
    INSERT INTO badges (user_id, game_id, badge_id) 
    VALUES ($1, $2, $3)
  `, [userId, gameId, badgeId]);
  
  // Get the badge details from our badge list
  const { BADGES } = require("../../../shared/badge-list");
  const badgeDetails = BADGES.find(badge => badge.id === badgeId);
  
  console.log(`🏆 Badge awarded: ${badgeDetails?.name || badgeId} to user ${userId} in game ${gameId}`);
  
  // Broadcast badge update to all users in the game room
  await emitBadgeUpdateToGameRoom(gameId);
  
  // Show the badge screen
  await moveUserToGameState(socket, gameId, userId, {
    screenName: 'GOT_BADGE',
    badgeId: badgeId,
    // friendsInLevel: [] // TODO: Implement friends in level logic
  });
  
  return badgeDetails;
}

/**
 * Check what badges user should have vs what they actually have, and return missing badge to award
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @returns {Promise<Object|null>} - Lowest missing badge to award (for proper progression) or null
 */
async function checkForMissingBadge(userId, gameId) {

  const currentPoints = await getUserTotalPoints(userId, gameId);
  
  // Auto-award "warming_up" badge silently if user doesn't have it
  const userBadgesResult = await pool.query(`
    SELECT badge_id FROM badges 
    WHERE user_id = $1 AND game_id = $2
  `, [userId, gameId]);
  
  const userBadgeIds = userBadgesResult.rows.map(row => row.badge_id);
  
  if (!userBadgeIds.includes('warming_up')) {
    console.log(`🏆 Auto-awarding warming_up badge to user ${userId} silently`);
    await awardBadge(userId, gameId, 'warming_up');
    // Refresh user badges after awarding warming_up
    const updatedBadgesResult = await pool.query(`
      SELECT badge_id FROM badges 
      WHERE user_id = $1 AND game_id = $2
    `, [userId, gameId]);
    userBadgeIds.length = 0; // Clear array
    userBadgeIds.push(...updatedBadgesResult.rows.map(row => row.badge_id));
  }
  
  // Get all badges user should have based on points (excluding warming_up which is auto-awarded)
  const { getAllDeservedBadges } = require("../../../shared/badge-list");
  const deservedBadges = getAllDeservedBadges(currentPoints).filter(badge => badge.id !== 'warming_up');
  
  if (deservedBadges.length === 0) {
    return null; // User doesn't deserve any non-warming_up badges yet
  }
  
  console.log('userBadgeIds', {userBadgeIds});
  
  // Find missing badges (deserved but not awarded, excluding warming_up)
  const missingBadges = deservedBadges.filter(badge => !userBadgeIds.includes(badge.id));
  
  if (missingBadges.length === 0) {
    return null; // User has all badges they deserve
  }
  
  // Return the lowest missing badge (lowest points required) to maintain proper progression
  const lowestMissingBadge = missingBadges.reduce((lowest, current) => 
    current.pointsRequired < lowest.pointsRequired ? current : lowest
  );
  
  console.log(`🏆 Found missing badge: ${lowestMissingBadge.name} (${lowestMissingBadge.pointsRequired} points) for user ${userId}`);
  return lowestMissingBadge;
}

/**
 * Check if user should be awarded a new badge based on points (DEPRECATED)
 * @deprecated Use checkForMissingBadge instead for more robust checking
 */
async function checkIfNewBadgeShouldBeAwarded(userId, gameId, oldPoints, newPoints) {
  const { getNewlyEarnedBadge } = require("../../../shared/badge-list");
  const newBadge = getNewlyEarnedBadge(oldPoints, newPoints);
  
  if (!newBadge) {
    return null;
  }
  
  // Check if user already has this badge
  const existingBadgeResult = await pool.query(`
    SELECT id FROM badges 
    WHERE user_id = $1 AND game_id = $2 AND badge_id = $3
  `, [userId, gameId, newBadge.id]);
  
  if (existingBadgeResult.rows.length > 0) {
    return null; // User already has this badge
  }
  
  return newBadge;
}

/**
 * Award a badge to a user (without showing screen)
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {string} badgeId - Badge ID to award
 * @param {Object} socket - Optional socket instance for broadcasting updates
 * @returns {Promise<Object>} - The awarded badge object
 */
async function awardBadge(userId, gameId, badgeId, socket = null) {
  // Check if user already has this badge
  const existingBadgeResult = await pool.query(`
    SELECT id FROM badges 
    WHERE user_id = $1 AND game_id = $2 AND badge_id = $3
  `, [userId, gameId, badgeId]);
  
  if (existingBadgeResult.rows.length > 0) {
    throw new Error(`User ${userId} already has badge ${badgeId} in game ${gameId}`);
  }
  
  // Award the badge
  await pool.query(`
    INSERT INTO badges (user_id, game_id, badge_id) 
    VALUES ($1, $2, $3)
  `, [userId, gameId, badgeId]);
  
  // Get the badge details from our badge list
  const { BADGES } = require("../../../shared/badge-list");
  const badgeDetails = BADGES.find(badge => badge.id === badgeId);
  
  console.log(`🏆 Badge awarded: ${badgeDetails?.name || badgeId} to user ${userId} in game ${gameId}`);
  
  // Broadcast badge update to all users in the game room
  await emitBadgeUpdateToGameRoom( gameId);
  return badgeDetails;
}

module.exports = {
  awardBadgeAndShowScreen,
  checkForMissingBadge,
  checkIfNewBadgeShouldBeAwarded,
  awardBadge
};
