const Device = require('../../models/Device');
const moveUserToGameState = require('./moveUserToGameState');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');

async function handleSetGameName(socket, data) {
  try {
    const { gameName,gameId } = data;
    var userID=await getUserIdFromDevice(socket.deviceId);

    console.log({gameName,gameId,userID})
    
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
}

module.exports = handleSetGameName;
