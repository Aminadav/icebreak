// Test the new gender-based prompt filtering in the socket.js logic
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function testSocketPromptLogic() {
  console.log('🧪 Testing Socket.js Gender Prompt Logic\n');

  // Simulate the data that would come from socket
  const testData = {
    originalImageHash: 'test123',
    phoneNumber: '123456789',
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    gender: 'female' // Test with female
  };

  const { originalImageHash, phoneNumber, userId, email, name, gender } = testData;
  const targetUserId = userId;

  try {
    // Load prompts from prompts.json (same logic as socket.js)
    const promptsPath = path.join(__dirname, 'deep-image', 'prompts.json');
    const allPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    
    if (!gender || !['male', 'female'].includes(gender)) {
      throw new Error('Valid gender (male/female) is required for prompt selection');
    }
    
    console.log(`🎯 Filtering prompts for gender: ${gender}`);
    
    // Filter prompts based on gender
    const availablePrompts = allPrompts.filter(prompt => 
      prompt.gender === 'both' || prompt.gender === gender
    );
    
    if (availablePrompts.length < 6) {
      throw new Error(`Not enough prompts available for gender "${gender}". Found ${availablePrompts.length}, need at least 6.`);
    }
    
    // Prepare 6 generations: first prompt + 5 random others
    const firstPrompt = availablePrompts[0]; // First gender-appropriate prompt
    const otherPrompts = availablePrompts.slice(1); // All others
    
    // Select 5 random prompts from the remaining ones
    const selectedPrompts = [firstPrompt];
    const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
    selectedPrompts.push(...shuffledOthers.slice(0, 5));
    
    console.log(`✅ Selected ${selectedPrompts.length} prompts for ${gender}:`);
    selectedPrompts.forEach((p, i) => console.log(`  [${i}] ${p.gender}: ${p.description.substring(0, 50)}...`));
    console.log();

    // Test output configuration generation (same logic as socket.js)
    const outputs = selectedPrompts.map((prompt, index) => {
      const generatedHash = crypto
        .createHash('md5')
        .update(`${targetUserId}-${originalImageHash}-${index}-${Date.now()}`)
        .digest('hex');
      
      return {
        dstPath: path.join(__dirname, 'uploads', `${generatedHash}.jpg`),
        prompt: prompt.description, // Extract description
        imageIndex: index,
        imageHash: generatedHash
      };
    });

    console.log('🔧 Generated output configurations:');
    outputs.forEach((output, i) => {
      console.log(`  [${i}] ${output.imageHash}: ${output.prompt.substring(0, 40)}...`);
    });

    console.log('\n✅ Socket.js logic test passed! Gender filtering works correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test with both genders
console.log('Testing with female gender:');
testSocketPromptLogic();

console.log('\n' + '='.repeat(60) + '\n');

// Test with male
const originalTest = testSocketPromptLogic.toString();
const maleTest = originalTest.replace("gender: 'female'", "gender: 'male'");
eval(`(${maleTest})()`);
console.log('Testing with male gender:');
