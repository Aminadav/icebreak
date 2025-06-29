const { getUserIdFromDevice } = require("./utils");
const pool = require('../../config/database');
const moveUserToGameState = require("./moveUserToGameState");
const { getGlobalIo } = require("../../utils/socketGlobal");
const { getGameDataWithCounts } = require("./getGameData");
const { addPointsWithBadgeCheckAndEmit } = require("../../utils/points-helper");

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
 * Handles the 'submit-answer-others' event for submitting answers about other users
 * @param {Object} socket - The socket instance
 */
module.exports.registerSubmitAnswerOthersHandler = async function (socket) {
  socket.on('submit-answer-others', async (data) => {
    const { questionId, answer, gameId, aboutUserId } = data;
    const userId = await getUserIdFromDevice(socket.deviceId);
    
    // Insert the answer into the database
    await pool.query(`
      INSERT INTO user_answers (
        gameid,           -- $1: gameId
        questionid,       -- $2: questionId  
        answer,           -- $3: answer
        answering_user_id, -- $4: userId (who answered)
        about_user_id     -- $5: aboutUserId (who the question is about)
      ) VALUES ($1, $2, $3, $4, $5)
    `, [gameId, questionId, answer, userId, aboutUserId]);
    
    // Get the correct answer (what the about_user actually answered about themselves)
    const correctAnswerResult = await pool.query(`
      SELECT answer 
      FROM user_answers 
      WHERE gameid = $1 AND questionid = $2 AND answering_user_id = $3 AND is_about_me = true
    `, [gameId, questionId, aboutUserId]);
    
    const correctAnswer = correctAnswerResult.rows[0]?.answer;
    const isCorrect = correctAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    // Award points based on correctness
    const pointsToAward = isCorrect ? 10 : 2;
    const correctStatus = isCorrect ? "YOU_CORRECT" : "YOU_INCORRECT";
    
    // Get question text
    const questionResult = await pool.query(`
      SELECT question_text 
      FROM questions 
      WHERE question_id = $1
    `, [questionId]);
    
    const questionText = questionResult.rows[0]?.question_text || '';
    
    // Get all guesses for this question about this user (excluding their own answer)
    const answersResult = await pool.query(`
      SELECT answer, COUNT(*) as count
      FROM user_answers 
      WHERE gameid = $1 AND questionid = $2 AND about_user_id = $3 AND is_about_me = false
      GROUP BY answer
      ORDER BY count DESC, answer
    `, [gameId, questionId, aboutUserId]);
    
    // Format answers for the feedback screen
    const answers = answersResult.rows.map(row => ({
      text: row.answer,
      isCorrect: correctAnswer && row.answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim(),
      howManyUsers: parseInt(row.count)
    }));
    
    // Get about_user info
    const aboutUserResult = await pool.query(`
      SELECT user_id, name, image 
      FROM users 
      WHERE user_id = $1
    `, [aboutUserId]);
    
    const aboutUser = aboutUserResult.rows[0];
    
    const pointsResult = await addPointsWithBadgeCheckAndEmit(userId, gameId, pointsToAward, socket);

    // Navigate to ANSWER_FEEDBACK screen
    await moveUserToGameState(socket, gameId, userId, {
      screenName: 'ANSWER_FEEDBACK',
      mainMessage: isCorrect ? 'יפה מאוד' : 'טעות',
      question: questionText,
      pointsReceived: pointsToAward,
      correctStatus: correctStatus,
      answers: answers,
      about_user: {
        user_id: aboutUser.user_id,
        name: aboutUser.name,
        image: aboutUser.image
      }
    });

    // Emit updated game data to all users in the game
    await emitUpdatedGameData(gameId);
  });
};
