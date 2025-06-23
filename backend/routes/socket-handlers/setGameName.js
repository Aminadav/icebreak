const Device = require('../../models/Device');
const moveUserToGameState = require('./moveUserToGameState');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');

/**
 * @param {import('socket.io').Socket} socket - The Socket.IO socket instance.
 */
module.exports.registerSetGameNameHandler = async function(socket) {
  socket.on('set_game_name', async (data) => {
    try {
      const { gameName, gameId } = data;
      var userID = await getUserIdFromDevice(socket.deviceId);

      console.log({gameName, gameId, userID})
      
      // socket.emit('game_name_saved', {
      //   gameName: socket.pendingGameName,
      //   success: true,
      //   message: 'Game name saved. Please verify your phone number to create the game.'
      // });
    } catch (error) {
      console.error('Error saving game name:', error);
      socket.emit('error', {
        message: 'Failed to save game name',
        error: error.message
      });
    }
  });
};
