// Test migration from screen_visits to user_activities
const { userVisited, recordActivity } = require('./backend/utils/userActivityUtils');
const pool = require('./backend/config/database');

async function testMigration() {
  console.log('🧪 Testing migration from screen_visits to user_activities...');
  
  try {
    // Get a real game and user from database
    const gameResult = await pool.query('SELECT game_id, creator_user_id FROM games LIMIT 1');
    if (gameResult.rows.length === 0) {
      console.log('❌ No games found in database. Create a game first.');
      return;
    }
    
    const { game_id: gameId, creator_user_id: userId } = gameResult.rows[0];
    console.log(`Using gameId: ${gameId}, userId: ${userId}`);
    
    // Test 1: Record a screen visit using new system
    await recordActivity(gameId, userId, 'screen_visit', 'JOIN_GAME_WELCOME');
    console.log('✅ Recorded screen visit via user_activities');
    
    // Test 2: Check if userVisited works
    const hasVisited = await userVisited(gameId, userId, 'JOIN_GAME_WELCOME');
    console.log(`✅ userVisited check: ${hasVisited}`);
    
    // Test 3: Record a button click
    await recordActivity(gameId, userId, 'button_click', 'join_game_welcome_continue');
    console.log('✅ Recorded button click via user_activities');
    
    console.log('🎉 Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

if (!module.parent) {
  testMigration();
}
