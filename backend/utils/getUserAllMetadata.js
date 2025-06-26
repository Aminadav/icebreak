const pool = require('../config/database');

/**
 * Get all metadata for a specific user and game
 * @param {string|number} gameId - The game ID
 * @param {string|number} userId - The user ID
 * @returns {Promise<import('../GAME_METADATA_INTERFACE').GameMetadata>} - The metadata object, empty object if no metadata found
 */
module.exports=async function getUserAllMetadata(gameId, userId) {
  const metadataQuery = `
    SELECT metadata FROM game_user_state 
    WHERE user_id = $1 AND game_id = $2
  `;

  const result = await pool.query(metadataQuery, [userId, gameId]);
  
  let metadata = {};
  if (result.rows.length > 0 && result.rows[0].metadata) {
    metadata = result.rows[0].metadata;
  }

  return metadata;
}