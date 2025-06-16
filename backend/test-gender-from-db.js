const { Pool } = require('pg');

// Test gender fetching from database
async function testGenderFromDatabase() {
  console.log('🧪 Testing gender fetching from database...\n');

  // Create a test database connection
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'icebreak_db',
    user: 'icebreak_user',
    password: 'icebreak123'
  });

  try {
    // Create a test user
    const testUser = await pool.query(`
      INSERT INTO users (phone_number, gender, name, email, created_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING user_id, gender, name
    `, ['+972501234567', 'female', 'Test User', 'test@example.com']);

    const userId = testUser.rows[0].user_id;
    const userGender = testUser.rows[0].gender;
    const userName = testUser.rows[0].name;

    console.log(`✅ Created test user: ID=${userId}, gender=${userGender}, name=${userName}`);

    // Test the gender fetching logic (simulating what happens in socket.js)
    const userResult = await pool.query('SELECT gender FROM users WHERE user_id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found in database');
    }
    
    const fetchedGender = userResult.rows[0].gender;
    
    if (!fetchedGender || !['male', 'female'].includes(fetchedGender)) {
      throw new Error('User gender not set or invalid. Please complete profile setup first.');
    }

    console.log(`✅ Successfully fetched gender from database: ${fetchedGender}`);

    // Test prompt filtering logic
    const fs = require('fs');
    const path = require('path');
    
    const promptsPath = path.join(__dirname, 'deep-image', 'prompts.json');
    const allPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    
    console.log(`📊 Total prompts loaded: ${allPrompts.length}`);
    
    // Filter prompts based on user's gender from database
    const availablePrompts = allPrompts.filter(prompt => 
      prompt.gender === 'both' || prompt.gender === fetchedGender
    );
    
    console.log(`🎯 Available prompts for ${fetchedGender}: ${availablePrompts.length}`);
    
    if (availablePrompts.length < 6) {
      throw new Error(`Not enough prompts available for gender "${fetchedGender}". Found ${availablePrompts.length}, need at least 6.`);
    }

    // Test selection logic
    const firstPrompt = availablePrompts[0];
    const otherPrompts = availablePrompts.slice(1);
    const selectedPrompts = [firstPrompt];
    const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
    selectedPrompts.push(...shuffledOthers.slice(0, 5));
    
    console.log(`✅ Selected ${selectedPrompts.length} prompts for ${fetchedGender}:`);
    selectedPrompts.forEach((p, i) => console.log(`  [${i}] ${p.gender}: ${p.description.substring(0, 50)}...`));

    // Clean up test user
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
    console.log(`🧹 Cleaned up test user: ${userId}`);

    console.log('\n✅ Gender from database test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testGenderFromDatabase();
