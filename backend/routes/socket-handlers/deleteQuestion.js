const pool = require('../../config/database');

async function handleDeleteQuestion(socket, data, callback) {
  try {
    const { questionId } = data;
    
    console.log('🗑️ Admin: Deleting question:', questionId);
    
    if (!questionId) {
      const errorResponse = { success: false, message: 'Question ID is required' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    const result = await pool.query(`
      DELETE FROM questions 
      WHERE question_id = $1
      RETURNING question_id
    `, [questionId]);
    
    if (result.rows.length === 0) {
      const errorResponse = { success: false, message: 'Question not found' };
      if (callback) {
        callback(errorResponse);
      } else {
        socket.emit('error', errorResponse);
      }
      return;
    }
    
    console.log('✅ Question deleted successfully:', questionId);
    
    const successResponse = { 
      success: true, 
      message: 'Question deleted successfully',
      questionId: questionId
    };
    
    if (callback) {
      callback(successResponse);
    } else {
      socket.emit('question_deleted', successResponse);
    }
  } catch (error) {
    console.error('❌ Error deleting question:', error);
    const errorResponse = { success: false, message: 'Failed to delete question' };
    
    if (callback) {
      callback(errorResponse);
    } else {
      socket.emit('error', errorResponse);
    }
  }
}

module.exports = handleDeleteQuestion;
