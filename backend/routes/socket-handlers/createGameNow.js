const pool = require('../../config/database');
const Game = require('../../models/Game');
const { generateGameId } = require('../../utils/idGenerator');
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { validateUserVerification, getUserIdFromDevice } = require('./utils');

async function handleCreateGameNow(socket) {
  try {
    validateUserVerification(socket);
    
    if (!socket.isPhoneVerified) {
      throw new Error('User must be verified with phone number to create games');
    }
    
    if (!socket.pendingGameName) {
      throw new Error('No game name found. Please set a game name first.');
    }
    
    var userId= await getUserIdFromDevice(socket.deviceId);
    const game = await Game.createGame(socket.pendingGameName, );
    const gameId = generateGameId();
    
    const result = await pool.query(
      'INSERT INTO games (game_id, name, creator_user_id) VALUES ($1, $2, $3) RETURNING *',
      [gameId, socket.pendingGameName, userId]
    );
    
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
