const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const { moveUserToScreen } = require("./get-next-screen-logic");
const { updateMetaDataBinder, updateMetadata } = require("../../utils/update-meta-data");
const { addPointsWithBadgeCheckAndEmit } = require("../../utils/points-helper");
const moveUserToGameState = require("./moveUserToGameState");
const getUserAllMetadata = require("../../utils/getUserAllMetadata");
const { increaseUserStateMetadata } = require("../../utils/incrementUserStateMetadata");
const { getGlobalIo } = require("../../utils/socketGlobal");
const { getGameDataWithCounts } = require("./getGameData");

/**
 * Helper function to emit updated game data to all users in the game
 */
async function emitUpdatedGameData(gameId) {
  try {
    const io = getGlobalIo();
    const gameData = await getGameDataWithCounts(gameId);
    
    // Emit to all users in the game room
    io.to(gameId).emit('game_data_updated', gameData);
    
    console.log(`📊 Emitted updated game data to all users in game ${gameId}: themself=${gameData.answeredQuestionsAboutThemself}, others=${gameData.answeredQuestionsAboutOthers}`);
  } catch (error) {
    console.error('Error emitting updated game data:', error);
  }
}

/**
 * Handles the 'submit-answer-myself' event for submitting answers about oneself
 * @param {Object} socket - The socket instance
 */
module.exports.registerSubmitAnswerMyselfHandler = async function (socket) {
  socket.on('submit-answer-myself', async (data) => {
    const { questionId, answer, gameId } = data;
    const userId = await getUserIdFromDevice(socket.deviceId);
    
    // Insert the answer into the database
    await pool.query(`
      INSERT INTO user_answers (
        gameid,           -- $1: gameId
        questionid,       -- $2: questionId  
        answer,           -- $3: answer
        answering_user_id, -- $4: userId
        about_user_id     -- $5: userId
      ) VALUES ($1, $2, $3, $4, $5)
    `, [gameId, questionId, answer, userId, userId]);
    
    
    // Get current count of answers about myself
    const currentAnswersResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_answers 
      WHERE gameid = $1 AND answering_user_id = $2 AND is_about_me = true
      -- gameId=$1, userId=$2
    `, [gameId, userId]);
    
    await increaseUserStateMetadata(gameId, userId, 'ANSWER_ABOUT_MYSELF', 1);
    
    // Fetch updated metadata to verify the change
    var updatedMetadata = await getUserAllMetadata(gameId, userId);
    console.log('After update metadata:', updatedMetadata);
    
    // Add 10 points for answering about myself
    var metadata=await getUserAllMetadata(gameId,userId)
    var answeredQuestionsCount = metadata['ANSWER_ABOUT_MYSELF'] || 0;
    if(answeredQuestionsCount == 5) {
      var pointsToAward=50
      var message = 'ענית על 5 שאלות! קיבלת בונוס';
    } else {
      pointsToAward=10
      message=[
        'כל הכבוד!',
        'מצויין!',
        'אליפות!',
        'תודה רבה!',
        'אין עליך!',
      ].sort(()=>Math.random() - 0.5)[0]
    }
    

    const pointsResult = await addPointsWithBadgeCheckAndEmit(userId, gameId, pointsToAward, socket);
    const { totalPoints, earnedBadge } = pointsResult;
    
    // Always show GOT_POINTS first - the screen flow will check for badges when user continues
    await moveUserToGameState(socket, gameId, userId, {
      screenName: 'GOT_POINTS',
      points: pointsToAward,
      text:message
    });

    // Emit updated game data to all users in the game
    await emitUpdatedGameData(gameId);
  });
};
