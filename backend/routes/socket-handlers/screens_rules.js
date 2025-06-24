const { getNextQuestionAboutYou } = require("../../utils/getNextQuestionAboutYou");
const getUserAllMetaData = require("../../utils/getUserAllMetaData");
const { increaseUserStateMetadata } = require("../../utils/incrementUserStateMetadata");
const { lessThanOrEqualTo } = require("../../utils/screen_logic_utils");
const { updateMetaDataBinder } = require("../../utils/update-meta-data");

module.exports.getScreenRules=function getScreenRules(gameId,userId) {
  const updateMetadata = updateMetaDataBinder(gameId, userId);

  /**
   * @type {{
   *    ruleName?:string,
   *    IS_CREATOR?:any,
   *    SEEN_GAME_READY?:any
   *    SEEN_BEFORE_ASK_ABOUT_YOU?:any
   *    ANSWER_ABOUT_MYSELF?:any,
   *    condition?:()=>Promise<boolean>,
   *    onScreen:()=>Promise<GAME_STATES>
   * }[]}
   */
  var screenRules = [
    {
      ruleName: 'Check for missing badges',
      condition: async () => {
        const { checkForMissingBadge } = require('./badgeHelpers');
        
        const missingBadge = await checkForMissingBadge(userId, gameId);
        console.log({missingBadge})
        return !!missingBadge
      },
      onScreen: async () => {
        const { checkForMissingBadge, awardBadge } = require('./badgeHelpers');
        const { getUserTotalPoints } = require('../../utils/points-helper');
        
        const missingBadge = await checkForMissingBadge(userId, gameId);
        
        if (missingBadge) {
          // Award the badge
          const awardedBadge = await awardBadge(userId, gameId, missingBadge.id);
          console.log(`🏆 Screen rule awarded badge: ${awardedBadge?.name || missingBadge.id} to user ${userId}`);
          
          return {
            screenName: 'GOT_BADGE',
            badgeId: missingBadge.id,
            friendsInLevel: [] // TODO: Implement friends in level logic
          };
        }
        
        // This shouldn't happen since condition checked for missing badge
        throw new Error('Badge rule triggered but no missing badge found');
      }
    },
    {
      ruleName:'First screen for creator',
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
      ruleName:'Ask about you',
      SEEN_BEFORE_ASK_ABOUT_YOU:false,
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
        const metadata = await getUserAllMetaData(gameId, userId);
        var answeredCount = metadata.ANSWER_ABOUT_MYSELF || 0
        /** @type {GAME_STATES} */
        var nextScreen = {
          screenName: "QUESTION_ABOUT_MYSELF",
          question: nextQuestionAboutMySelf,
          introTotalQuestions: 5,
          introCurrentQuestion: answeredCount + 1,
          isIntro: true
        }
        return nextScreen
      }
    },
    {
      ruleName:'I DONT KNOW WHAT TO SHOW',
      onScreen: async () => {
        return {
          screenName: 'EMPTY_GAME_STATE',
        };
      }
    },
  ]
  return screenRules;
}