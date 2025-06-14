const pool = require('../config/database');
const { generateGameId } = require('../utils/idGenerator');

/**
 * יצירת משחק חדש
 */
async function createGame(gameName, creatorUserId) {
  try {
    const gameId = generateGameId();
    
    const result = await pool.query(
      'INSERT INTO games (game_id, name, creator_user_id) VALUES ($1, $2, $3) RETURNING *',
      [gameId, gameName, creatorUserId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
}

/**
 * קבלת פרטי משחק
 */
async function getGame(gameId) {
  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE game_id = $1',
      [gameId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
}

/**
 * עדכון סטטוס משחק
 */
async function updateGameStatus(gameId, status) {
  try {
    const result = await pool.query(
      'UPDATE games SET status = $1 WHERE game_id = $2 RETURNING *',
      [status, gameId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating game status:', error);
    throw error;
  }
}

/**
 * קבלת כל המשחקים של יוצר
 */
async function getGamesByCreator(creatorUserId) {
  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE creator_user_id = $1 ORDER BY created_at DESC',
      [creatorUserId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting games by creator:', error);
    throw error;
  }
}

module.exports = {
  createGame,
  getGame,
  updateGameStatus,
  getGamesByCreator
};
