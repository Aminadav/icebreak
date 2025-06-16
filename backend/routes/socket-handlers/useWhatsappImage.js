const Device = require('../../models/Device');
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getUserIdFromDevice } = require('./utils');

async function handleUseWhatsappImage(socket, data) {
  try {
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);

    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }

    // Get user data from database
    const userResult = await pool.query(
      'SELECT phone_number FROM users WHERE user_id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found in database');
    }

    const { phone_number: phoneNumber } = userResult.rows[0];

    if (!phoneNumber) {
      throw new Error('Phone number not found in user profile');
    }

    console.log(`📱 Using pre-downloaded WhatsApp image for user ${targetUserId} with phone: ${phoneNumber}`);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappDir = path.join(__dirname, '..', '..', 'image_per_whatsapp');
    const sourceFilePath = path.join(whatsappDir, `${cleanPhone}.jpg`);

    // Check if the cached WhatsApp image exists
    if (!fs.existsSync(sourceFilePath)) {
      throw new Error('WhatsApp image not found in cache. Please try downloading again.');
    }

    // Read the cached image
    const imageBuffer = fs.readFileSync(sourceFilePath);

    // Create unique filename for the user's pending image
    const timestamp = Date.now();
    const imageHash = crypto
      .createHash('md5')
      .update(`${targetUserId}-whatsapp-${timestamp}`)
      .digest('hex');

    const filename = `${imageHash}.jpg`;

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Copy image to uploads directory
    const destFilePath = path.join(uploadDir, filename);
    fs.writeFileSync(destFilePath, imageBuffer);

    console.log(`💾 WhatsApp image copied to uploads: ${destFilePath}`);

    // Update user's pending_image field in database
    const result = await pool.query(
      'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
      [imageHash, targetUserId]
    );

    if (result.rows.length === 0) {
      // Clean up the file if user update failed
      fs.unlinkSync(destFilePath);
      throw new Error('User not found');
    }

    // Update journey state to IMAGE_GALLERY
    await Device.updateJourneyState(socket.deviceId, 'IMAGE_GALLERY');

    socket.emit('whatsapp_image_used', {
      success: true,
      message: 'WhatsApp image set as pending image successfully',
      imageHash: imageHash,
      userId: targetUserId
    });

    console.log(`✅ WhatsApp image used successfully for user ${targetUserId}: ${imageHash}`);

  } catch (error) {
    console.error('Error using WhatsApp image:', error);

    socket.emit('whatsapp_image_use_error', {
      success: false,
      message: error.message || 'Failed to use WhatsApp image',
      error: error.message
    });
  }
}

module.exports = handleUseWhatsappImage;
