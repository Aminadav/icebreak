const pool = require('../../config/database');

async function handleAddQuestion(socket, data, callback) {
  try {
    const { questionText, questionType, answers, allowOther, sensitivity } = data;
    
    console.log('📝 Admin: Adding new question:', { questionText, questionType, sensitivity });
    
    if (!questionText || !questionType || !sensitivity) {
      const errorResponse = { success: false, message: 'Missing required fields' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    // Validate question type
    if (!['free_form', 'choose_one'].includes(questionType)) {
      const errorResponse = { success: false, message: 'Invalid question type' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    // Validate sensitivity
    if (!['low', 'medium', 'high'].includes(sensitivity)) {
      const errorResponse = { success: false, message: 'Invalid sensitivity level' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    // For multiple choice, ensure answers are provided
    if (questionType === 'choose_one' && (!answers || answers.length === 0)) {
      const errorResponse = { success: false, message: 'Multiple choice questions require answers' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    const result = await pool.query(`
      INSERT INTO questions (question_text, question_type, answers, allow_other, sensitivity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING question_id, question_text, question_type, answers, allow_other, sensitivity, created_at
    `, [
      questionText,
      questionType,
      questionType === 'choose_one' ? JSON.stringify(answers) : null,
      questionType === 'choose_one' ? (allowOther || false) : false,
      sensitivity
    ]);
    
    const newQuestion = result.rows[0];
    console.log('✅ Question added successfully:', newQuestion.question_id);
    
    const successResponse = { 
      success: true, 
      message: 'Question added successfully',
      question: newQuestion
    };
    
    if (callback) {
      callback(successResponse);
    } else {
      socket.emit('question_added', successResponse);
    }
  } catch (error) {
    console.error('❌ Error adding question:', error);
    const errorResponse = { success: false, message: 'Failed to add question' };
    
    if (callback) {
      callback(errorResponse);
    } else {
      socket.emit('error', errorResponse);
    }
  }
}

module.exports = handleAddQuestion;
