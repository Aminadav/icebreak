const { sendVerificationCode } = require('./utils/smsService');
const { generateSquareImage } = require('./deep-image/deep-image-ai');
const fs = require('fs');
const path = require('path');

/**
 * Test that mock functionality works when environment variables are set
 */
async function testMockFunctionality() {
  console.log('🧪 Testing Mock Functionality');
  console.log('=============================');
  
  // Test MOCK_SMS functionality
  console.log('\n1. Testing MOCK_SMS functionality...');
  console.log(`   Current MOCK_SMS: ${process.env.MOCK_SMS || 'undefined'}`);
  
  try {
    const smsResult = await sendVerificationCode('972523737233');
    console.log('   SMS Result:', {
      success: smsResult.success,
      isTestNumber: smsResult.smsResponse?.isTestNumber,
      phoneNumber: smsResult.phoneNumber
    });
    
    if (process.env.MOCK_SMS === 'true') {
      if (smsResult.success && smsResult.smsResponse?.isTestNumber) {
        console.log('   ✅ MOCK_SMS working correctly - SMS was mocked');
      } else {
        console.log('   ❌ MOCK_SMS not working - SMS was not mocked');
      }
    } else {
      console.log('   ℹ️ MOCK_SMS not enabled');
    }
  } catch (error) {
    console.error('   ❌ SMS test failed:', error.message);
  }
  
  // Test MOCK_GENERATE functionality
  console.log('\n2. Testing MOCK_GENERATE functionality...');
  console.log(`   Current MOCK_GENERATE: ${process.env.MOCK_GENERATE || 'undefined'}`);
  
  try {
    const testImagePath = path.join(__dirname, 'deep-image', 'man-sample.png');
    const outputPath = path.join(__dirname, 'test-mock-output.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('   ⚠️ Test image not found, skipping MOCK_GENERATE test');
      return;
    }
    
    console.log('   Starting image generation test...');
    const startTime = Date.now();
    
    const result = await generateSquareImage({
      srcPath: testImagePath,
      dstPath: outputPath,
      prompt: 'Test professional background',
      size: 512
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`   Generation completed in ${duration.toFixed(2)} seconds`);
    
    if (process.env.MOCK_GENERATE === 'true') {
      if (duration < 10) { // Mock should be fast (3-10 seconds)
        console.log('   ✅ MOCK_GENERATE working correctly - fast mock generation');
      } else {
        console.log('   ❌ MOCK_GENERATE not working - took too long for mock');
      }
    } else {
      console.log('   ℹ️ MOCK_GENERATE not enabled - using real API');
    }
    
    // Check if output file exists
    if (fs.existsSync(outputPath)) {
      console.log('   ✅ Output file created successfully');
      // Clean up test file
      fs.unlinkSync(outputPath);
    } else {
      console.log('   ❌ Output file not created');
    }
    
  } catch (error) {
    console.error('   ❌ Image generation test failed:', error.message);
  }
  
  console.log('\n🎯 Mock functionality test completed');
}

// Run the test
testMockFunctionality();
