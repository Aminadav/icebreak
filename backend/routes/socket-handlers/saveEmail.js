
const User = require('../../models/User');
const moveUserToGameState = require('./moveUserToGameState');
const { validateUserVerification, getUserIdFromDevice } = require('./utils');

module.exports.registerSaveEmailHandler = async function(socket) {
  socket.on('save_email', async (data) => {
    try {
      const { email, gameId } = data;
      
      if (!email || !email.trim()) {
        throw new Error('Email address is required');
      }
      
      // Security: Always derive userId from deviceId
      const targetUserId = await getUserIdFromDevice(socket.deviceId);
      
      if (!targetUserId) {
        throw new Error('User not authenticated. Please complete phone verification first.');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Invalid email format');
      }
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log(`📧 Saving email for user ${targetUserId}: ${normalizedEmail}`);
      
      // Update user email in database
      const result = await User.updateUserEmail(targetUserId, normalizedEmail);
      
      if (result.success) {
        moveUserToGameState(socket, gameId, targetUserId, {
          screenName: 'ASK_PLAYER_NAME',
        })
      } else {
        throw new Error(result.error || 'Failed to save email address');
      }
      
    } catch (error) {
      console.error('Error saving email:', error);
      
      if (error.message.includes('unique_email_lower')) {
        socket.emit('email_save_error', {
          success: false,
          message: 'כתובת האימייל כבר קיימת במערכת',
          context: 'email_save'
        });
      } else {
        socket.emit('email_save_error', {
          success: false,
          message: error.message || 'שגיאה בשמירת כתובת האימייל',
          context: 'email_save'
        });
      }
    }
  });
};
