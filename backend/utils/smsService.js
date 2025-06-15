const crypto = require('crypto');

// Secret key for generating verification codes
const SMS_SECRET = process.env.SMS_SECRET || 'icebreak-secret-key-2025';

/**
 * Generate a verification code for a phone number
 * @param {string} phoneNumber - The phone number to generate code for
 * @returns {string} - 6-digit verification code
 */
function generateVerificationCode(phoneNumber) {
  // Special case for test phone number - always return 123456
  if (phoneNumber === '972523737233' || phoneNumber === '0523737233') {
    return '123456';
  }
  
  // Create a hash using phone number + secret + current hour (for time-based validity)
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60)); // Current hour timestamp
  const dataToHash = `${phoneNumber}${SMS_SECRET}${currentHour}`;
  
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  
  // Take first 6 characters and convert to numbers
  const code = hash.substring(0, 6).replace(/[a-f]/g, (match) => {
    return String(match.charCodeAt(0) % 10);
  });
  
  return code.padStart(6, '0').substring(0, 6);
}

/**
 * Verify a verification code for a phone number
 * @param {string} phoneNumber - The phone number
 * @param {string} code - The code to verify
 * @returns {boolean} - True if code is valid
 */
function verifyCode(phoneNumber, code) {
  // Special case for test phone number - always accept 123456
  if ((phoneNumber === '972523737233' || phoneNumber === '0523737233') && code === '123456') {
    return true;
  }
  
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  
  // Check current hour and previous hour (for edge cases)
  for (let hourOffset = 0; hourOffset <= 1; hourOffset++) {
    const hourToCheck = currentHour - hourOffset;
    const dataToHash = `${phoneNumber}${SMS_SECRET}${hourToCheck}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    const expectedCode = hash.substring(0, 6).replace(/[a-f]/g, (match) => {
      return String(match.charCodeAt(0) % 10);
    }).padStart(6, '0').substring(0, 6);
    
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Convert Israeli phone number format to international format
 * @param {string} phoneNumber - Phone number in format like 052-3737233 or 0523737233
 * @returns {string} - Phone number in format 972523737233
 */
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If starts with 0, replace with 972
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  
  // If doesn't start with 972, add it
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }
  
  return cleaned;
}

/**
 * Send SMS using sms4free.co.il API
 * @param {Object} options - SMS options
 * @param {string} options.phone - Phone number in international format
 * @param {string} options.message - Message to send
 * @param {string} options.sender - Sender name (default: 'Icebreak')
 * @returns {Promise<Object>} - SMS sending result
 */
async function sendSms({ phone, message, sender = 'Icebreak' }) {
  // Special case for test phone number - don't send SMS, just return success
  console.log('sendSms',{ phone, message, sender });
  if (phone === '972523737233') {
    console.log(`📱 Test phone number detected (${phone}), skipping SMS send`);
    return {
      success: true,
      status: 200,
      response: 'SMS skipped for test number',
      isTestNumber: true
    };
  }
  
  const url = 'https://api.sms4free.co.il/ApiSMS/SendSMS';
  
  try {
    const response = await fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        key: 'O6SerIVDl',
        user: '0523737233',
        pass: '53687317',
        sender,
        recipient: phone,
        msg: message
      })
    });
    
    console.log(`📱 SMS API Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📱 SMS API Response: ${responseText}`);
    
    return {
      success: response.status === 200,
      status: response.status,
      response: responseText
    };
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send verification code SMS
 * @param {string} phoneNumber - Phone number in any format
 * @returns {Promise<Object>} - Result with success status and verification code
 */
async function sendVerificationCode(phoneNumber) {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`📱 Formatted phone: ${phoneNumber} -> ${formattedPhone}`);
    
    // Generate verification code
    const verificationCode = generateVerificationCode(formattedPhone);
    console.log(`🔐 Generated verification code: ${verificationCode} for ${formattedPhone}`);
    
    // Create message
    const message = `קוד האימות שלך ב-Icebreak: ${verificationCode}`;
    
    // Send SMS
    const smsResult = await sendSms({
      phone: formattedPhone,
      message,
      sender: 'Icebreak'
    });
    
    return {
      success: smsResult.success,
      phoneNumber: formattedPhone,
      verificationCode: verificationCode, // Remove this in production!
      smsResponse: smsResult
    };
  } catch (error) {
    console.error('❌ Error sending verification code:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateVerificationCode,
  verifyCode,
  formatPhoneNumber,
  sendSms,
  sendVerificationCode
};

// Test function if run directly
if (!module.parent) {
  // Test phone number formatting
  console.log('Testing phone number formatting:');
  console.log('052-3737233 ->', formatPhoneNumber('052-3737233'));
  console.log('0523737233 ->', formatPhoneNumber('0523737233'));
  console.log('523737233 ->', formatPhoneNumber('523737233'));
  
  // Test verification code generation and verification
  const testPhone = '972523737233';
  const code = generateVerificationCode(testPhone);
  console.log(`\nGenerated code for ${testPhone}: ${code}`);
  console.log(`Verification result: ${verifyCode(testPhone, code)}`);
  console.log(`Wrong code verification: ${verifyCode(testPhone, '123456')}`);
  
  // Test SMS sending (uncomment to test)
  sendVerificationCode('052-3737233').then(result => {
    console.log('SMS Test Result:', result);
  }).catch(console.error);
}
