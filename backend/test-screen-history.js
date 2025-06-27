const { getSeenScreenCount, hasSeenScreen, getAnswersAboutMyselfCount } = require('./utils/screenHistoryUtils');
const pool = require('./config/database');

// Test the new screen history functions
async function testScreenHistory() {
  console.log('🧪 Testing screen history functions...');
  
  try {
    // Test with a sample game and user (replace with actual IDs)
    const gameId = '00000000-0000-0000-0000-000000000000'; // placeholder
    const userId = '00000000-0000-0000-0000-000000000000'; // placeholder
    
    console.log('📊 Testing getSeenScreenCount...');
    const gameReadyCount = await getSeenScreenCount(gameId, userId, 'CREATOR_GAME_READY');
    console.log(`Game Ready seen: ${gameReadyCount} times`);
    
    console.log('✅ Testing hasSeenScreen...');
    const hasSeenGameReady = await hasSeenScreen(gameId, userId, 'CREATOR_GAME_READY');
    console.log(`Has seen Game Ready: ${hasSeenGameReady}`);
    
    console.log('🙋 Testing getAnswersAboutMyselfCount...');
    const answersCount = await getAnswersAboutMyselfCount(gameId, userId);
    console.log(`Answers about myself: ${answersCount}`);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

if (require.main === module) {
  testScreenHistory();
}

module.exports = { testScreenHistory };
