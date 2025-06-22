
const Device = require('../../models/Device');
const User = require('../../models/User');
const moveUserToGameState = require('./moveUserToGameState');
const { getUserIdFromDevice } = require('./utils');

module.exports.registerConfirmImageSelectionHandler = async function(socket) {
  socket.on('confirm_image_selection', async (data) => {
    try {
      const { selectedImageHash, gameId} = data;
      var userId= await getUserIdFromDevice(socket.deviceId);
      
      if (!selectedImageHash) {
        throw new Error('Selected image hash is required');
      }
      
      // Security: Always derive userId from deviceId
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!targetUserId) {
        throw new Error('User not authenticated. Please complete phone verification first.');
      }
      
      console.log(`✅ User ${targetUserId} confirmed image selection: ${selectedImageHash}`);
      
      // Update user's profile with the selected image in the new image column
      const updateResult = await User.updateUserImage(targetUserId, selectedImageHash);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update user image');
      }
      
      console.log(`📸 User image updated successfully for user ${targetUserId}: ${selectedImageHash}`);
      
      moveUserToGameState(socket,gameId,userId,{
        screenName:'CREATOR_GAME_READY',
      })
      
      console.log(`🎉 Image selection confirmed for user ${targetUserId}: ${selectedImageHash}`);
      
    } catch (error) {
      console.error('Error confirming image selection:', error);
      
      socket.emit('image_selection_error', {
        success: false,
        message: error.message || 'Failed to confirm image selection',
        error: error.message
      });
    }
  });
};
