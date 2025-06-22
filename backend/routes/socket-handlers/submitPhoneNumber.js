const Device = require('../../models/Device');
const { sendVerificationCode } = require('../../utils/smsService');
const moveUserToGameState = require('./moveUserToGameState');
const { validateDeviceRegistration } = require('./utils');

async function handleSubmitPhoneNumber(socket, data) {
  try {
    const { phoneNumber,gameId } = data;
    
    validateDeviceRegistration(socket);
    
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required');
    }
    
    
    // שליחת SMS אמיתי עם קוד אימות
    const smsResult = await sendVerificationCode(phoneNumber);
    
    if (smsResult.success) {
      // שמירת מספר הטלפון ב-socket לשימוש באימות
      socket.phoneNumber = smsResult.phoneNumber;
      
      // Update journey state to PHONE_SUBMITTED and store phone number in database
      await Device.updateJourneyState(socket.deviceId, 'PHONE_SUBMITTED', {
        pendingPhoneNumber: smsResult.phoneNumber
      });
      
      moveUserToGameState(socket, gameId, socket.userId, {
        screenName: 'ASK_USER_VERIFICATION_CODE',
      })
      
    } else {
      throw new Error(smsResult.error || 'Failed to send SMS');
    }
    
  } catch (error) {
    console.error('Error processing phone number:', error);
    socket.emit('error', {
      message: 'Failed to process phone number',
      error: error.message,
      context: 'sms'
    });
  }
}

module.exports = handleSubmitPhoneNumber;
