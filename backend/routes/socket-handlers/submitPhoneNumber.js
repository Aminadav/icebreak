//@ts-check
const pool = require('../../config/database');

const { sendVerificationCode, formatPhoneNumber } = require('../../utils/smsService');
const { push_user_to_next_screen } = require('./push-user-next-screen');
const { validateDeviceRegistration, getUserIdFromDevice } = require('./utils');

module.exports.registerSubmitPhoneNumberHandler = async function(socket) {
  socket.on('submit_phone_number', async (data) => {
    try {
      var { phoneNumber, gameId } = data;
      
      phoneNumber = formatPhoneNumber(phoneNumber);
      var userId = await getUserIdFromDevice(socket.deviceId);
      // validateDeviceRegistration(socket);
      
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        throw new Error('Phone number is required');
      }
      
      
      // שליחת SMS אמיתי עם קוד אימות
      const smsResult = await sendVerificationCode(phoneNumber);
      
      if (smsResult.success) {
        // שמירת מספר הטלפון ב-socket לשימוש באימות
        socket.phoneNumber = smsResult.phoneNumber;
        await pool.query(`update users set phone_number = $1 where user_id = $2`, [phoneNumber, userId]);
        
        await push_user_to_next_screen(socket, gameId, userId);
        
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
  });
};
