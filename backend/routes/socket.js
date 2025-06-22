// Import all socket event handlers
const pool = require('../config/database');
const registerDeviceHandler = require('./socket-handlers/registerDevice');
const getMyPointsHandler = require('./socket-handlers/getMyPoints');
const handleDownloadWhatsappImage = require('./socket-handlers/downloadWhatsappImage');
const handleBackgroundWhatsappDownload = require('./socket-handlers/backgroundWhatsappDownload');
const handleUseWhatsappImage = require('./socket-handlers/useWhatsappImage');
const handleLoadExistingGalleryImages = require('./socket-handlers/loadExistingGalleryImages');
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
    
    socket.on('download_whatsapp_image', (data) => handleDownloadWhatsappImage(socket, data));
    socket.on('background_whatsapp_download', (data) => handleBackgroundWhatsappDownload(socket, data));
    socket.on('use_whatsapp_image', (data) => handleUseWhatsappImage(socket, data));
    socket.on('load_existing_gallery_images', (data) => handleLoadExistingGalleryImages(socket, data));
    generateImageGalleryHandler.registerGenerateImageGalleryHandler(socket);
    confirmImageSelectionHandler.registerConfirmImageSelectionHandler(socket);
    getMyPointsHandler.registerGetMyPointsHandler(socket);
    // Add this handler for saving (add/update) questions
    saveOrUpdateQuestionHandler.registerSaveOrUpdateQuestionHandler(socket);
    // Add this handler for getting questions
    getQuestionsHandler.registerGetQuestionsHandler(socket);
    // Add this handler for deleting questions
    deleteQuestionHandler.registerDeleteQuestionHandler(socket);
    socket.on('get_original_image_hash', async (callback) => {
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      // get pendin_image for user
      var res = await pool.query('SELECT pending_image FROM users WHERE user_id = $1', [targetUserId])
      
      var originalImageHash = res.rows[0].pending_image;
      callback({ originalImageHash: originalImageHash });
    })
    
    socket.on('camera_upload_requested', async (data) =>{
      var {gameId} = data;
      var userId= await getUserIdFromDevice(socket.deviceId);
      moveUserToGameState(socket, gameId, userId, {
        screenName: 'CAMERA',
      })
    })


    socket.on('get-game-state', async ({gameId}) => {
      /** @type {GAME_STATES}*/
      var gameState={screenName:'EMPTY_GAME_STATE'};
      var userId= await getUserIdFromDevice(socket.deviceId);
      // get from pool for current device id and current user id
      var res=await pool.query('SELECT * FROM game_user_state WHERE user_id = $1 AND game_id = $2', [userId, gameId])
      
      console.log('$$$$$$$$$$$$$$$$$$$$$$$')
      if(res.rows.length == 0) {
        gameState={screenName:'BEFORE_START_ABOUT_YOU'}
        await pool.query('INSERT INTO game_user_state (user_id, game_id, state) VALUES ($1, $2, $3)', [userId, gameId, gameState]);
      } else {
        gameState=res.rows[0].state;
      }

      // console.log(res)
      // console.log({gameState})
      socket.emit('update-game-state',gameState)
    })

    socket.on('start-intro-questions', async ({gameId}) => {
      console.log('get event start-intro-questions')
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      var question=await getAboutMeQuestion()
      /** @type {GAME_STATES} */
      var gameState = { screenName: 'QUESTION',isIntro:true,question,introCurrentQuestion:1,introTotalQuestions:5 };
      await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2 AND game_id = $3', [gameState, userId, gameId]);
      socket.emit('update-game-state',gameState)
    })

    socket.on('admin-set-question', async (question) => {
      console.log('get event start-intro-questions')
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      /** @type {GAME_STATES} */
      var gameState = { screenName: 'QUESTION',isIntro:true,question,introCurrentQuestion:1,introTotalQuestions:5 };
      await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2', [gameState, userId]);
    })
    socket.on('admin-delete-my-game-states', async () => {
      console.log('🗑️ Admin: Deleting game states for current user');
      try {
        console.log('🗑️ Admin: Deleting all game states for current user');
        const userId = await getUserIdFromDevice(socket.deviceId);
        
        if (!userId) {
          socket.emit('error', { message: 'No user found for this device' });
          return;
        }

        // Delete all game states for the current user
        const result = await pool.query('DELETE FROM game_user_state WHERE user_id = $1', [userId]);
        
        console.log(`🗑️ Admin: Deleted ${result.rowCount} game states for user ${userId}`);
        socket.emit('admin_game_states_deleted', { 
          success: true, 
          message: `Successfully deleted ${result.rowCount} game states`,
          deletedCount: result.rowCount 
        });
      } catch (error) {
        console.error('❌ Admin: Error deleting game states:', error);
        socket.emit('error', { message: 'Failed to delete game states: ' + error.message });
      }
    })

    socket.on('admin-set-page', async (gameState) => {
      console.log('⭐ Admin: Setting page to GOT_POINTS for current user');
        
      var userId = await getUserIdFromDevice(socket.deviceId);
        // Update all game states for the current user to GOT_POINTS
        const result = await pool.query('UPDATE game_user_state SET state = $1 WHERE user_id = $2', [gameState, userId]);
        
        console.log(`⭐ Admin: Updated ${result.rowCount} game states to GOT_POINTS for user ${userId}`);
        socket.emit('admin_page_set', { 
          success: true, 
          message: `Successfully set ${result.rowCount} games to Got Points page`,
          updatedCount: result.rowCount 
        });
    })

    // התנתקות
    socket.on('disconnect', () => {
      // console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      // console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

async function getAboutMeQuestion() {
  var row=await pool.query('select * from questions limit 1')
  /** @type{QUESTION} */
  var question=row.rows[0];
  return question;
}

module.exports = setupSocketHandlers;
