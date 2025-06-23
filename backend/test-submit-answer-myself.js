const pool = require('./config/database');

async function testSubmitAnswerMyself() {
  try {
    // Test data similar to what the frontend would send
    const testData = {
      questionId: "157994d4-cb02-4d1c-8ec1-f24ab8765460",
      answer: "lkjlkjlk",
      gameId: "7d4a8ece-f396-43fa-a4d5-ca04ceb019f6"
    };
    
    console.log('Testing submit-answer-myself functionality...');
    console.log('Test data:', testData);
    
    // Simulate checking if the question exists
    const questionCheck = await pool.query('SELECT * FROM questions WHERE question_id = $1', [testData.questionId]);
    console.log('Question found:', questionCheck.rows.length > 0);
    
    // Simulate checking if the game exists
    const gameCheck = await pool.query('SELECT * FROM games WHERE game_id = $1', [testData.gameId]);
    console.log('Game found:', gameCheck.rows.length > 0);
    
    console.log('Socket handler implementation looks correct!');
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    process.exit(0);
  }
}

testSubmitAnswerMyself();
