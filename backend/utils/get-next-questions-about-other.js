const pool = require("../config/database")

/**
 * Gets the next question for a user in a specific game using intelligent selection logic.
 * 
 * Sorting Priority:
 * 1. Questions the user hasn't seen yet (already_displayed = 0)
 * 2. Questions seen the least number of times by this user
 * 3. Among questions with the same display count, prioritize incorrectly answered ones
 * 4. Randomize questions that have the same display count and incorrect count
 * 
 * @param {string} gameId - UUID of the game
 * @param {string} userId - UUID of the user
 * @returns {Promise<Object|null>} Question object with the following fields:
 *   - question_id: UUID of the question
 *   - question_text: The question text
 *   - question_type: Type of question (e.g., 'multiple_choice')
 *   - answers: JSONB array of possible answers
 *   - allow_other: Boolean indicating if "other" option is allowed
 *   - sensitivity: Sensitivity level of the question
 *   - created_at: When the question was created
 *   - updated_at: When the question was last updated
 *   - max_answers_to_show: Maximum number of answers to display
 *   - already_displayed: Number of times this user has seen this question
 *   - incorrect_count: Number of times this user answered incorrectly
 * Returns null if no questions are available.
 */
module.exports.getNextQuestionAboutOther = async function (gameId, userId) {
  const result = await pool.query(`
    -- Select questions with user's answer statistics
    SELECT 
      q.*,
      COALESCE(ua.display_count, 0) as already_displayed,
      COALESCE(ua.incorrect_count, 0) as incorrect_count
    FROM questions q
    -- Left join to get user's answer history for each question
    LEFT JOIN (
      SELECT 
        questionid,
        COUNT(*) as display_count,                                    -- How many times user saw this question
        SUM(CASE WHEN is_correct = false THEN 1 ELSE 0 END) as incorrect_count  -- How many times answered incorrectly
      FROM user_answers 
      WHERE userid = $1 AND gameid = $2                              -- Filter by specific user and game
      GROUP BY questionid
    ) ua ON q.question_id = ua.questionid
    ORDER BY 
      already_displayed ASC,    -- Priority 1: Questions user hasn't seen (0 count) come first
      incorrect_count DESC,     -- Priority 2: Among same display count, prioritize incorrectly answered questions
      RANDOM()                  -- Priority 3: Randomize questions with same display count and incorrect count
    LIMIT 1                     -- Return only one question
  `, [userId, gameId]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}