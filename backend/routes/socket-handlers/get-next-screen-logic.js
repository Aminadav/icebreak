const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const moveUserToGameState = require("./moveUserToGameState");
const { updateMetaDataBinder } = require("../../utils/update-meta-data");
const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const getUserAllMetaData = require("../../utils/getUserAllMetaData");
const {  getScreenRules } = require("./screens_rules");
const { Socket } = require("socket.io");


var DEBUG=false
/**
 * Get the next screen for a user based on their metadata and game rules
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<GAME_STATES>} The next screen state
 */
async function get_next_screen(gameId, userId) {
  const metadata = await getUserAllMetaData(gameId, userId);
  var screenRules= getScreenRules(gameId, userId);

  // Choose rule based on metadata - dynamic matching
  var choosenRule = screenRules.find(rule => {
    if(DEBUG) console.log('Checking rule:', rule);
    // Check if all rule conditions match the metadata
    for (let key in rule) {
      if (key === 'onScreen') continue 
      if (key === 'ruleName') continue
      const metadataValue = metadata[key] !== undefined ? metadata[key] : false;
      const ruleValue = rule[key];
      
      // Handle function comparators
      if (typeof ruleValue === 'function') {
        if (!ruleValue(metadata[key])) {
          if(DEBUG) console.log(`Rule rejected because ${key} function comparison failed`);
          return false;
        }
      } else {
        if(DEBUG) console.log(`Comparing metadata[${key}] (${metadataValue}) !== rule[${key}] (${ruleValue})`);
        if (metadataValue !== ruleValue) {
          if(DEBUG) console.log(`Rule rejected because ${key} doesn't match`);
          return false; // This rule doesn't match
        }
      }
    }
    if(DEBUG) console.log('Rule matches all conditions');
    return true; // All conditions match
  });

  // If no rule matches, use the first rule as default
  if (!choosenRule) {
    choosenRule = screenRules[0];
  }

  if(DEBUG) console.log('Chosen rule:', choosenRule);
  var nextScreen = await choosenRule.onScreen();
  return nextScreen;
}

/**
 * Move user to a specific screen
 * @param {Socket} socket - The socket instance
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @param {string} screenName - The screen name to move to
 */
async function moveUserToScreen(socket, gameId, userId, screenName) {
  /** @type {GAME_STATES} */
  //@ts-ignore
  const gameState = { screenName };
  await moveUserToGameState(socket, gameId, userId, gameState);
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
  push_user_to_next_screen,
  moveUserToScreen
};
