// Quick test of badge system
const { getNewlyEarnedBadge, getCurrentBadge, BADGES } = require('./shared/badge-list');

console.log('🧪 Testing badge system...');

// Test case 1: No badge to first badge (20 -> 30 points)
console.log('\n--- Test 1: First badge (20 -> 30 points) ---');
const newBadge1 = getNewlyEarnedBadge(20, 30);
console.log('Newly earned badge:', newBadge1);

// Test case 2: No badge earned (10 -> 20 points)
console.log('\n--- Test 2: No badge earned (10 -> 20 points) ---');
const newBadge2 = getNewlyEarnedBadge(10, 20);
console.log('Newly earned badge:', newBadge2);

// Test case 3: First to second badge (30 -> 60 points)
console.log('\n--- Test 3: First to second badge (30 -> 60 points) ---');
const newBadge3 = getNewlyEarnedBadge(30, 60);
console.log('Newly earned badge:', newBadge3);

// Test case 4: Current badge tests
console.log('\n--- Test 4: Current badge tests ---');
console.log('Current badge for 0 points:', getCurrentBadge(0));
console.log('Current badge for 30 points:', getCurrentBadge(30));
console.log('Current badge for 60 points:', getCurrentBadge(60));
console.log('Current badge for 1000 points:', getCurrentBadge(1000));

// Test case 5: Badge list
console.log('\n--- Test 5: All badges ---');
BADGES.forEach(badge => {
  console.log(`${badge.id}: ${badge.name} (${badge.pointsRequired} points)`);
});

console.log('\n✅ Badge system test completed!');

if (!module.parent) {
  // This runs when the file is executed directly
}
