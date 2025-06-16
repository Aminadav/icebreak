const express = require('express');
const router = express.Router();

// Store original environment variable values
let originalValues = {};
let testingMode = false;

/**
 * Start testing mode - set MOCK_SMS and MOCK_GENERATE to true
 */
router.post('/start', (req, res) => {
  try {
    console.log('🧪 Starting testing mode...');
    
    // Store original values if not already in testing mode
    if (!testingMode) {
      originalValues.MOCK_SMS = process.env.MOCK_SMS || undefined;
      originalValues.MOCK_GENERATE = process.env.MOCK_GENERATE || undefined;
      console.log('📋 Stored original values:', originalValues);
    } else {
      console.log('⚠️ Testing mode already active, keeping current original values');
    }
    
    // Set mock environment variables to true
    process.env.MOCK_SMS = 'true';
    process.env.MOCK_GENERATE = 'true';
    testingMode = true;
    
    console.log('✅ Testing mode activated:');
    console.log(`   MOCK_SMS: ${process.env.MOCK_SMS}`);
    console.log(`   MOCK_GENERATE: ${process.env.MOCK_GENERATE}`);
    
    res.json({
      success: true,
      message: 'Testing mode activated',
      mockSms: process.env.MOCK_SMS,
      mockGenerate: process.env.MOCK_GENERATE,
      testingMode: true,
      originalValues: originalValues
    });
  } catch (error) {
    console.error('❌ Error starting testing mode:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * End testing mode - restore original MOCK_SMS and MOCK_GENERATE values
 */
router.post('/end', (req, res) => {
  try {
    console.log('🔄 Ending testing mode...');
    
    if (testingMode) {
      // Restore original values
      if (originalValues.MOCK_SMS === undefined) {
        delete process.env.MOCK_SMS;
        console.log('   Removed MOCK_SMS (was undefined)');
      } else {
        process.env.MOCK_SMS = originalValues.MOCK_SMS;
        console.log(`   Restored MOCK_SMS to: ${originalValues.MOCK_SMS}`);
      }
      
      if (originalValues.MOCK_GENERATE === undefined) {
        delete process.env.MOCK_GENERATE;
        console.log('   Removed MOCK_GENERATE (was undefined)');
      } else {
        process.env.MOCK_GENERATE = originalValues.MOCK_GENERATE;
        console.log(`   Restored MOCK_GENERATE to: ${originalValues.MOCK_GENERATE}`);
      }
      
      // Clear stored values
      originalValues = {};
      testingMode = false;
      
      console.log('✅ Testing mode deactivated');
    } else {
      console.log('⚠️ Testing mode was not active');
    }
    
    res.json({
      success: true,
      message: testingMode ? 'Testing mode was not active' : 'Testing mode deactivated',
      mockSms: process.env.MOCK_SMS || null,
      mockGenerate: process.env.MOCK_GENERATE || null,
      testingMode: false
    });
  } catch (error) {
    console.error('❌ Error ending testing mode:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get current testing status
 */
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      testingMode,
      mockSms: process.env.MOCK_SMS || null,
      mockGenerate: process.env.MOCK_GENERATE || null,
      originalValues: testingMode ? originalValues : null
    });
  } catch (error) {
    console.error('❌ Error getting testing status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
