const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const { hasSeenScreen, getAnswersAboutMyselfCount } = require("../../utils/screenHistoryUtils");
const pool = require("../../config/database");

/**
 * Get the next screen for a user based on their metadata and game rules
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<GAME_STATES>} The next screen state
 */
module.exports.get_next_screen = async function get_next_screen(gameId, userId) {
  const { checkForMissingBadge, awardBadge } = require('./badgeHelpers');
  var userVisited =(screenName)=> hasSeenScreen(gameId, userId,screenName);
  var userNotVisited =async (screenName)=> !await userVisited(screenName);
  const missingBadge = await checkForMissingBadge(userId, gameId);
  const gameResult = await pool.query(`select creator_user_id, name from games where game_id = $1`, [gameId]);
  const isCreator = gameResult.rows[0].creator_user_id === userId;
  const gameName = gameResult.rows[0].name;

  // check for missing badges
  if (missingBadge) {
    const awardedBadge = await awardBadge(userId, gameId, missingBadge.id);
    console.log(`🏆 Screen rule awarded badge: ${awardedBadge?.name || missingBadge.id} to user ${userId}`);

    return {
      screenName: 'GOT_BADGE',
      badgeId: missingBadge.id,
    }
  }

  // Check if creator needs to give game name
  if (isCreator && (!gameName || gameName.trim().length === 0)) {
    return {
      screenName: 'GIVE_GAME_NAME',
    };
  }

  // Show welcome screen for non-creators joining a game
  if (!isCreator && await userNotVisited('JOIN_GAME_WELCOME')) {
    return {
      screenName: 'JOIN_GAME_WELCOME',
    };
  }

  // Check for First screen for creator
  if (isCreator && await userNotVisited('CREATOR_GAME_READY')) {
    return {
      screenName: 'CREATOR_GAME_READY',
    };
  }

  // Ask about themself
  if (await userNotVisited('BEFORE_START_ABOUT_YOU')) {
    return {
      screenName: 'BEFORE_START_ABOUT_YOU',
    };
  }

  // Get answers count from database
  const answeredCount = await getAnswersAboutMyselfCount(gameId, userId);

  // Creator finished onboarding questions
  if (isCreator && answeredCount >= 5 && await userNotVisited('CREATOR_FINISHED_ONBOARDING_QUESTIONS')) {
    return {
      screenName: 'CREATOR_FINISHED_ONBOARDING_QUESTIONS',
    };
  }

  // Show a question about the user
  const nextQuestionAboutMySelf = await getNextQuestionAboutYou(gameId, userId)

  if (!nextQuestionAboutMySelf) {
    return {
      screenName: 'NO_MORE_QUESTIONS',
    };
  }

  return {
    screenName: "QUESTION_ABOUT_MYSELF",
    question: nextQuestionAboutMySelf,
    introTotalQuestions: 5,
    introCurrentQuestion: answeredCount + 1,
    isIntro: answeredCount <= 5,
  }
}
