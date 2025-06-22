const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

/**
 * Register handler for admin set question
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerAdminSetQuestionHandler(socket) {
  socket.on('admin-set-question', async (question) => {
    console.log('get event admin-set-question')
    const userId = await getUserIdFromDevice(socket.deviceId);
    
    /** @type {GAME_STATES} */
    var gameState = { screenName: 'QUESTION', isIntro: true, question, introCurrentQuestion: 1, introTotalQuestions: 5 };
    await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2', [gameState, userId]);
  });
}

module.exports = {
  registerAdminSetQuestionHandler
};
