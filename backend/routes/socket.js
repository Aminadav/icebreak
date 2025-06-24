// Import all socket event handlers
const registerDeviceHandler = require('./socket-handlers/registerDevice');
const { registerDownloadWhatsappImageHandler } = require('./socket-handlers/downloadWhatsappImage');
const { registerBackgroundWhatsappDownloadHandler } = require('./socket-handlers/backgroundWhatsappDownload');
const { registerUseWhatsappImageHandler } = require('./socket-handlers/useWhatsappImage');
const { registerLoadExistingGalleryImagesHandler } = require('./socket-handlers/loadExistingGalleryImages');
//@ts-ignore
const colors=require('colors');
const { registerRegisterDeviceHandler } = require('./socket-handlers/registerDevice');
const { registerStartGameCreationHandler } = require('./socket-handlers/startGameCreation');
const { registerSetGameNameHandler } = require('./socket-handlers/setGameName');
const { registerCreateGameImmediatelyHandler } = require('./socket-handlers/createGameImmediately');
const { registerGetGameDataHandler } = require('./socket-handlers/getGameData');
const { registerUpdateGameNameHandler } = require('./socket-handlers/updateGameName');
const { registerSubmitPhoneNumberHandler } = require('./socket-handlers/submitPhoneNumber');
const { registerVerify2FACodeHandler } = require('./socket-handlers/verify2FACode');
const { registerPingHandler } = require('./socket-handlers/ping');
const { registerTrackEventHandler } = require('./socket-handlers/trackEvent');
const { registerSaveEmailHandler } = require('./socket-handlers/saveEmail');
const { registerSaveUserNameHandler } = require('./socket-handlers/saveUserName');
const { registerSaveUserGenderHandler } = require('./socket-handlers/saveUserGender');
const { registerUploadPendingImageHandler } = require('./socket-handlers/uploadPendingImage');
const { registerGetOriginalImageHashHandler } = require('./socket-handlers/getOriginalImageHash');
const { registerCameraUploadRequestedHandler } = require('./socket-handlers/cameraUploadRequested');
const { registerGetGameStateHandler } = require('./socket-handlers/getGameState');
const { registerStartIntroQuestionsHandler } = require('./socket-handlers/startIntroQuestions');
const { registerAdminSetQuestionHandler } = require('./socket-handlers/adminSetQuestion');
const { registerAdminDeleteMyGameStatesHandler } = require('./socket-handlers/adminDeleteMyGameStates');
const { registerAdminSetPageHandler } = require('./socket-handlers/adminSetPage');
const { registerDevice } = require('../models/Device');
const { registerGenerateImageGalleryHandler } = require('./socket-handlers/generateImageGallery');
const { registerConfirmImageSelectionHandler } = require('./socket-handlers/confirmImageSelection');
const { registerGetMyPointsHandler } = require('./socket-handlers/getMyPoints');
const { registerSaveOrUpdateQuestionHandler } = require('./socket-handlers/updateQuestion');
const { registerGetQuestionsHandler } = require('./socket-handlers/getQuestions');
const { registerDeleteQuestionHandler } = require('./socket-handlers/deleteQuestion');
const { registerGetNextScreenHandler } = require('./socket-handlers/get-next-screen');
const { registerSubmitAnswerMyselfHandler } = require('./socket-handlers/submit-answer-myself');
const { registerLogoutHandler } = require('./socket-handlers/logout');
// Import utilities
const { getUserIdFromDevice, sendUserDataToClient } = require('./socket-handlers/utils');
/**
 * Setup socket event handlers for the application.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
function setupSocketHandlers(io) {
  // Add middleware to extract device ID and attach to socket
  io.use((socket, next) => {
    const deviceId = socket.handshake.query.deviceId;
    if (deviceId && typeof deviceId === 'string') {
      registerDevice(deviceId);
      socket.deviceId = deviceId;
    } else {
      console.warn('⚠️ No device ID found in connection query parameters');
    }

    next();
  });

  io.on('connection', async (socket) => {
    // Auto-send user data if we have a device ID
    if (socket.deviceId) {
      try {
        const userId = await getUserIdFromDevice(socket.deviceId);
        if (userId) {
          await sendUserDataToClient(socket, userId);
        }
      } catch (error) {
        console.error('Error auto-sending user data on connection:', error);
      }
      
      // Keep the register device handler for backward compatibility
      registerDeviceHandler.registerRegisterDeviceHandler(socket);
      socket.emit('register_device_internal', { deviceId: socket.deviceId });
    }

    // let _emit= socket.emit;
    // //@ts-ignore
    // socket.emit=function(eventName, ...args) {
    //   console.log(colors.green('>> ' + eventName + ': ' + JSON.stringify(args)));
    //   _emit.call(socket, eventName, ...args);
    // }

    socket.prependAnyOutgoing((eventName, ...args) => {
      console.log(colors.green('>> ' + eventName + ': ' + JSON.stringify(args)));
    })
    
    socket.prependAny((eventName, ...args) => {
      console.log(colors.cyan('<< ' + eventName + ': ' +  JSON.stringify(args)));
    })

    // Register all socket event handlers
    registerRegisterDeviceHandler(socket);
    registerSetGameNameHandler(socket);
    registerStartGameCreationHandler(socket);
    registerCreateGameImmediatelyHandler(socket);
    registerGetGameDataHandler(socket);
    registerUpdateGameNameHandler(socket);
    registerSubmitPhoneNumberHandler(socket);
    registerVerify2FACodeHandler(socket);
    registerPingHandler(socket);
    registerTrackEventHandler(socket);
    registerSaveEmailHandler(socket);
    registerSaveUserNameHandler(socket);
    registerSaveUserGenderHandler(socket);
    registerUploadPendingImageHandler(socket);
    registerGetOriginalImageHashHandler(socket);
    registerCameraUploadRequestedHandler(socket);
    registerGetGameStateHandler(socket);
    registerStartIntroQuestionsHandler(socket);
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
    registerLogoutHandler(socket);
  });
}

module.exports = setupSocketHandlers;
