const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const { moveUserToScreen } = require("./get-next-screen-logic");
const { updateMetaDataBinder, updateMetadata } = require("../../utils/update-meta-data");
const { addPointsAndEmit } = require("../../utils/points-helper");
const moveUserToGameState = require("./moveUserToGameState");
const getUserAllMetaData = require("../../utils/getUserAllMetaData");

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
    
    // const answerCount = parseInt(currentAnswersResult.rows[0].count);
    var metadata=await getUserAllMetaData(gameId, userId);
    console.log('Current metadata:', metadata);
    await updateMetadata(gameId,userId, 'ANSWER_ABOUT_MYSELF', (metadata.ANSWER_ABOUT_MYSELF||0) + 1);
    
    // Fetch updated metadata to verify the change
    var updatedMetadata = await getUserAllMetaData(gameId, userId);
    console.log('After update metadata:', updatedMetadata);
    
    // Add 10 points for answering about myself
    await addPointsAndEmit(userId, gameId, 10, socket);
    
    var textArray=[
      'כל הכבוד!',
      'מצויין!',
      'אליפות!',
      'תודה רבה!',
      'אין עליך!',
    ]
    var text=textArray.sort(()=>Math.random() - 0.5)[0]
    await moveUserToGameState(socket, gameId, userId, {
      screenName: 'GOT_POINTS',
      points: 10,
      text
    });
  });
};
