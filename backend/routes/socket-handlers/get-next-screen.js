const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const moveUserToGameState = require("./moveUserToGameState");


module.exports.registerGetNextScreenHandler = async function (socket) {
  socket.on('get_next_screen', async (data) => {
    const { gameId } = data;
    var userId = await getUserIdFromDevice(socket.deviceId);

    /**
     * @type {{
     *    IS_CREATOR:boolean,
     *    SEEN_BEFORE_ASK_ABOUT_YOU:boolean
     *    onScreen:()=>GAME_STATES
     * }[]}
     */
    var rules = [
      {
        IS_CREATOR: true,
        SEEN_BEFORE_ASK_ABOUT_YOU: false,
        onScreen: () => {
          return {
            screenName: 'BEFORE_START_ABOUT_YOU',
          };
        }
      },
      {
        IS_CREATOR: true,
        SEEN_BEFORE_ASK_ABOUT_YOU: true,
        onScreen: () => {
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
    var nextScreen=choosenRule.onScreen();
    moveUserToGameState(socket, gameId, userId, nextScreen)
  });
}