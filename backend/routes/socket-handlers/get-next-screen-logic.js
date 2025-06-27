const moveUserToGameState = require("./moveUserToGameState");
const getUserAllMetadata = require("../../utils/getUserAllMetadata");
const { updateMetaDataBinder } = require("../../utils/update-meta-data");
const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const pool = require("../../config/database");

var DEBUG = true
/**
 * Get the next screen for a user based on their metadata and game rules
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<GAME_STATES>} The next screen state
 */
module.exports.get_next_screen = async function get_next_screen(gameId, userId) {
  const metadata = await getUserAllMetadata(gameId, userId);
  const updateMetadata = updateMetaDataBinder(gameId, userId);
  const { checkForMissingBadge, awardBadge } = require('./badgeHelpers');
  const missingBadge = await checkForMissingBadge(userId, gameId);
  const isCreator=(await pool.query(`select creator_user_id from games where game_id = $1`, [gameId])).rows[0].creator_user_id === userId;

  // check for missing badges
  if (missingBadge) {
    const awardedBadge = await awardBadge(userId, gameId, missingBadge.id);
    console.log(`🏆 Screen rule awarded badge: ${awardedBadge?.name || missingBadge.id} to user ${userId}`);

    return {
      screenName: 'GOT_BADGE',
      badgeId: missingBadge.id,
    }
  }

  // Check for First screen for creator
  if (isCreator && !metadata.SEEN_GAME_READY) {
    await updateMetadata('SEEN_GAME_READY', true);
    return {
      screenName: 'CREATOR_GAME_READY',
    };
  }

  // Ask about themself
  if (!metadata.SEEN_BEFORE_ASK_ABOUT_YOU) {
    await updateMetadata('SEEN_BEFORE_ASK_ABOUT_YOU', true);
    return {
      screenName: 'BEFORE_START_ABOUT_YOU',
    };
  }

  // Creator finished onboarding questions
  if (isCreator && metadata.ANSWER_ABOUT_MYSELF >= 5 && !metadata.SEEN_CREATOR_FINISHED_ONBOARDING) {
    await updateMetadata('SEEN_CREATOR_FINISHED_ONBOARDING', true);
    return {
      screenName: 'CREATOR_FINISHED_ONBOARDING_QUESTIONS',
    };
  }

  // Show a question about the user
  const nextQuestionAboutMySelf = await getNextQuestionAboutYou(gameId, userId)
  const answeredCount = metadata.ANSWER_ABOUT_MYSELF || 0

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
