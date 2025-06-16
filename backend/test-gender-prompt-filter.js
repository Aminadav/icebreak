const fs = require('fs');
const path = require('path');

// Test gender-based prompt filtering
function testGenderPromptFiltering() {
  console.log('🧪 Testing gender-based prompt filtering...\n');

  // Load prompts
  const promptsPath = path.join(__dirname, 'deep-image', 'prompts.json');
  const allPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));

  console.log(`📊 Total prompts loaded: ${allPrompts.length}`);
  console.log(`📋 All prompts:`, allPrompts.map(p => `${p.gender}: ${p.description.substring(0, 40)}...`));
  console.log();

  // Test male filtering
  const malePrompts = allPrompts.filter(prompt => 
    prompt.gender === 'both' || prompt.gender === 'male'
  );
  console.log(`👨 Male prompts (${malePrompts.length}):`);
  malePrompts.forEach((p, i) => console.log(`  [${i}] ${p.gender}: ${p.description.substring(0, 60)}...`));
  console.log();

  // Test female filtering
  const femalePrompts = allPrompts.filter(prompt => 
    prompt.gender === 'both' || prompt.gender === 'female'
  );
  console.log(`👩 Female prompts (${femalePrompts.length}):`);
  femalePrompts.forEach((p, i) => console.log(`  [${i}] ${p.gender}: ${p.description.substring(0, 60)}...`));
  console.log();

  // Test selection logic (6 prompts)
  console.log('🎯 Testing selection logic for male:');
  if (malePrompts.length >= 6) {
    const firstPrompt = malePrompts[0];
    const otherPrompts = malePrompts.slice(1);
    const selectedPrompts = [firstPrompt];
    const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
    selectedPrompts.push(...shuffledOthers.slice(0, 5));
    
    console.log(`  Selected ${selectedPrompts.length} prompts:`);
    selectedPrompts.forEach((p, i) => console.log(`    [${i}] ${p.gender}: ${p.description.substring(0, 50)}...`));
  } else {
    console.log(`  ❌ Not enough prompts for male (${malePrompts.length} < 6)`);
  }
  console.log();

  console.log('🎯 Testing selection logic for female:');
  if (femalePrompts.length >= 6) {
    const firstPrompt = femalePrompts[0];
    const otherPrompts = femalePrompts.slice(1);
    const selectedPrompts = [firstPrompt];
    const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
    selectedPrompts.push(...shuffledOthers.slice(0, 5));
    
    console.log(`  Selected ${selectedPrompts.length} prompts:`);
    selectedPrompts.forEach((p, i) => console.log(`    [${i}] ${p.gender}: ${p.description.substring(0, 50)}...`));
  } else {
    console.log(`  ❌ Not enough prompts for female (${femalePrompts.length} < 6)`);
  }

  console.log('\n✅ Gender prompt filtering test completed!');
}

testGenderPromptFiltering();
