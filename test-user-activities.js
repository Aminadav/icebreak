// Test the user activity functions
const { userDidActivity, userVisited, userClicked, recordActivity } = require('./backend/utils/userActivityUtils');

async function testUserActivities() {
  const testGameId = '12345678-1234-1234-1234-123456789012';
  const testUserId = '87654321-4321-4321-4321-210987654321';
  
  console.log('🧪 Testing user activity functions...');
  
  // Test 1: Check if user has not clicked button (should be false initially)
  const hasNotClicked = await userDidActivity(testGameId, testUserId, 'button_click', 'join_game_welcome_continue');
  console.log('1. User has clicked join_game_welcome_continue:', hasNotClicked);
  
  // Test 2: Record the activity
  await recordActivity(testGameId, testUserId, 'button_click', 'join_game_welcome_continue');
  console.log('2. ✅ Recorded button click activity');
  
  // Test 3: Check again (should be true now)
  const hasClickedNow = await userDidActivity(testGameId, testUserId, 'button_click', 'join_game_welcome_continue');
  console.log('3. User has clicked join_game_welcome_continue:', hasClickedNow);
  
  // Test 4: Test the convenience functions
  const visitedScreen = await userVisited(testGameId, testUserId, 'JOIN_GAME_WELCOME');
  console.log('4. User visited JOIN_GAME_WELCOME screen:', visitedScreen);
  
  const clickedButton = await userClicked(testGameId, testUserId, 'join_game_welcome_continue');
  console.log('5. User clicked join_game_welcome_continue button:', clickedButton);
  
  console.log('🎉 All tests completed!');
}

if (!module.parent) {
  testUserActivities().catch(console.error);
}
