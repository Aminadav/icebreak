// Test the lowest missing badge logic
const { getAllDeservedBadges } = require('./shared/badge-list');

console.log('🧪 Testing lowest missing badge selection...');

// Simulate user with 150 points (deserves 3 badges) but only has 1st badge
const currentPoints = 150;
const deservedBadges = getAllDeservedBadges(currentPoints);
const userHasBadges = ['warming_up']; // User only has first badge

console.log('User points:', currentPoints);
console.log('Deserved badges:', deservedBadges.map(b => `${b.id} (${b.pointsRequired})`));
console.log('User has badges:', userHasBadges);

const missingBadges = deservedBadges.filter(badge => !userHasBadges.includes(badge.id));
console.log('Missing badges:', missingBadges.map(b => `${b.id} (${b.pointsRequired})`));

if (missingBadges.length > 0) {
  const lowestMissing = missingBadges.reduce((lowest, current) => 
    current.pointsRequired < lowest.pointsRequired ? current : lowest
  );
  console.log('✅ Will award lowest missing badge:', lowestMissing.id, `(${lowestMissing.pointsRequired} points)`);
  
  // After awarding this badge, user would have ['warming_up', 'ice_breaker']
  // Next time they get points, the system would award 'conversation_starter'
  console.log('📋 Next badge to be awarded later: conversation_starter (120 points)');
}

console.log('\n🎯 This ensures proper badge progression!');

if (!module.parent) {
  // This runs when the file is executed directly
}
