const pool = require('../config/database');
const { generateGameId } = require('../utils/idGenerator');

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

/**
 * עדכון יוצר המשחק (לטענת בעלות על משחק אנונימי)
 */
async function updateGameCreator(gameId, creatorUserId) {
  try {
    const result = await pool.query(
      'UPDATE games SET creator_user_id = $1 WHERE game_id = $2 RETURNING *',
      [creatorUserId, gameId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating game creator:', error);
    throw error;
  }
}

/**
 * עדכון שם המשחק
 */
async function updateGameName(gameId, gameName) {
  try {
    const result = await pool.query(
      'UPDATE games SET name = $1 WHERE game_id = $2 RETURNING *',
      [gameName, gameId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating game name:', error);
    throw error;
  }
}

module.exports = {
  getGame,
  updateGameStatus,
  getGamesByCreator,
  updateGameCreator,
  updateGameName
};
