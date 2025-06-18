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
const handleResetJourneyState = require('./socket-handlers/resetJourneyState');
const handleUpdateJourneyState = require('./socket-handlers/updateJourneyState');
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

function setupSocketHandlers(io) {
  console.log('🔧 Setting up Socket.io handlers...');
  console.log('🎯 IO instance received:', !!io);
  console.log('🎯 IO engine:', !!io.engine);
  console.log('🎯 IO supported transports:', io.engine.opts.transports);
  console.log('🎯 IO CORS settings:', JSON.stringify(io.engine.opts.cors, null, 2));

  // Add middleware to extract device ID and attach to socket
  io.use((socket, next) => {
    console.log('🔌 Socket middleware: New connection attempt from:', socket.handshake.address);
    console.log('🔌 Socket middleware: Headers:', socket.handshake.headers.origin);
    console.log('🔌 Socket middleware: Query params:', JSON.stringify(socket.handshake.query));

    // Extract device ID from query parameters
    const deviceId = socket.handshake.query.deviceId;
    if (deviceId && typeof deviceId === 'string') {
      socket.deviceId = deviceId;
      console.log(`🆔 Device ID attached to socket: ${deviceId}`);
    } else {
      console.warn('⚠️ No device ID found in connection query parameters');
    }

    next();
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket.io client connected:', socket.id);
    console.log('🤝 Transport type:', socket.conn.transport.name);
    console.log(`📱 NEW HIGH-LEVEL CONNECTION: ${socket.id} with device ID: ${socket.deviceId || 'NONE'}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);

    // Auto-register device if we have a device ID
    if (socket.deviceId) {
      console.log(`🚀 Auto-registering device: ${socket.deviceId}`);
      // Call register device handler immediately
      handleRegisterDevice(socket, { deviceId: socket.deviceId });
    }

    // Register all socket event handlers
    socket.on('register_device', (data) => handleRegisterDevice(socket, data));
    socket.on('set_game_name', (data) => handleSetGameName(socket, data));
    socket.on('start_game_creation', () => handleStartGameCreation(socket));
    socket.on('create_game_now', () => handleCreateGameNow(socket));
    socket.on('create_game_immediately', (data) => handleCreateGameImmediately(socket, data));
    socket.on('get_game_data', (data) => handleGetGameData(socket, data));
    socket.on('update_game_name', (data) => handleUpdateGameName(socket, data));
    socket.on('submit_phone_number', (data) => handleSubmitPhoneNumber(socket, data));
    socket.on('verify_2fa_code', (data) => handleVerify2FACode(socket, data));
    socket.on('ping', () => handlePing(socket));
    socket.on('trackEvent', (data) => handleTrackEvent(socket, data));
    socket.on('save_email', (data) => handleSaveEmail(socket, data));
    socket.on('reset_journey_state', () => handleResetJourneyState(socket));
    socket.on('save_user_name', (data) => handleSaveUserName(socket, data));
    socket.on('save_user_gender', (data) => handleSaveUserGender(socket, data));
    socket.on('upload_pending_image', (data) => handleUploadPendingImage(socket, data));
    socket.on('download_whatsapp_image', (data) => handleDownloadWhatsappImage(socket, data));
    socket.on('background_whatsapp_download', (data) => handleBackgroundWhatsappDownload(socket, data));
    socket.on('use_whatsapp_image', (data) => handleUseWhatsappImage(socket, data));
    socket.on('load_existing_gallery_images', (data) => handleLoadExistingGalleryImages(socket, data));
    socket.on('generate_image_gallery', (data) => handleGenerateImageGallery(socket, data));
    socket.on('confirm_image_selection', (data) => handleConfirmImageSelection(socket, data));
    socket.on('my_points', (data, callback) => handleGetMyPoints(socket, data, callback));
    // Add this handler for saving (add/update) questions
    socket.on('save_question', (data, callback) => handleSaveOrUpdateQuestion(socket, data, callback));
    // Add this handler for getting questions
    socket.on('get_questions', (data, callback) => handleGetQuestions(socket, data, callback));
    // Add this handler for deleting questions
    socket.on('delete_question', (data, callback) => handleDeleteQuestion(socket, data, callback));
    
    socket.on('get-game-state', async ({gameId}) => {
      console.log('@@@@@@@@@')
      /** @type {GAME_STATES}*/
      var gameState={screenName:'EMPTY_GAME_STATE'};
      var userId= await getUserIdFromDevice(socket.deviceId);
      // get from pool for current device id and current user id
      var res=await pool.query('SELECT * FROM game_user_state WHERE user_id = $1 AND game_id = $2', [userId, gameId])
      
      if(res.rows.length > 0) {
        gameState=res.rows[0].state;
      } else {
        // no row
        gameState={screenName:'BEFORE_START_ABOUT_YOU'}
        await pool.query('INSERT INTO game_user_state (user_id, game_id, state) VALUES ($1, $2, $3)', [userId, gameId, gameState]);
      }
      console.log(res)
      console.log({gameState})
      socket.emit('update-game-state',gameState)
    })
    socket.on('get_original_image_hash', async (callback) => {
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      // get pendin_image for user
      var res = await pool.query('SELECT pending_image FROM users WHERE user_id = $1', [targetUserId])

      var originalImageHash = res.rows[0].pending_image;
      callback({ originalImageHash: originalImageHash });
    })
    socket.on('start-about-me', async ({gameId}) => {
      console.log('get event start-about-me')
      const userId = await getUserIdFromDevice(socket.deviceId);
      var gameState = { screenName: 'ABOUT_YOU' };
      socket.emit('update-game-state',gameState)
    })

    // התנתקות
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
