const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');
const moveUserToGameState = require('./moveUserToGameState');

/**
 * Register handler for camera upload requests
 * @param {import('socket.io').Socket} socket - The socket instance
 */
function registerCameraUploadRequestedHandler(socket) {
  socket.on('camera_upload_requested', async (data) => {
    var {gameId} = data;
    var userId = await getUserIdFromDevice(socket.deviceId);
    moveUserToGameState(socket, gameId, userId, {
      screenName: 'CAMERA',
    });
  });
}

module.exports = {
  registerCameraUploadRequestedHandler
};
