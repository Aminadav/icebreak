const BADGES = require('./badges.json')

// Helper functions
function getCurrentBadge(points) {
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (points >= BADGES[i].pointsRequired) {
      return BADGES[i];
    }
  }
  return null;
}

function getNextBadge(points) {
  for (let i = 0; i < BADGES.length; i++) {
    if (points < BADGES[i].pointsRequired) {
      return BADGES[i];
    }
  }
  return null;
}

function getBadgeImage(badgeId) {
  return `/images/badges/${badgeId}.png`;
}

/**
 * Get all badges that user should have based on points
 * @param {number} points - User's current points
 * @returns {Array} - Array of badges user should have
 */
function getAllDeservedBadges(points) {
  return BADGES.filter(badge => {
    console.log('Compare points', { badgeId: badge.id, pointsRequired: badge.pointsRequired, points },points >= badge.pointsRequired);
    return points >= badge.pointsRequired
});
}

/**
 * Check if user earned a new badge with new points (DEPRECATED)
 * @deprecated Use checkForMissingBadges instead for more robust badge checking
 * @param {number} oldPoints - User's previous points
 * @param {number} newPoints - User's new points
 * @returns {object|null} - Newly earned badge or null
 */
function getNewlyEarnedBadge(oldPoints, newPoints) {
  const oldBadge = getCurrentBadge(oldPoints);
  const newBadge = getCurrentBadge(newPoints);
  
  // If no previous badge and now has one, or different badge
  if ((!oldBadge && newBadge) || (oldBadge && newBadge && oldBadge.id !== newBadge.id)) {
    return newBadge;
  }
  
  return null;
}

module.exports = {
  BADGES,
  getCurrentBadge,
  getNextBadge,
  getBadgeImage,
  getAllDeservedBadges,
  getNewlyEarnedBadge
};
