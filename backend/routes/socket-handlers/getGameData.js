const Game = require('../../models/Game');
const pool = require('../../config/database');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');

// Reusable function to get game data with answer counts
async function getGameDataWithCounts(gameId) {
  // Get game data
  const game = await Game.getGame(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }

  // Get total answered questions counts for the entire game
  // Count all questions answered about themselves by all users in the game
  const aboutThemselfResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM user_answers 
    WHERE gameid = $1 AND is_about_me = true
  `, [gameId]);
  const answeredQuestionsAboutThemself = parseInt(aboutThemselfResult.rows[0]?.count || 0);

  // Count all questions answered about others by all users in the game
  const aboutOthersResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM user_answers 
    WHERE gameid = $1 AND is_about_me = false
  `, [gameId]);
  const answeredQuestionsAboutOthers = parseInt(aboutOthersResult.rows[0]?.count || 0);
  
  return {
    success: true,
    gameId: game.game_id,
    gameName: game.name,
    status: game.status,
    createdAt: game.created_at,
    creatorUserId: game.creator_user_id,
    answeredQuestionsAboutThemself,
    answeredQuestionsAboutOthers
  };
}

module.exports.getGameDataWithCounts = getGameDataWithCounts;

module.exports.registerGetGameDataHandler = async function(socket) {
  socket.on('get_game_data', async (data) => {
    try {
      const { gameId } = data;
      
      validateDeviceRegistration(socket);
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!gameId) {
        throw new Error('Game ID is required');
      }
      
      // console.log(`🎮 Getting game data for: ${gameId}`);
      
      const gameData = await getGameDataWithCounts(gameId);
      
      // Emit success with game data using the same event name as updates
      socket.emit('game_data_updated', gameData);
      
      // console.log(`✅ Game data sent for: ${gameId}`);
      
    } catch (error) {
      console.error('Error getting game data:', error);
      socket.emit('error', {
        message: 'Failed to get game data',
        error: error.message,
        context: 'get_game_data'
      });
    }
  });
};
