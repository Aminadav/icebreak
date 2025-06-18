const pool = require('../../config/database');

// Helper function to send response
function sendResponse(socket, callback, response, eventName = null) {
  if (callback) {
    callback(response);
  } else if (eventName) {
    socket.emit(eventName, response);
  } else {
    socket.emit(response.success ? 'question_saved' : 'error', response);
  }
}

// Helper function to validate question data
function validateQuestionData(data, isUpdate = false) {
  const { questionId, questionText, questionType, answers, sensitivity, maxAnswersToShow } = data;
  
  // For updates, questionId is required
  if (isUpdate && !questionId) {
    return { isValid: false, message: 'Question ID is required for updates' };
  }
  
  // For new questions, questionId should not be provided
  if (!isUpdate && questionId) {
    return { isValid: false, message: 'Question ID should not be provided for new questions' };
  }
  
  if (!questionText || !questionType || !sensitivity) {
    return { isValid: false, message: 'Missing required fields: questionText, questionType, sensitivity' };
  }
  
  // Validate question type
  if (!['free_form', 'choose_one'].includes(questionType)) {
    return { isValid: false, message: 'Invalid question type. Must be free_form or choose_one' };
  }
  
  // Validate sensitivity
  if (!['low', 'medium', 'high'].includes(sensitivity)) {
    return { isValid: false, message: 'Invalid sensitivity level. Must be low, medium, or high' };
  }
  
  // Validate maxAnswersToShow
  if (maxAnswersToShow && (typeof maxAnswersToShow !== 'number' || maxAnswersToShow < 1 || maxAnswersToShow > 20)) {
     console.log(maxAnswersToShow)
     console.log(typeof maxAnswersToShow)
    return { isValid: false, message: 'maxAnswersToShow must be a number between 1 and 20' };
  }
  
  // For multiple choice, ensure answers are provided
  if (questionType === 'choose_one' && (!answers || answers.length === 0)) {
    return { isValid: false, message: 'Multiple choice questions require answers' };
  }
  
  return { isValid: true };
}

async function handleSaveOrUpdateQuestion(socket, data, callback) {
  try {
    data.maxAnswersToShow =parseInt(data.maxAnswersToShow)
    var { questionId, questionText, questionType, answers, allowOther, sensitivity, maxAnswersToShow } = data;
    maxAnswersToShow=parseInt(maxAnswersToShow)
    const isUpdate = !!questionId;

    console.log(`📝 Admin: ${isUpdate ? 'Updating' : 'Creating'} question${isUpdate ? ': ' + questionId : ''}`);
// Validate input data
const validation = validateQuestionData(data, isUpdate);
if (!validation.isValid) {
  console.log(`❌ Validation error: ${validation.message} + ${maxAnswersToShow} ${typeof maxAnswersToShow}`);
  const errorResponse = { success: false, message: validation.message };
  sendResponse(socket, callback, errorResponse);
  return;
}
console.log(1)

const query = isUpdate
? `UPDATE questions SET question_text = $1, question_type = $2, answers = $3, allow_other = $4, sensitivity = $5, max_answers_to_show = $6 WHERE question_id = $7 RETURNING question_id, question_text, question_type, answers, allow_other, sensitivity, max_answers_to_show, created_at`
: `INSERT INTO questions (question_text, question_type, answers, allow_other, sensitivity, max_answers_to_show) VALUES ($1, $2, $3, $4, $5, $6) RETURNING question_id, question_text, question_type, answers, allow_other, sensitivity, max_answers_to_show, created_at`;

const maxAnswers = maxAnswersToShow || 4; // Default to 4 if not provided
console.log(1)

    const params = isUpdate
      ? [questionText, questionType, questionType === 'choose_one' ? JSON.stringify(answers) : null, questionType === 'choose_one' ? (allowOther || false) : false, sensitivity, maxAnswers, questionId]
      : [questionText, questionType, questionType === 'choose_one' ? JSON.stringify(answers) : null, questionType === 'choose_one' ? (allowOther || false) : false, sensitivity, maxAnswers];

    const result = await pool.query(query, params);
    console.log(result)

    if (isUpdate && result.rows.length === 0) {
      const errorResponse = { success: false, message: 'Question not found' };
      sendResponse(socket, callback, errorResponse);
      return;
    }

    const savedQuestion = result.rows[0];
    console.log(`✅ Question ${isUpdate ? 'updated' : 'created'} successfully:`, savedQuestion.question_id);

    const successResponse = {
      success: true,
      message: isUpdate ? 'Question updated successfully' : 'Question created successfully',
      question: savedQuestion,
      isUpdate
    };

    sendResponse(socket, callback, successResponse, isUpdate ? 'question_updated' : 'question_created');
  } catch (error) {
    console.error(`❌ Error ${data.questionId ? 'updating' : 'creating'} question:`, error);
    const errorResponse = {
      success: false,
      message: `Failed to ${data.questionId ? 'update' : 'create'} question`
    };

    sendResponse(socket, callback, errorResponse);
  }
}

module.exports = handleSaveOrUpdateQuestion;
