const Device = require('../../models/Device');
const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

async function handleConfirmImageSelection(socket, data) {
  try {
    const { selectedImageHash, originalImageHash, phoneNumber, email, name } = data;
    
    if (!selectedImageHash) {
      throw new Error('Selected image hash is required');
    }
    
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    
    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }
    
    console.log(`✅ User ${targetUserId} confirmed image selection: ${selectedImageHash}`);
    
    // Update user's profile with the selected image
    // For now, we'll update the pending_image field with the selected image
    const result = await pool.query(
      'UPDATE users SET pending_image = $1 WHERE user_id = $2 RETURNING *',
      [selectedImageHash, targetUserId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    // Update journey state to CREATOR_GAME_READY
    await Device.updateJourneyState(socket.deviceId, 'CREATOR_GAME_READY');
    
    socket.emit('image_selection_confirmed', {
      success: true,
      message: 'Image selection confirmed successfully',
      selectedImageHash: selectedImageHash,
      userId: targetUserId
    });
    
    console.log(`🎉 Image selection confirmed for user ${targetUserId}: ${selectedImageHash}`);
    
  } catch (error) {
    console.error('Error confirming image selection:', error);
    
    socket.emit('image_selection_error', {
      success: false,
      message: error.message || 'Failed to confirm image selection',
      error: error.message
    });
  }
}

module.exports = handleConfirmImageSelection;
