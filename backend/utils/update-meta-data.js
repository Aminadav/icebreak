const pool = require("../config/database")

/**
 * Creates a bound function to update metadata for a specific game and user
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {function(string, any): Promise<void>} - A function that takes a key and value to update the metadata
 */
module.exports.updateMetaDataBinder=function(gameId,userId){
  return module.exports.updateMetadata.bind(null, gameId, userId);
}


/**
 * Update metadata for a specific user and game
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} key - The metadata key to update
 * @param {any} value - The value to set for the metadata key
 * @returns {Promise<void>}
 */
module.exports.updateMetadata=async function updateMetadata(gameId, userId, key, value) {
  const metadataQuery = `
    UPDATE game_user_state 
    SET metadata = jsonb_set(metadata, '{${key}}', $1::jsonb)
    WHERE user_id = $2 AND game_id = $3
  `;
  await pool.query(metadataQuery, [JSON.stringify(value), userId, gameId]);
}