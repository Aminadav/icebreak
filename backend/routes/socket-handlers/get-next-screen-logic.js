const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const { getNextQuestionAboutOthers, getAnswersAboutOthersCount } = require("../../utils/getNextQuestionAboutOthers");
const { getAnswersAboutMyselfCount } = require("../../utils/screenHistoryUtils");
const { userVisited, userNotVisited, userClicked, userNotClicked } = require("../../utils/userActivityUtils");
const pool = require("../../config/database");

/**
 * Get the next screen for a user based on their metadata and game rules
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<GAME_STATES>} The next screen state
 */
module.exports.get_next_screen = async function get_next_screen(gameId, userId) {
  const { checkForMissingBadge, awardBadge } = require('./badgeHelpers');
  // Create bound helper functions for this specific game and user
  const userVisitedScreen = async (screenName) => await userVisited(gameId, userId, screenName);
  const userNotVisitedScreen = async (screenName) => await userNotVisited(gameId, userId, screenName);
  const userClickedButton = async (buttonName) => await userClicked(gameId, userId, buttonName);
  const userNotClickedButton = async (buttonName) => await userNotClicked(gameId, userId, buttonName);
  const missingBadge = await checkForMissingBadge(userId, gameId);
  const gameResult = await pool.query(`select creator_user_id, name from games where game_id = $1`, [gameId]);
  const isCreator = gameResult.rows[0].creator_user_id === userId;
  const gameName = gameResult.rows[0].name;

  // Get user verification status
  const userResult = await pool.query(`select phone_number, phone_verified, name, email, gender, has_image, pending_image from users where user_id = $1`, [userId]);
  const user = userResult.rows[0];
  const hasPhoneNumber = user.phone_number && user.phone_number.trim().length > 0;
  const isPhoneVerified = user.phone_verified;
  const hasName = user.name && user.name.trim().length > 0;
  const hasEmail = user.email && user.email.trim().length > 0;
  const hasGender = user.gender && user.gender.trim().length > 0;
  const hasImage = user.has_image;
  const hasPendingImage = user.pending_image && user.pending_image.trim().length > 0;
  const answersAboutOthersCount = await getAnswersAboutOthersCount(gameId, userId);

  // console.log({
  //   gameId,
  //   userId,
  //   isCreator,
  //   gameName,
  //   hasPhoneNumber,
  //   isPhoneVerified,
  //   hasName,
  //   hasEmail,
  //   hasGender,
  //   hasImage,
  //   hasPendingImage,
  //   missingBadge: missingBadge ? missingBadge.id : null
  // })

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

  // Show welcome screen for non-creators joining a game until they click continue
  if (!isCreator && await userNotClickedButton('join_game_welcome_continue')) {
    return {
      screenName: 'JOIN_GAME_WELCOME',
    };
  }

  // Check if user needs to enter phone number
  if (!hasPhoneNumber) {
    return {
      screenName: 'ASK_USER_PHONE',
    };
  }

  // Check if user needs to verify phone number
  if (hasPhoneNumber && !isPhoneVerified) {
    return {
      screenName: 'ASK_USER_VERIFICATION_CODE',
    };
  }

  // For non-creators: After 2FA, show 2 questions about others before profile setup
  if (!isCreator && isPhoneVerified) {

    if (answersAboutOthersCount < 2) {
      const nextQuestionAboutOthers = await getNextQuestionAboutOthers(gameId, userId);
      if (nextQuestionAboutOthers) {
        // Check if we've already shown 2 initial questions about others

        return {
          screenName: 'QUESTION_ABOUT_OTHER',
          question: nextQuestionAboutOthers,
          about_user: {
            user_id: nextQuestionAboutOthers.about_user_id,
            name: nextQuestionAboutOthers.about_user_name,
            image: nextQuestionAboutOthers.about_user_image || '',
          },
        };
      }
    }
  }

  // Check if user needs to enter email
  if (!hasEmail) {
    return {
      screenName: 'ASK_FOR_EMAIL',
    };
  }

  // Check if user needs to enter name
  if (!hasName) {
    return {
      screenName: 'ASK_PLAYER_NAME',
    };
  }

  // Check if user needs to select gender
  if (!hasGender) {
    return {
      screenName: 'ASK_PLAYER_GENDER',
    };
  }

  // Check if user needs to upload image
  if (!hasImage && !hasPendingImage) {
    return {
      screenName: 'ASK_FOR_PICTURE',
    };
  }

  // Check if user has pending image but hasn't selected from gallery
  if (hasPendingImage && !hasImage) {
    return {
      screenName: 'GALLERY',
    };
  }

  // Check for First screen for creator
  if (isCreator && await userNotVisitedScreen('CREATOR_GAME_READY')) {
    return {
      screenName: 'CREATOR_GAME_READY',
    };
  }

  // Ask about themself
  if (isCreator && await userNotVisitedScreen('BEFORE_START_ABOUT_YOU')) {
    return {
      screenName: 'BEFORE_START_ABOUT_YOU',
    };
  }

  // Get answers count from database
  const answeredCount = await getAnswersAboutMyselfCount(gameId, userId);

  // Creator finished onboarding questions
  if (isCreator && answeredCount >= 5 && await userNotVisitedScreen('CREATOR_FINISHED_ONBOARDING_QUESTIONS')) {
    return {
      screenName: 'CREATOR_FINISHED_ONBOARDING_QUESTIONS',
    };
  }

  // Mixed question algorithm: Try to alternate between self and others
  const nextQuestionAboutMySelf = await getNextQuestionAboutYou(gameId, userId);
  const nextQuestionAboutOthers = await getNextQuestionAboutOthers(gameId, userId);

  // If no questions available at all
  if (!nextQuestionAboutMySelf && !nextQuestionAboutOthers) {
    return {
      screenName: 'NO_MORE_QUESTIONS',
    };
  }

  // Determine which type of question to show based on last question answered
  let shouldAskAboutOthers;

  // If only one type available, use it
  if (!nextQuestionAboutMySelf && nextQuestionAboutOthers) {
    shouldAskAboutOthers = true;
  } else if (nextQuestionAboutMySelf && !nextQuestionAboutOthers) {
    shouldAskAboutOthers = false;
  } else {
    // Both types available - check what was the last question answered
    const lastAnswerResult = await pool.query(`
      SELECT is_about_me 
      FROM user_answers 
      WHERE gameid = $1 AND answering_user_id = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [gameId, userId]);

    if (lastAnswerResult.rows.length > 0) {
      const lastWasAboutMe = lastAnswerResult.rows[0].is_about_me;
      // Alternate: if last was about me, ask about others; if last was about others, ask about me
      shouldAskAboutOthers = lastWasAboutMe;
    } else {
      // No previous answers, start with others
      shouldAskAboutOthers = true;
    }
  }

  if (shouldAskAboutOthers && nextQuestionAboutOthers) {
    return {
      screenName: 'QUESTION_ABOUT_OTHER',
      question: nextQuestionAboutOthers,
      about_user: {
        user_id: nextQuestionAboutOthers.about_user_id,
        name: nextQuestionAboutOthers.about_user_name,
        image: nextQuestionAboutOthers.about_user_image || '',
      },
    };
  }

  // Default to question about self
  return {
    screenName: "QUESTION_ABOUT_MYSELF",
    question: nextQuestionAboutMySelf,
    introTotalQuestions: 5,
    introCurrentQuestion: answeredCount + 1,
    isIntro: isCreator && answeredCount <= 5,
  }
}
