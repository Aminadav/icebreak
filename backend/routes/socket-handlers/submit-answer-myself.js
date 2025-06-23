const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const { push_user_to_next_screen } = require("./get-next-screen-logic");
const { updateMetaDataBinder } = require("../../utils/update-meta-data");

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
    
    // Update metadata to track number of answers about myself
    const updateMetadata = updateMetaDataBinder(gameId, userId);
    
    // Get current count of answers about myself
    const currentAnswersResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_answers 
      WHERE gameid = $1 AND answering_user_id = $2 AND is_about_me = true
      -- gameId=$1, userId=$2
    `, [gameId, userId]);
    
    const answerCount = parseInt(currentAnswersResult.rows[0].count);
    await updateMetadata('ANSWER_ABOUT_MYSELF', answerCount);
    
    // Push user to next screen
    await push_user_to_next_screen(socket, gameId, userId);
  });
};
