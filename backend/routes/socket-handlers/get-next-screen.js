const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const moveUserToGameState = require("./moveUserToGameState");


module.exports.registerGetNextScreenHandler = async function (socket) {
  socket.on('get_next_screen', async (data) => {
    const { gameId } = data;
    var userId = await getUserIdFromDevice(socket.deviceId);

    /**
     * @type {{
     *    IS_CREATOR?:boolean,
     *    SEEN_GAME_READY?:boolean
     *    SEEN_BEFORE_ASK_ABOUT_YOU?:boolean
     *    onScreen:()=>Promise<GAME_STATES>
     * }[]}
     */
    var rules = [
      {
        IS_CREATOR: true,
        onScreen: async  () => {
          await updateMetadata('IS_CREATOR', true);
          return {
            screenName: 'CREATOR_GAME_READY',
          };
        }
      },
      {
        IS_CREATOR: true,
        SEEN_BEFORE_ASK_ABOUT_YOU: false,
        onScreen: () => {
          return {
            screenName: 'BEFORE_START_ABOUT_YOU',
          };
        }
      },
    ]

    // Fetch metadata for current user and game
    const metadataQuery = `
        SELECT metadata FROM game_user_state 
        WHERE user_id = $1 AND game_id = $2
      `;

    const result = await pool.query(metadataQuery, [userId, gameId]);
    let metadata = {};

    if (result.rows.length > 0 && result.rows[0].metadata) {
      metadata = result.rows[0].metadata;
    }

    // Choose rule based on metadata - dynamic matching
    var choosenRule = rules.find(rule => {
      // Check if all rule conditions match the metadata
      for (let key in rule) {
        if (key === 'id') continue; // Skip the id field
        if (metadata[key] !== rule[key]) {
          return false; // This rule doesn't match
        }
      }
      return true; // All conditions match
    });

    // If no rule matches, use the first rule as default
    if (!choosenRule) {
      choosenRule = rules[0];
    }

    console.log('Chosen rule:', choosenRule);
    var nextScreen=await choosenRule.onScreen();
    await moveUserToGameState(socket, gameId, userId, nextScreen)
  });
  /**
   * A function that two prameters, metadata key, and metadata value.
   * The function will update this metadata in the database for the current user and game. 
   * @param {string} key - The metadata key to update.
   * @param {any} value - The metadata value to set.
   * @returns {Promise<void>}
   */
  function updateMetadata(key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        var userId = await getUserIdFromDevice(socket.deviceId);
        const gameId = socket.gameId; // Assuming gameId is stored in socket
        const metadataQuery = `
          UPDATE game_user_state 
          SET metadata = jsonb_set(metadata, '{${key}}', $1::jsonb)
          WHERE user_id = $2 AND game_id = $3
        `;
        await pool.query(metadataQuery, [JSON.stringify(value), userId, gameId]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
