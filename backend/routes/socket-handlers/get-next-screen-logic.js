const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const moveUserToGameState = require("./moveUserToGameState");
const { updateMetaDataBinder } = require("../../utils/update-meta-data");
const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const getUserAllMetaData = require("../../utils/getUserAllMetaData");

// Helper functions for metadata comparison
function lessThanOrEqualTo(threshold) {
  return (value) => {
    if (value === undefined) return true;
    return value <= threshold;
  };
}

function moreThanOrEqualTo(threshold) {
  return (value) => {
    if (value === undefined) return true;
    return value >= threshold;
  };
}

/**
 * Get the next screen for a user based on their metadata and game rules
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<GAME_STATES>} The next screen state
 */
async function get_next_screen(gameId, userId) {
  const updateMetadata = updateMetaDataBinder(gameId, userId);

  /**
   * @type {{
   *    IS_CREATOR?:any,
   *    SEEN_GAME_READY?:any
   *    SEEN_BEFORE_ASK_ABOUT_YOU?:any
   *    ANSWER_ABOUT_MYSELF?:any,
   *    onScreen:()=>Promise<GAME_STATES>
   * }[]}
   */
  var rules = [
    {
      IS_CREATOR: true,
      SEEN_GAME_READY: false,
      onScreen: async () => {
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
      /** Show a question */
      ANSWER_ABOUT_MYSELF: lessThanOrEqualTo(5),
      onScreen: async () => {
        var nextQuestionAboutMySelf = await getNextQuestionAboutYou(gameId, userId)
        /** @type {GAME_STATES} */
        var nextScreen = {
          screenName: "QUESTION_ABOUT_MYSELF",
          question: nextQuestionAboutMySelf,
        }
        return nextScreen
      }
    },
  ]

  const metadata = await getUserAllMetaData(userId, gameId);

  // Choose rule based on metadata - dynamic matching
  var choosenRule = rules.find(rule => {
    console.log('Checking rule:', rule);
    // Check if all rule conditions match the metadata
    for (let key in rule) {
      if (key === 'onScreen') continue; // Skip the onScreen function
      const metadataValue = metadata[key] !== undefined ? metadata[key] : false;
      const ruleValue = rule[key];
      
      // Handle function comparators
      if (typeof ruleValue === 'function') {
        if (!ruleValue(metadata[key])) {
          console.log(`Rule rejected because ${key} function comparison failed`);
          return false;
        }
      } else {
        console.log(`Comparing metadata[${key}] (${metadataValue}) !== rule[${key}] (${ruleValue})`);
        if (metadataValue !== ruleValue) {
          console.log(`Rule rejected because ${key} doesn't match`);
          return false; // This rule doesn't match
        }
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
  var nextScreen = await choosenRule.onScreen();
  return nextScreen;
}

/**
 * Push user to the next screen by getting the next screen and updating their state
 * @param {Socket} socket - The socket instance
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 */
async function push_user_to_next_screen(socket, gameId, userId) {
  const nextScreen = await get_next_screen(gameId, userId);
  await moveUserToGameState(socket, gameId, userId, nextScreen);
}

module.exports = {
  get_next_screen,
  push_user_to_next_screen
};
