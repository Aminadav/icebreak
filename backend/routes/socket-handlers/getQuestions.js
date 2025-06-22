const pool = require('../../config/database');

module.exports.registerGetQuestionsHandler = async function(socket) {
  socket.on('get_questions', async (data, callback) => {
    try {
      console.log('📝 Admin: Getting all questions');
      
      const result = await pool.query(`
        SELECT 
          question_id,
          question_text,
          question_type,
          answers,
          allow_other,
          sensitivity,
          max_answers_to_show,
          created_at
        FROM questions 
        ORDER BY created_at DESC
      `);
      
      const questions = result.rows;
      console.log(`📝 Found ${questions.length} questions`);
      
      if (callback) {
        callback({ success: true, questions });
      } else {
        socket.emit('questions_list', { success: true, questions });
      }
    } catch (error) {
      console.error('❌ Error getting questions:', error);
      const errorResponse = { success: false, message: 'Failed to load questions' };
      
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
    }
  });
};
