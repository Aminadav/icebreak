const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { moveUserToScreen } = require('./get-next-screen-logic');

/**
 * Debug handler to quickly set up current user as creator with completed onboarding
 * @param {Object} socket - The socket instance
 */
module.exports.registerDebugSpeedCreatorSignupHandler = async function(socket) {
  socket.on('debug-speed-creator-signup', async (data) => {
    try {
      const { gameId } = data;
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!userId) {
        socket.emit('debug-speed-creator-signup-response', { 
          success: false, 
          error: 'User not authenticated' 
        });
        return;
      }
      
      if (!gameId) {
        socket.emit('debug-speed-creator-signup-response', { 
          success: false, 
          error: 'Game ID required' 
        });
        return;
      }

      console.log(`⚡ Setting up speed creator signup for user ${userId} in game ${gameId}`);
      
      // Set user as creator in the game
      await pool.query(`
        UPDATE games 
        SET creator_user_id = $1 
        WHERE game_id = $2
      `, [userId, gameId]);
      
      // Complete user profile if not already done
      const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
      const user = userResult.rows[0];
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Set phone number and verify if not set
      if (!user.phone_number) {
        await pool.query(`
          UPDATE users 
          SET phone_number = $1, phone_verified = true 
          WHERE user_id = $2
        `, [`050-${Math.floor(Math.random() * 9000000) + 1000000}`, userId]);
      } else if (!user.phone_verified) {
        await pool.query(`
          UPDATE users 
          SET phone_verified = true 
          WHERE user_id = $1
        `, [userId]);
      }
      
      // Set email and verify if not set
      if (!user.email) {
        await pool.query(`
          UPDATE users 
          SET email = $1, email_verified = true 
          WHERE user_id = $2
        `, [`creator${userId.substring(0, 8)}@example.com`, userId]);
      } else if (!user.email_verified) {
        await pool.query(`
          UPDATE users 
          SET email_verified = true 
          WHERE user_id = $1
        `, [userId]);
      }
      
      // Set name if not set
      if (!user.name) {
        await pool.query(`
          UPDATE users 
          SET name = $1 
          WHERE user_id = $2
        `, ['בוחן מהיר', userId]);
      }
      
      // Set gender if not set
      if (!user.gender) {
        await pool.query(`
          UPDATE users 
          SET gender = $1 
          WHERE user_id = $2
        `, ['male', userId]);
      }
      
      // Set image if not set
      // if (!user.image && !user.has_image) {
        const devFacesDir = path.join(__dirname, '../../dev-faces');
        const uploadsDir = path.join(__dirname, '../../uploads');
        
        try {
          const faceImages = fs.readdirSync(devFacesDir).filter(file => file.endsWith('.jpg'));
          if (faceImages.length > 0) {
            const randomImage = faceImages[Math.floor(Math.random() * faceImages.length)];
            const imageHash = crypto.createHash('md5').update(userId + randomImage + 'creator').digest('hex');
            const sourcePath = path.join(devFacesDir, randomImage);
            const destPath = path.join(uploadsDir, imageHash) + '.jpg';
            
            fs.copyFileSync(sourcePath, destPath);
            
            await pool.query(`
              UPDATE users 
              SET image = $1, has_image = true 
              WHERE user_id = $2
            `, [imageHash, userId]);
          }
        } catch (err) {
          console.error('Error setting up image:', err);
        }
      // }
      
      // Update or create game user state with creator metadata and GAME_READY screen
      const gameUserStateResult = await pool.query(`
        SELECT * FROM game_user_state 
        WHERE game_id = $1 AND user_id = $2
      `, [gameId, userId]);
      
      const creatorMetadata = {
        IS_CREATOR: true,
        SEEN_GAME_READY: false,
        SEEN_BEFORE_ASK_ABOUT_YOU: false,
        ANSWER_ABOUT_MYSELF: 0
      };
      
      if (gameUserStateResult.rows.length > 0) {
        // Update existing state
        await pool.query(`
          UPDATE game_user_state 
          SET state = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
          WHERE game_id = $3 AND user_id = $4
        `, [{ screen: 'CREATOR_GAME_READY' }, creatorMetadata, gameId, userId]);
      } else {
        // Create new state
        await pool.query(`
          INSERT INTO game_user_state (game_id, user_id, state, metadata)
          VALUES ($1, $2, $3, $4)
        `, [gameId, userId, { screen: 'CREATOR_GAME_READY' }, creatorMetadata]);
      }
      
      console.log(`✅ Successfully set up speed creator signup for user ${userId}`);
      
      socket.emit('debug-speed-creator-signup-response', { 
        success: true, 
        message: 'Creator setup completed successfully'
      });
      
    } catch (error) {
      console.error('❌ Error in speed creator signup:', error);
      socket.emit('debug-speed-creator-signup-response', { 
        success: false, 
        error: error.message 
      });
    }
  });
};
