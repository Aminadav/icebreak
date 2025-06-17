// Import all socket event handlers
const pool = require('../config/database');
const {
  handleRegisterDevice,
  handleSetGameName,
  handleStartGameCreation,
  handleCreateGameNow,
  handleCreateGameImmediately,
  handleGetGameData,
  handleUpdateGameName,
  handleSubmitPhoneNumber,
  handleVerify2FACode,
  handlePing,
  handleTrackEvent,
  handleSaveEmail,
  handleResetJourneyState,
  handleUpdateJourneyState,
  handleSaveUserName,
  handleSaveUserGender,
  handleUploadPendingImage,
  handleDownloadWhatsappImage,
  handleBackgroundWhatsappDownload,
  handleUseWhatsappImage,
  handleLoadExistingGalleryImages,
  handleGenerateImageGallery,
  handleConfirmImageSelection,
  handleGetMyPoints
} = require('./socket-handlers');
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
    socket.on('get_original_image_hash', async (callback) => {
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      // get pendin_image for user
      var res = await pool.query('SELECT pending_image FROM users WHERE user_id = $1', [targetUserId])

      var originalImageHash = res.rows[0].pending_image;
      callback({ originalImageHash: originalImageHash });
    })

    // התנתקות
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
