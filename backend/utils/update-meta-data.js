const pool = require("../config/database")

module.exports.updateMetaDataBinder=function(gameId,userId){
   /**
   * A function that two prameters, metadata key, and metadata value.
   * The function will update this metadata in the database for the current user and game. 
   * @param {string} key - The metadata key to update.
   * @param {any} value - The metadata value to set.
   * @returns {Promise<void>}
   */
  return async function updateMetadata(key, value) {
    console.log('update Metadata:',{key,value,userId,gameId})
    const metadataQuery = `
      UPDATE game_user_state 
      SET metadata = jsonb_set(metadata, '{${key}}', $1::jsonb)
      WHERE user_id = $2 AND game_id = $3
    `
    await pool.query(metadataQuery, [JSON.stringify(value), userId, gameId])
  }
}