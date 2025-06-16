// Import all socket event handlers
const {
  handleRegisterDevice,
  handleSetGameName,
  handleStartGameCreation,
  handleCreateGameNow,
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
  handleLoadExistingGalleryImages,
  handleGenerateImageGallery,
  handleConfirmImageSelection
} = require('./socket-handlers');

function setupSocketHandlers(io) {
  console.log('🔧 Setting up Socket.io handlers...');
  console.log('🎯 IO instance received:', !!io);
  console.log('🎯 IO engine:', !!io.engine);
  console.log('🎯 IO supported transports:', io.engine.opts.transports);
  console.log('🎯 IO CORS settings:', JSON.stringify(io.engine.opts.cors, null, 2));
  
  // Add middleware to log all connections
  io.use((socket, next) => {
    console.log('🔌 Socket middleware: New connection attempt from:', socket.handshake.address);
    console.log('🔌 Socket middleware: Headers:', socket.handshake.headers.origin);
    console.log('🔌 Socket middleware: Query params:', JSON.stringify(socket.handshake.query));
    next();
  });
  
  io.on('connection', (socket) => {
    console.log('✅ Socket.io client connected:', socket.id);
    console.log('🤝 Transport type:', socket.conn.transport.name);
    console.log(`📱 NEW HIGH-LEVEL CONNECTION: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);
    
    // Register all socket event handlers
    socket.on('register_device', (data) => handleRegisterDevice(socket, data));
    socket.on('set_game_name', (data) => handleSetGameName(socket, data));
    socket.on('start_game_creation', () => handleStartGameCreation(socket));
    socket.on('create_game_now', () => handleCreateGameNow(socket));
    socket.on('submit_phone_number', (data) => handleSubmitPhoneNumber(socket, data));
    socket.on('verify_2fa_code', (data) => handleVerify2FACode(socket, data));
    socket.on('ping', () => handlePing(socket));
    socket.on('trackEvent', (data) => handleTrackEvent(socket, data));
    socket.on('save_email', (data) => handleSaveEmail(socket, data));
    socket.on('reset_journey_state', () => handleResetJourneyState(socket));
    socket.on('update_journey_state', (data) => handleUpdateJourneyState(socket, data));
    socket.on('save_user_name', (data) => handleSaveUserName(socket, data));
    socket.on('save_user_gender', (data) => handleSaveUserGender(socket, data));
    socket.on('upload_pending_image', (data) => handleUploadPendingImage(socket, data));
    socket.on('download_whatsapp_image', (data) => handleDownloadWhatsappImage(socket, data));
    socket.on('load_existing_gallery_images', (data) => handleLoadExistingGalleryImages(socket, data));
    socket.on('generate_image_gallery', (data) => handleGenerateImageGallery(socket, data));
    socket.on('confirm_image_selection', (data) => handleConfirmImageSelection(socket, data));

    // התנתקות
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket.io client disconnected: ${socket.id}, Reason: ${reason}`);
      console.log(`📱 Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
