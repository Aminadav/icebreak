const pool = require("../config/database")

/**
 * Gets the next question about yourself that hasn't been answered yet in the game.
 * Questions are prioritized by sensitivity (low -> medium -> high) and randomized within each level.
 * 
 * @param {string} gameId - The UUID of the game
 * @param {string} userId - The UUID of the user
 * @returns {Promise<Object|null>} Question object with properties:
 *   - question_id: UUID of the question
 *   - question_text: The actual question text
 *   - question_type: Type of question ('freeform' or 'choose')
 *   - answers: JSONB array of possible answers (for choose type)
 *   - allow_other: Boolean if "other" option is allowed
 *   - sensitivity: Sensitivity level ('low', 'medium', 'high')
 *   - created_at: Timestamp when question was created
 *   - updated_at: Timestamp when question was last updated
 *   - max_answers_to_show: Maximum number of answer options to display
 *   Returns null if no unanswered questions remain.
 */
module.exports.getNextQuestionAboutYou = async function (gameId, userId) {
  const query = `
    SELECT q.*
    FROM questions q
    WHERE NOT EXISTS (
      -- Check if user has already answered this question about themselves in this game
      -- answering_user_id = about_user_id = userId means "question about yourself"
      SELECT 1 
      FROM user_answers ua 
      WHERE ua.questionid = q.question_id 
        AND ua.answering_user_id = $2  -- User who answered
        AND ua.about_user_id = $2      -- User the question is about (same = about yourself)
        AND ua.gameid = $1             -- Within this specific game
    )
    ORDER BY 
      -- Prioritize questions by sensitivity level (low sensitivity first)
      CASE q.sensitivity 
        WHEN 'low' THEN 1      -- Ask easier questions first
        WHEN 'medium' THEN 2   -- Then medium difficulty
        WHEN 'high' THEN 3     -- Save sensitive questions for last
        ELSE 4                 -- Handle any unexpected values
      END,
      RANDOM()  -- Within same sensitivity level, pick randomly
    LIMIT 1     -- Only return one question
  `;
  
  const result = await pool.query(query, [gameId, userId]);
  return result.rows[0] || null;
}