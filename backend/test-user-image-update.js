const User = require('./models/User');

async function testUserImageUpdate() {
  try {
    console.log('🧪 Testing user image update functionality...');
    
    // Using a real user ID from the database for testing
    const testUserId = '2754e5c3-5361-41d8-a11a-a4b40a55fd20'; // Real user ID from database
    const testImageHash = 'selected-image-hash-67890';
    
    console.log(`📸 Attempting to update image for user: ${testUserId}`);
    console.log(`🖼️ Using image hash: ${testImageHash}`);
    
    const result = await User.updateUserImage(testUserId, testImageHash);
    
    if (result.success) {
      console.log('✅ User image update successful!');
      console.log('📄 Updated user data:', result.user);
      console.log('💬 Message:', result.message);
    } else {
      console.log('❌ User image update failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test failed with error:', error.message);
  }
  
  process.exit(0);
}

// Run the test
testUserImageUpdate();
