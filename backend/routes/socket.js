// Import all socket event handlers
const pool = require('../config/database');
const registerDeviceHandler = require('./socket-handlers/registerDevice');
const getMyPointsHandler = require('./socket-handlers/getMyPoints');
const { registerDownloadWhatsappImageHandler } = require('./socket-handlers/downloadWhatsappImage');
const { registerBackgroundWhatsappDownloadHandler } = require('./socket-handlers/backgroundWhatsappDownload');
const { registerUseWhatsappImageHandler } = require('./socket-handlers/useWhatsappImage');
const { registerLoadExistingGalleryImagesHandler } = require('./socket-handlers/loadExistingGalleryImages');
const generateImageGalleryHandler = require('./socket-handlers/generateImageGallery');
const confirmImageSelectionHandler = require('./socket-handlers/confirmImageSelection');
const saveOrUpdateQuestionHandler = require('./socket-handlers/updateQuestion');
const getQuestionsHandler = require('./socket-handlers/getQuestions');
const deleteQuestionHandler = require('./socket-handlers/deleteQuestion');
const { getUserIdFromDevice } = require('./socket-handlers/utils');
//@ts-ignore
const colors=require('colors');
const moveUserToGameState = require('./socket-handlers/moveUserToGameState');
const { registerRegisterDeviceHandler } = require('./socket-handlers/registerDevice');
const { registerStartGameCreationHandler } = require('./socket-handlers/startGameCreation');
const { registerSetGameNameHandler } = require('./socket-handlers/setGameName');
const { registerCreateGameNowHandler } = require('./socket-handlers/createGameNow');
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
/**
 * Setup socket event handlers for the application.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
function setupSocketHandlers(io) {
  // Add middleware to extract device ID and attach to socket
  io.use((socket, next) => {

    // Extract device ID from query parameters
    const deviceId = socket.handshake.query.deviceId;
    console.log('!!!!!!',deviceId)
    if (deviceId && typeof deviceId === 'string') {
      registerDevice(deviceId);
      socket.deviceId = deviceId;
    } else {
      console.warn('⚠️ No device ID found in connection query parameters');
    }

    next();
  });

  io.on('connection', (socket) => {
    // Auto-register device if we have a device ID
    if (socket.deviceId) {
      registerDeviceHandler.registerRegisterDeviceHandler(socket);
      socket.emit('register_device_internal', { deviceId: socket.deviceId });
    }

    let _emit= socket.emit;
    //@ts-ignore
    socket.emit=function(eventName, ...args) {
      console.log(colors.green('>> ' + eventName + ': ' + JSON.stringify(args)));
      _emit.call(socket, eventName, ...args);
    }
    
    let _on=socket.on;
    //@ts-ignore
    socket.on=function(eventName,callback) {
      _on.call(socket,eventName,(...args)=>{
        console.log(colors.cyan('<< ' + eventName + ': ' +  JSON.stringify(args)));
        //@ts-ignore
        callback(...args);
      })
    }

    // Register all socket event handlers
    registerRegisterDeviceHandler(socket);
    registerSetGameNameHandler(socket);
    registerStartGameCreationHandler(socket);
    registerCreateGameNowHandler(socket);
    registerCreateGameImmediatelyHandler(socket);
    registerGetGameDataHandler(socket);
    registerUpdateGameNameHandler(socket);
    registerSubmitPhoneNumberHandler(socket);
    registerVerify2FACodeHandler(socket);
    registerPingHandler(socket);
    registerTrackEventHandler(socket);
    // Register saveEmail handler
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
    generateImageGalleryHandler.registerGenerateImageGalleryHandler(socket);
    confirmImageSelectionHandler.registerConfirmImageSelectionHandler(socket);
    getMyPointsHandler.registerGetMyPointsHandler(socket);
    saveOrUpdateQuestionHandler.registerSaveOrUpdateQuestionHandler(socket);
    getQuestionsHandler.registerGetQuestionsHandler(socket);
    deleteQuestionHandler.registerDeleteQuestionHandler(socket);

    // התנתקות
    socket.on('disconnect', () => {
      // console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      // console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
