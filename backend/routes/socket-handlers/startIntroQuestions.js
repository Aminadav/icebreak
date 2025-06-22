const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Get about me question from database
 * @returns {Promise<QUESTION>} Question object
 */
async function getAboutMeQuestion() {
  var row = await pool.query('select * from questions limit 1')
  /** @type{QUESTION} */
  var question = row.rows[0];
  return question;
}

/**
 * Register handler for starting intro questions
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerStartIntroQuestionsHandler(socket) {
  socket.on('start-intro-questions', async ({gameId}) => {
    console.log('get event start-intro-questions')
    const userId = await getUserIdFromDevice(socket.deviceId);
    
    var question = await getAboutMeQuestion()
    /** @type {GAME_STATES} */
    var gameState = { screenName: 'QUESTION', isIntro: true, question, introCurrentQuestion: 1, introTotalQuestions: 5 };
    await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2 AND game_id = $3', [gameState, userId, gameId]);
    socket.emit('update-game-state', gameState);
  });
}

module.exports = {
  registerStartIntroQuestionsHandler,
  getAboutMeQuestion
};
