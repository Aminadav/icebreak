const Game = require('../../models/Game');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateUserVerification } = require('./utils');

async function handleCreateGameNow(socket) {
  try {
    validateUserVerification(socket);
    
    if (!socket.isPhoneVerified) {
      throw new Error('User must be verified with phone number to create games');
    }
    
    if (!socket.pendingGameName) {
      throw new Error('No game name found. Please set a game name first.');
    }
    
    const game = await Game.createGame(socket.pendingGameName, socket.userId);
    
    // Track game creation
    await sendToMixpanel({
      trackingId: 'game_created',
      userId: socket.userId,
      deviceId: socket.deviceId,
      timestamp: new Date().toISOString(),
      game_id: game.game_id,
      game_name: game.name,
      socketId: socket.id
    });
    
    // הצטרפות לחדר המשחק
    socket.join(game.game_id);
    
    socket.emit('game_created', {
      gameId: game.game_id,
      gameName: game.name,
      status: game.status,
      createdAt: game.created_at,
      success: true
    });
    
    // מחיקת שם המשחק הממתין
    delete socket.pendingGameName;
    
    console.log(`🎮 Game created: ${game.name} (${game.game_id}) by user: ${socket.userId}`);
  } catch (error) {
    console.error('Error creating game:', error);
    socket.emit('error', {
      message: 'Failed to create game',
      error: error.message
    });
  }
}

module.exports = handleCreateGameNow;
