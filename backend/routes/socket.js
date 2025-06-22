// Import all socket event handlers
const pool = require('../config/database');
const handleRegisterDevice = require('./socket-handlers/registerDevice');
const handleSetGameName = require('./socket-handlers/setGameName');
const handleStartGameCreation = require('./socket-handlers/startGameCreation');
const handleCreateGameNow = require('./socket-handlers/createGameNow');
const handleCreateGameImmediately = require('./socket-handlers/createGameImmediately');
const handleGetGameData = require('./socket-handlers/getGameData');
const handleUpdateGameName = require('./socket-handlers/updateGameName');
const handleSubmitPhoneNumber = require('./socket-handlers/submitPhoneNumber');
const handleVerify2FACode = require('./socket-handlers/verify2FACode');
const handlePing = require('./socket-handlers/ping');
const handleTrackEvent = require('./socket-handlers/trackEvent');
const handleSaveEmail = require('./socket-handlers/saveEmail');
const handleSaveUserName = require('./socket-handlers/saveUserName');
const handleSaveUserGender = require('./socket-handlers/saveUserGender');
const handleUploadPendingImage = require('./socket-handlers/uploadPendingImage');
const handleDownloadWhatsappImage = require('./socket-handlers/downloadWhatsappImage');
const handleBackgroundWhatsappDownload = require('./socket-handlers/backgroundWhatsappDownload');
const handleUseWhatsappImage = require('./socket-handlers/useWhatsappImage');
const handleLoadExistingGalleryImages = require('./socket-handlers/loadExistingGalleryImages');
const handleGenerateImageGallery = require('./socket-handlers/generateImageGallery');
const handleConfirmImageSelection = require('./socket-handlers/confirmImageSelection');
const handleGetMyPoints = require('./socket-handlers/getMyPoints');
const handleSaveOrUpdateQuestion = require('./socket-handlers/updateQuestion');
const handleGetQuestions = require('./socket-handlers/getQuestions');
const handleDeleteQuestion = require('./socket-handlers/deleteQuestion');
const { getUserIdFromDevice } = require('./socket-handlers/utils');
//@ts-ignore
const colors=require('colors');
const moveUserToGameState = require('./socket-handlers/moveUserToGameState');
/**
 * Setup socket event handlers for the application.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
function setupSocketHandlers(io) {
  // Add middleware to extract device ID and attach to socket
  io.use((socket, next) => {

    // Extract device ID from query parameters
    const deviceId = socket.handshake.query.deviceId;
    if (deviceId && typeof deviceId === 'string') {
      socket.deviceId = deviceId;
    } else {
      console.warn('⚠️ No device ID found in connection query parameters');
    }

    next();
  });

  io.on('connection', (socket) => {
    // Auto-register device if we have a device ID
    if (socket.deviceId) {
      // Call register device handler immediately
      handleRegisterDevice(socket, { deviceId: socket.deviceId });
    }
    let _emit= socket.emit;
    //@ts-ignore
    socket.emit=function(eventName, ...args) {
      console.log(colors.green('>> ' + eventName + ': ' + JSON.stringify(args)));
      _emit.call(socket, eventName, ...args);
    }

    function on(eventName,callback) {
      socket.on(eventName,(...args)=>{
        console.log(colors.cyan('<< ' + eventName + ': ' +  JSON.stringify(args)));
        callback(...args);
      })
    }

    // Register all socket event handlers
    on('register_device', (data) => handleRegisterDevice(socket, data));
    on('set_game_name', (data) => handleSetGameName(socket, data));
    on('start_game_creation', () => handleStartGameCreation(socket));
    on('create_game_now', () => handleCreateGameNow(socket));
    on('create_game_immediately', (data) => handleCreateGameImmediately(socket, data));
    on('get_game_data', (data) => handleGetGameData(socket, data));
    on('update_game_name', (data) => handleUpdateGameName(socket, data));
    on('submit_phone_number', (data) => handleSubmitPhoneNumber(socket, data));
    on('verify_2fa_code', (data) => handleVerify2FACode(socket, data));
    on('ping', () => handlePing(socket));
    on('trackEvent', (data) => handleTrackEvent(socket, data));
    on('save_email', (data) => handleSaveEmail(socket, data));
    on('save_user_name', (data) => handleSaveUserName(socket, data));
    on('save_user_gender', (data) => handleSaveUserGender(socket, data));
    on('upload_pending_image', (data) => handleUploadPendingImage(socket, data));
    on('download_whatsapp_image', (data) => handleDownloadWhatsappImage(socket, data));
    on('background_whatsapp_download', (data) => handleBackgroundWhatsappDownload(socket, data));
    on('use_whatsapp_image', (data) => handleUseWhatsappImage(socket, data));
    on('load_existing_gallery_images', (data) => handleLoadExistingGalleryImages(socket, data));
    on('generate_image_gallery', (data) => handleGenerateImageGallery(socket));
    on('confirm_image_selection', (data) => handleConfirmImageSelection(socket, data));
    on('my_points', (data, callback) => handleGetMyPoints(socket, data, callback));
    // Add this handler for saving (add/update) questions
    on('save_question', (data, callback) => handleSaveOrUpdateQuestion(socket, data, callback));
    // Add this handler for getting questions
    on('get_questions', (data, callback) => handleGetQuestions(socket, data, callback));
    // Add this handler for deleting questions
    on('delete_question', (data, callback) => handleDeleteQuestion(socket, data, callback));
    
    on('get_original_image_hash', async (callback) => {
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      // get pendin_image for user
      var res = await pool.query('SELECT pending_image FROM users WHERE user_id = $1', [targetUserId])
      
      var originalImageHash = res.rows[0].pending_image;
      callback({ originalImageHash: originalImageHash });
    })
    
    on('camera_upload_requested', async (data) =>{
      var {gameId} = data;
      var userId= await getUserIdFromDevice(socket.deviceId);
      moveUserToGameState(socket, gameId, userId, {
        screenName: 'CAMERA',
      })
    })


    on('get-game-state', async ({gameId}) => {
      /** @type {GAME_STATES}*/
      var gameState={screenName:'EMPTY_GAME_STATE'};
      var userId= await getUserIdFromDevice(socket.deviceId);
      // get from pool for current device id and current user id
      var res=await pool.query('SELECT * FROM game_user_state WHERE user_id = $1 AND game_id = $2', [userId, gameId])
      
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

    on('start-intro-questions', async ({gameId}) => {
      console.log('get event start-intro-questions')
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      var question=await getAboutMeQuestion()
      /** @type {GAME_STATES} */
      var gameState = { screenName: 'QUESTION',isIntro:true,question,introCurrentQuestion:1,introTotalQuestions:5 };
      await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2 AND game_id = $3', [gameState, userId, gameId]);
      socket.emit('update-game-state',gameState)
    })

    on('admin-set-question', async (question) => {
      console.log('get event start-intro-questions')
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      /** @type {GAME_STATES} */
      var gameState = { screenName: 'QUESTION',isIntro:true,question,introCurrentQuestion:1,introTotalQuestions:5 };
      await pool.query('UPDATE  game_user_state SET state = $1 WHERE user_id = $2', [gameState, userId]);
    })
    on('admin-delete-my-game-states', async () => {
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

    on('admin-set-page', async (gameState) => {
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
    on('disconnect', (reason) => {
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
