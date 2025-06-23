const Game = require('../../models/Game');
const moveUserToGameState = require('./moveUserToGameState');
const { getUserIdFromDevice } = require('./utils');

module.exports.registerUpdateGameNameHandler = async function(socket) {
  socket.on('update_game_name', async (data) => {
    var userId = await getUserIdFromDevice(socket.deviceId);
    try {
      const { gameId, gameName } = data;
      
      if (!gameId || !gameName) {
        socket.emit('error', { 
          message: 'Game ID and game name are required',
          code: 'MISSING_PARAMETERS'
        });
        return;
      }

      if (gameName.trim().length === 0) {
        socket.emit('error', { 
          message: 'Game name cannot be empty',
          code: 'INVALID_NAME'
        });
        return;
      }

      // Update the game name
      const success = await Game.updateGameName(gameId, gameName.trim());
      
      moveUserToGameState(socket, gameId, userId, { screenName: 'ASK_USER_PHONE' });
    } catch (error) {
      console.error('❌ Error in handleUpdateGameName:', error);
      socket.emit('error', { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });
};
