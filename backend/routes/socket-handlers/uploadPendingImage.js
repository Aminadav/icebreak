
const moveUserToGameState =require( './moveUserToGameState');
const Device = require('../../models/Device');
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getUserIdFromDevice } = require('./utils');

module.exports.registerUploadPendingImageHandler = async function(socket) {
  socket.on('upload_pending_image', async (data) => {
    try {
      const { imageData,gameId } = data;
      
      if (!imageData) {
        throw new Error('Image data is required');
      }
      
      // Security: Always derive userId from deviceId
      const userId = await getUserIdFromDevice(socket.deviceId);
      
      if (!userId) {
        throw new Error('User not authenticated. Please complete phone verification first.');
      }
      
      console.log(`📸 Processing image upload for user ${userId}`);
      
      // Create unique filename with timestamp and user ID
      const timestamp = Date.now();
      const imageHash = crypto
        .createHash('md5')
        .update(`${userId}-${timestamp}`)
        .digest('hex');
      
      const filename = `${imageHash}.jpg`;
      
      // Ensure upload directory exists - save directly to uploads root
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Write image file
      const filePath = path.join(uploadDir, filename);
      const imageBuffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(filePath, imageBuffer);
      
      console.log(`📸 Image saved to: ${filePath}`);
      
      // Update user's image_original field in database
      console.log(0)
      const result = await pool.query(
        'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
        [imageHash, userId]
      );
      console.log(1)
      
      if (result.rows.length === 0) {
        // Clean up the file if user update failed
        fs.unlinkSync(filePath);
        throw new Error('User not found');
      }
      
      
      // socket.emit('upload_pending_image_response', {
      //   success: true,
      //   message: 'Image uploaded successfully',
      //   imageHash: imageHash,
      //   userId: targetUserId
      // });
      moveUserToGameState(socket, gameId,userId, {
        screenName: 'GALLERY', 
      })
      console.log(`✅ Image uploaded successfully for user ${userId}: ${imageHash}`);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      socket.emit('upload_pending_image_response', {
        success: false,
        message: error.message || 'Failed to upload image',
        error: error.message
      });
    }
  });
};
