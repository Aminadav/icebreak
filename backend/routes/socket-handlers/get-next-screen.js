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
        SEEN_GAME_READY:false,
        onScreen: async  () => {
          await updateMetadata('SEEN_GAME_READY', true);
          return {
            screenName: 'CREATOR_GAME_READY',
          };
        }
      },
      {
        IS_CREATOR: true,
        SEEN_BEFORE_ASK_ABOUT_YOU: false,
        onScreen: async () => {
          await updateMetadata('SEEN_BEFORE_ASK_ABOUT_YOU', true);
          return {
            screenName: 'BEFORE_START_ABOUT_YOU',
          };
        }
      },
      {
        onScreen: async () => {
          return {
            screenName: 'CREATOR_GAME_READY',
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
    console.log('Fetched metadata:', result.rows);
    let metadata = {};

    if (result.rows.length > 0 && result.rows[0].metadata) {
      metadata = result.rows[0].metadata;
    }

    // Choose rule based on metadata - dynamic matching
    var choosenRule = rules.find(rule => {
      console.log('Checking rule:', rule);
      // Check if all rule conditions match the metadata
      for (let key in rule) {
        if (key === 'onScreen') continue; // Skip the onScreen function
        const metadataValue = metadata[key] !== undefined ? metadata[key] : false;
        console.log(`Comparing metadata[${key}] (${metadataValue}) !== rule[${key}] (${rule[key]})`);
        if (metadataValue !== rule[key]) {
          console.log(`Rule rejected because ${key} doesn't match`);
          return false; // This rule doesn't match
        }
      }
      console.log('Rule matches all conditions');
      return true; // All conditions match
    });

    // If no rule matches, use the first rule as default
    if (!choosenRule) {
      choosenRule = rules[0];
    }

    console.log('Chosen rule:', choosenRule);
    var nextScreen=await choosenRule.onScreen();
    await moveUserToGameState(socket, gameId, userId, nextScreen)


   /**
   * A function that two prameters, metadata key, and metadata value.
   * The function will update this metadata in the database for the current user and game. 
   * @param {string} key - The metadata key to update.
   * @param {any} value - The metadata value to set.
   * @returns {Promise<void>}
   */
  async function updateMetadata(key, value) {
    console.log({key,value,userId,gameId})
    const metadataQuery = `
      UPDATE game_user_state 
      SET metadata = jsonb_set(metadata, '{${key}}', $1::jsonb)
      WHERE user_id = $2 AND game_id = $3
    `
    await pool.query(metadataQuery, [JSON.stringify(value), userId, gameId])
  }
  })
}
