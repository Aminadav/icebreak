const { getScreenRules } = require('./routes/socket-handlers/screens_rules');
const moveUserToGameState = require('./routes/socket-handlers/moveUserToGameState');
const { addPointsWithBadgeCheckAndEmit } = require('./utils/points-helper');
const pool = require('./config/database');
const { v4: uuidv4 } = require('uuid');

async function testTwoScreenFlow() {
  console.log('🧪 Testing two-screen flow (GOT_POINTS → GOT_BADGE)...');
  
  // Create test user and game
  const userId = uuidv4();
  const gameId = uuidv4();
  
  // Create fake socket for testing
  const mockSocket = {
    emit: (event, data) => {
      console.log(`📡 Socket emit: ${event}`, data);
    }
  };
  
  try {
    // Setup: Create user and game
    await pool.query('INSERT INTO users (id, phone_number, phone_verified) VALUES ($1, $2, true)', [userId, '+1234567890']);
    await pool.query('INSERT INTO games (id, creator_user_id, status) VALUES ($1, $2, $3)', [gameId, userId, 'waiting']);
    await pool.query('INSERT INTO game_user_state (game_id, user_id, current_screen, metadata) VALUES ($1, $2, $3, $4)', 
      [gameId, userId, 'QUESTION_ABOUT_MYSELF', JSON.stringify({})]);
    
    console.log('\n1️⃣ Step 1: Award 10 points (should show GOT_POINTS)');
    const result = await addPointsWithBadgeCheckAndEmit(userId, gameId, 10, mockSocket);
    console.log('Points result:', result);
    
    console.log('\n2️⃣ Step 2: Simulate user clicking continue from GOT_POINTS');
    const { getScreenRules } = require('./routes/socket-handlers/screens_rules');
    const screenRules = getScreenRules(gameId, userId);
    
    // Find the badge rule
    const badgeRule = screenRules.find(rule => rule.ruleName === 'Check for missing badges');
    if (badgeRule && badgeRule.condition) {
      const shouldShowBadge = await badgeRule.condition();
      console.log('Should show badge screen:', shouldShowBadge);
      
      if (shouldShowBadge) {
        const badgeScreen = await badgeRule.onScreen();
        console.log('Badge screen result:', badgeScreen);
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await pool.query('DELETE FROM badges WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_points WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM game_user_state WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM games WHERE id = $1', [gameId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTwoScreenFlow()
    .then(() => {
      console.log('🎯 Test script finished');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testTwoScreenFlow };
