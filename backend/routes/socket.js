// Import all socket event handlers
const { registerDownloadWhatsappImageHandler } = require('./socket-handlers/downloadWhatsappImage');
const { registerBackgroundWhatsappDownloadHandler } = require('./socket-handlers/backgroundWhatsappDownload');
const { registerUseWhatsappImageHandler } = require('./socket-handlers/useWhatsappImage');
const { registerLoadExistingGalleryImagesHandler } = require('./socket-handlers/loadExistingGalleryImages');
//@ts-ignore
const colors=require('colors');
const { setGlobalIo } = require('../utils/socketGlobal');
const { registerSetGameNameHandler } = require('./socket-handlers/setGameName');
const { registerCreateGameImmediatelyHandler } = require('./socket-handlers/createGameImmediately');
const { registerGetGameDataHandler } = require('./socket-handlers/getGameData');
const { registerUpdateGameNameHandler } = require('./socket-handlers/updateGameName');
const { registerSubmitPhoneNumberHandler } = require('./socket-handlers/submitPhoneNumber');
const { registerVerify2FACodeHandler } = require('./socket-handlers/verify2FACode');
const { registerTrackEventHandler } = require('./socket-handlers/trackEvent');
const { registerTrackActivityHandler } = require('./socket-handlers/trackActivity');
const { registerSaveEmailHandler } = require('./socket-handlers/saveEmail');
const { registerSaveUserNameHandler } = require('./socket-handlers/saveUserName');
const { registerSaveUserGenderHandler } = require('./socket-handlers/saveUserGender');
const { registerUploadPendingImageHandler } = require('./socket-handlers/uploadPendingImage');
const { registerGetOriginalImageHashHandler } = require('./socket-handlers/getOriginalImageHash');
const { registerCameraUploadRequestedHandler } = require('./socket-handlers/cameraUploadRequested');
const { registerGetGameStateHandler } = require('./socket-handlers/getGameState');
const { registerAdminSetQuestionHandler } = require('./socket-handlers/adminSetQuestion');
const { registerAdminDeleteMyGameStatesHandler } = require('./socket-handlers/adminDeleteMyGameStates');
const { registerAdminSetPageHandler } = require('./socket-handlers/adminSetPage');
const { registerGenerateImageGalleryHandler } = require('./socket-handlers/generateImageGallery');
const { registerConfirmImageSelectionHandler } = require('./socket-handlers/confirmImageSelection');
const { registerGetMyPointsHandler } = require('./socket-handlers/getMyPoints');
const { registerSaveOrUpdateQuestionHandler } = require('./socket-handlers/updateQuestion');
const { registerGetQuestionsHandler } = require('./socket-handlers/getQuestions');
const { registerDeleteQuestionHandler } = require('./socket-handlers/deleteQuestion');
const { registerGetNextScreenHandler } = require('./socket-handlers/get-next-screen');
const { registerSubmitAnswerMyselfHandler } = require('./socket-handlers/submit-answer-myself');
const { registerGetUserBadgesHandler } = require('./socket-handlers/getUserBadges');
const {  registerGetUserGameDataHandler } = require('./socket-handlers/getUserGameData');
const { getDataForBadgePage } = require('./socket-handlers/getDataForBadgePage');
const { registerLogoutHandler } = require('./socket-handlers/logout');
const { registerGetGameInfoHandler } = require('./socket-handlers/getGameInfo');
// Import utilities
const { getUserIdFromDevice, sendUserDataToClient } = require('./socket-handlers/utils');
const {registerGetUserDataHandler} = require('./socket-handlers/registerGetUserData');
const { registerDebugAddPlayersHandler } = require('./socket-handlers/debugAddPlayers');
const { registerDebugSpeedCreatorSignupHandler } = require('./socket-handlers/debugSpeedCreatorSignup');
const { registerDebugGetUserMetadataHandler } = require('./socket-handlers/debugGetUserMetadata');
const { getGameUserRoom } = require('../socket-room');
/**
 * Setup socket event handlers for the application.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
function setupSocketHandlers(io) {
  // Set global io instance for use in other modules
  setGlobalIo(io);
  
  // Add middleware to extract device ID and attach to socket
  io.use((socket, next) => {
    const deviceId = socket.handshake.query.deviceId;
    if (deviceId && typeof deviceId === 'string') {
      socket.deviceId = deviceId;
    } else {
      console.warn('⚠️ No device ID found in connection query parameters');
    }
    next();
  });

  io.on('connection', async (socket) => {
    socket.prependAnyOutgoing((eventName, ...args) => {
      console.log(colors.green('>> ' + eventName + ': ' + JSON.stringify(args)));
    })
    
    socket.prependAny(async (eventName, ...args) => {
      var userId = await getUserIdFromDevice(socket.deviceId);
      console.log(colors.cyan('<< ' + eventName + ': ' +  JSON.stringify(args)));
      
      // Auto-join user to game room if gameId is provided in the event data
      if (args && args[0] && args[0].gameId) {
        const gameId = args[0].gameId;
        socket.join(gameId);
        console.log(colors.yellow(`Socket ${socket.id} joined room: ${getGameUserRoom(gameId, userId)}`));
        socket.join(getGameUserRoom(gameId, userId));
      }
    })

    // Register all socket event handlers
    registerSetGameNameHandler(socket);
    registerCreateGameImmediatelyHandler(socket);
    registerGetGameDataHandler(socket);
    registerUpdateGameNameHandler(socket);
    registerSubmitPhoneNumberHandler(socket);
    registerVerify2FACodeHandler(socket);
    registerTrackEventHandler(socket);
    registerTrackActivityHandler(socket);
    registerSaveEmailHandler(socket);
    registerSaveUserNameHandler(socket);
    registerSaveUserGenderHandler(socket);
    registerUploadPendingImageHandler(socket);
    registerGetOriginalImageHashHandler(socket);
    registerCameraUploadRequestedHandler(socket);
    registerGetGameStateHandler(socket);
    registerAdminSetQuestionHandler(socket);
    registerAdminDeleteMyGameStatesHandler(socket);
    registerAdminSetPageHandler(socket);
    registerDownloadWhatsappImageHandler(socket);
    registerBackgroundWhatsappDownloadHandler(socket);
    registerUseWhatsappImageHandler(socket);
    registerLoadExistingGalleryImagesHandler(socket);
    registerGenerateImageGalleryHandler(socket);
    registerConfirmImageSelectionHandler(socket);
    registerGetMyPointsHandler(socket);
    registerSaveOrUpdateQuestionHandler(socket);
    registerGetQuestionsHandler(socket);
    registerDeleteQuestionHandler(socket);
    registerGetNextScreenHandler(socket);
    registerSubmitAnswerMyselfHandler(socket);
    registerGetUserBadgesHandler(socket);
    registerGetUserGameDataHandler(socket);
    registerLogoutHandler(socket);
    registerGetUserDataHandler(socket);
    registerGetGameInfoHandler(socket);
    registerDebugAddPlayersHandler(socket);
    registerDebugSpeedCreatorSignupHandler(socket);
    registerDebugGetUserMetadataHandler(socket);
    
    // Register the getDataForBadgePage handler
    socket.on('get-data-for-badge-page', (data) => getDataForBadgePage(socket, data));
  });
}

module.exports = setupSocketHandlers;
