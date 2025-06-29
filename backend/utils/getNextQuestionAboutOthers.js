const pool = require("../config/database")

/**
 * @typedef {Object} QuestionAboutOthersResult
 * @property {string} question_id - UUID of the question
 * @property {string} question_text - Gender-aware question text with name substitution
 * @property {'choose_one'} question_type - Always 'choose_one' for questions about others
 * @property {string[]} answers - Array of answer options (respects max_answers_to_show)
 * @property {boolean} allow_other - Whether "other" option is allowed
 * @property {'low' | 'medium' | 'high'} sensitivity - Sensitivity level ('low', 'medium', 'high')
 * @property {string} created_at - Timestamp when question was created
 * @property {string} updated_at - Timestamp when question was last updated
 * @property {number} max_answers_to_show - Maximum number of answer options to display
 * @property {string} about_user_id - UUID of the user this question is about
 * @property {string} about_user_name - Name of the user this question is about
 * @property {string} about_user_gender - Gender of the user this question is about
 * @property {string} about_user_image - Image of the user this question is about
 */

/**
 * Gets the next question about other users that hasn't been answered yet in the game.
 * Questions are prioritized by sensitivity (low -> medium -> high) and randomized within each level.
 * The question will be about a user who has already answered questions about themselves.
 * All questions about others are converted to choice format, even if originally free_form.
 * 
 * @param {string} gameId - The UUID of the game
 * @param {string} userId - The UUID of the user who will answer
 * @returns {Promise<QuestionAboutOthersResult|null>} Question object with processed properties or null if no questions available
 */
module.exports.getNextQuestionAboutOthers = async function (gameId, userId) {
  // This query finds questions that other users have answered about themselves,
  // which the current user can now answer about those other users.
  // It ensures we only show questions where:
  // 1. Another user has actually answered this question about themselves
  // 2. The current user hasn't already answered this question about that other user
  // 3. The question is not about the current user themselves
  
  const query = `
    SELECT q.*,                        -- All question fields (question_text, answers, sensitivity, etc.)
           ua_self.about_user_id,      -- ID of the user this question is about
           u.name as about_user_name,  -- Name of the user this question is about
           u.gender as about_user_gender, -- Gender for proper question formatting
           u.image as about_user_image    -- Profile image of the user this question is about
    FROM questions q
    INNER JOIN user_answers ua_self 
      ON ua_self.questionid = q.question_id    -- Match question IDs
      AND ua_self.is_about_me = true           -- Only answers where users answered about themselves
      AND ua_self.gameid = $1                  -- Within this specific game
      AND ua_self.about_user_id != $2          -- Exclude the current user (no self-questions)
    INNER JOIN users u 
      ON u.user_id = ua_self.about_user_id     -- Get user details for the person this question is about
    WHERE NOT EXISTS (
      -- Exclude questions the current user has already answered about this specific other user
      SELECT 1 
      FROM user_answers ua 
      WHERE ua.questionid = q.question_id      -- Same question
        AND ua.answering_user_id = $2          -- Current user was the one answering
        AND ua.about_user_id = ua_self.about_user_id -- About the same target user
        AND ua.gameid = $1                     -- Within the same game
    )
    ORDER BY 
      -- Prioritize questions by sensitivity level (easier questions first for better user experience)
      CASE sensitivity 
        WHEN 'low' THEN 1      -- Ask easier questions first (least sensitive)
        WHEN 'medium' THEN 2   -- Then medium difficulty questions
        WHEN 'high' THEN 3     -- Save sensitive questions for last
        ELSE 4                 -- Handle any unexpected sensitivity values
      END,
      RANDOM()  -- Within same sensitivity level, randomize to keep game interesting
    LIMIT 1     -- Only return one question at a time
  `;
  
  const result = await pool.query(query, [gameId, userId]);
  const rawQuestion = result.rows[0];
  
  if (!rawQuestion) {
    return null;
  }

  // Process the question for gender-aware text and choice format
  const processedQuestion = await processQuestionAboutOthers(rawQuestion);
  return processedQuestion;
}

/**
 * Process a raw question to make it suitable for "about others" format
 * @param {Object} rawQuestion - Raw question from database
 * @returns {Promise<QuestionAboutOthersResult>} Processed question
 */
async function processQuestionAboutOthers(rawQuestion) {
  // Determine question text based on gender with fallback hierarchy
  let questionText;
  if (rawQuestion.about_user_gender === 'female' && rawQuestion.question_about_female) {
    questionText = rawQuestion.question_about_female;
  } else if (rawQuestion.about_user_gender === 'male' && rawQuestion.question_about_male) {
    questionText = rawQuestion.question_about_male;
  } else if (rawQuestion.question_about_male) {
    questionText = rawQuestion.question_about_male;
  } else {
    questionText = rawQuestion.question_text;
  }

  // Replace $1 with the user's name
  questionText = questionText.replace(/\$1/g, rawQuestion.about_user_name);

  // Get the actual answer the target user gave about themselves for this question
  const userActualAnswerResult = await pool.query(`
    SELECT answer 
    FROM user_answers 
    WHERE questionid = $1 AND about_user_id = $2 AND is_about_me = true
    LIMIT 1
  `, [rawQuestion.question_id, rawQuestion.about_user_id]);

  let answers =  rawQuestion.answers || [];
  const maxAnswers = rawQuestion.max_answers_to_show || 4;
  answers = [...answers].slice(0, maxAnswers);
  
  // If we have the user's actual answer, make sure it's included
  if (userActualAnswerResult.rows.length > 0) {
    const actualAnswer = userActualAnswerResult.rows[0].answer;
    
    // Check if the actual answer is already in the list
    if (!answers.includes(actualAnswer)) {
      // Replace a random existing answer with the actual answer
      if (answers.length > 0) {
        const randomIndex = Math.floor(Math.random() * answers.length);
        answers[randomIndex] = actualAnswer;
      } else {
        // If no existing answers, just add it
        answers.push(actualAnswer);
      }
    }
    
    // Shuffle the answers to randomize the position of the correct answer
    answers = answers.sort(() => Math.random() - 0.5);
  }

  return {
    question_id: rawQuestion.question_id,
    question_text: questionText,
    question_type: 'choose_one', // Always choice format for questions about others
    answers: answers,
    allow_other: rawQuestion.allow_other || false,
    sensitivity: rawQuestion.sensitivity,
    created_at: rawQuestion.created_at,
    updated_at: rawQuestion.updated_at,
    max_answers_to_show: rawQuestion.max_answers_to_show,
    about_user_id: rawQuestion.about_user_id,
    about_user_name: rawQuestion.about_user_name,
    about_user_gender: rawQuestion.about_user_gender,
    about_user_image: rawQuestion.about_user_image || '',
  };
}

/**
 * Get count of answers about others (from user_answers table)
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Number of answers about others
 */
module.exports.getAnswersAboutOthersCount = async function (gameId, userId) {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM user_answers 
    WHERE gameid = $1 AND answering_user_id = $2 AND is_about_me = false
  `, [gameId, userId]);
  
  return parseInt(result.rows[0].count);
}
