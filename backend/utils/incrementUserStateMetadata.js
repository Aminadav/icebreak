const pool = require("../config/database");
const getUserAllMetadata = require("./getUserAllMetaData");

/**
 * Increment a metadata value by a specific amount for a user in a game
 * @param {string|number} gameId - The game ID
 * @param {string|number} userId - The user ID
 * @param {string} key - The metadata key to increment
 * @param {number} amount - The amount to increment by (default: 1)
 * @returns {Promise<number>} - The new value after increment
 */
async function increaseUserStateMetadata(gameId, userId, key, amount = 1) {
  // Get current metadata
  const metadata = await getUserAllMetadata(gameId, userId);
  
  // Get current value (default to 0 if doesn't exist)
  const currentValue = metadata[key] || 0;
  const newValue = currentValue + amount;
  
  // Update the metadata
  const metadataQuery = `
    UPDATE game_user_state 
    SET metadata = jsonb_set(metadata, '{${key}}', $1::jsonb)
    WHERE user_id = $2 AND game_id = $3
  `;
  
  await pool.query(metadataQuery, [JSON.stringify(newValue), userId, gameId]);
  
  return newValue;
}

module.exports = {
  increaseUserStateMetadata
};
