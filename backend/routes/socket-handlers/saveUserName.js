const Device = require('../../models/Device');
const User = require('../../models/User');
const moveUserToGameState = require('./moveUserToGameState');
const { getUserIdFromDevice } = require('./utils');

module.exports.registerSaveUserNameHandler = async function(socket) {
  socket.on('save_user_name', async (data) => {
    try {
      const { name, gameId } = data;
      
      if (!name || !name.trim()) {
        throw new Error('Name is required');
      }
      
      // Security: Always derive userId from deviceId
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!targetUserId) {
        throw new Error('User not authenticated. Please complete phone verification first.');
      }
      
      // Validate name length
      if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (name.trim().length > 50) {
        throw new Error('Name must be less than 50 characters');
      }
      
      const trimmedName = name.trim();
      
      console.log(`👤 Saving name for user ${targetUserId}: ${trimmedName}`);
      
      // Update user name in database
      const result = await User.updateUserName(targetUserId, trimmedName);
      
      if (result.success) {
        
        socket.emit('name_saved', {
          success: true,
          message: 'Name saved successfully',
          name: trimmedName,
          userId: targetUserId
        });

        moveUserToGameState(socket, gameId, targetUserId, {
          screenName: 'ASK_PLAYER_GENDER',
        })

        
        console.log(`✅ Name saved successfully for user ${targetUserId}: ${trimmedName}`);
      } else {
        throw new Error(result.error || 'Failed to save name');
      }
      
    } catch (error) {
      console.error('Error saving name:', error);
      
      socket.emit('name_save_error', {
        success: false,
        message: error.message || 'Failed to save name',
        context: 'name_save'
      });
    }
  });
};
