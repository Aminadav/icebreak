const { generateVerificationCode, formatPhoneNumber } = require('./utils/smsService');

// Test phone number 
const testPhone = '0523737233';
const formattedPhone = formatPhoneNumber(testPhone);
const code = generateVerificationCode(formattedPhone);

console.log('=== 2FA TEST ===');
console.log(`📱 Original phone: ${testPhone}`);
console.log(`📱 Formatted phone: ${formattedPhone}`);
console.log(`🔐 Verification code: ${code}`);
console.log('================');

// Also test the verification
const { verifyCode } = require('./utils/smsService');
const isValid = verifyCode(formattedPhone, code);
console.log(`✅ Code verification: ${isValid ? 'VALID' : 'INVALID'}`);
