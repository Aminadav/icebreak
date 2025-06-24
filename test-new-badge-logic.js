// Test the new badge checking approach
const { getAllDeservedBadges, BADGES } = require('./shared/badge-list');

console.log('🧪 Testing new badge checking approach...');

// Test cases
const testCases = [
  { points: 0, expected: [] },
  { points: 30, expected: ['warming_up'] },
  { points: 60, expected: ['warming_up', 'ice_breaker'] },
  { points: 150, expected: ['warming_up', 'ice_breaker', 'conversation_starter'] },
  { points: 1000, expected: ['warming_up', 'ice_breaker', 'conversation_starter', 'walking_inspiration', 'human_lighthouse'] }
];

testCases.forEach(({ points, expected }) => {
  console.log(`\n--- Test: ${points} points ---`);
  const deserved = getAllDeservedBadges(points);
  console.log('Deserved badges:', deserved.map(b => b.id));
  console.log('Expected:', expected);
  
  const isCorrect = JSON.stringify(deserved.map(b => b.id)) === JSON.stringify(expected);
  console.log(isCorrect ? '✅ Correct' : '❌ Incorrect');
});

// Test missing badge logic
console.log('\n--- Test: Missing Badge Logic ---');
const userHas = ['warming_up']; // User has first badge
const deserves = getAllDeservedBadges(150); // But deserves 3 badges
const missing = deserves.filter(badge => !userHas.includes(badge.id));

console.log('User has:', userHas);
console.log('User deserves:', deserves.map(b => b.id));
console.log('Missing badges:', missing.map(b => b.id));

if (missing.length > 0) {
  const highest = missing.reduce((highest, current) => 
    current.pointsRequired > highest.pointsRequired ? current : highest
  );
  console.log('Highest missing badge to award:', highest.id, `(${highest.pointsRequired} points)`);
}

console.log('\n✅ New badge checking logic verified!');

if (!module.parent) {
  // This runs when the file is executed directly
}
