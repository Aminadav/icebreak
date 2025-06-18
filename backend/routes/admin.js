const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../config/database');

/**
 * Admin route - serves a simple HTML page for journey state management
 * This is a secret URL for managing journey states
 */
router.get('/', (req, res) => {
  // For now, redirect to the frontend admin page
  // In production, you might want to serve a separate admin HTML file
  res.redirect('/#/admin');
});

/**
 * API endpoint to get current device's journey state
 */
router.get('/api/journey-state', async (req, res) => {
  try {
    // This is a simple implementation
    // In a real admin panel, you'd want to specify which device to check
    res.json({
      success: true,
      message: 'Use frontend admin page for journey state management',
      availableStates: [
        'INITIAL',
        'GAME_NAME_ENTRY', 
        'GAME_NAME_SET',
        'PHONE_SUBMITTED',
        'PHONE_VERIFIED',
        'EMAIL_SAVED',
        'NAME_SAVED',
        'GENDER_SELECTION',
        'PICTURE_UPLOAD',
        'CAMERA_ACTIVE',
        'PICTURE_ENHANCEMENT',
        'IMAGE_GALLERY',
        'CREATOR_GAME_READY'
      ]
    });
  } catch (error) {
    console.error('Error in admin API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * API endpoint to get all questions
 */
router.get('/api/questions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT question_id, question_text, question_type, answers, allow_other, sensitivity, created_at, updated_at
      FROM questions
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      questions: result.rows
    });
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * API endpoint to create a new question
 */
router.post('/api/questions', async (req, res) => {
  try {
    const { question_text, question_type, answers, allow_other, sensitivity } = req.body;
    
    // Validation
    if (!question_text || !question_type || !sensitivity) {
      return res.status(400).json({
        success: false,
        error: 'question_text, question_type, and sensitivity are required'
      });
    }
    
    if (!['free_form', 'choose_one'].includes(question_type)) {
      return res.status(400).json({
        success: false,
        error: 'question_type must be either "free_form" or "choose_one"'
      });
    }
    
    if (!['low', 'medium', 'high'].includes(sensitivity)) {
      return res.status(400).json({
        success: false,
        error: 'sensitivity must be "low", "medium", or "high"'
      });
    }
    
    if (question_type === 'choose_one' && (!answers || !Array.isArray(answers) || answers.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'answers array is required for choose_one questions'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO questions (question_text, question_type, answers, allow_other, sensitivity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING question_id, question_text, question_type, answers, allow_other, sensitivity, created_at, updated_at
    `, [question_text, question_type, question_type === 'choose_one' ? JSON.stringify(answers) : null, allow_other || false, sensitivity]);
    
    res.json({
      success: true,
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * API endpoint to update a question
 */
router.put('/api/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question_text, question_type, answers, allow_other, sensitivity } = req.body;
    
    // Validation
    if (!question_text || !question_type || !sensitivity) {
      return res.status(400).json({
        success: false,
        error: 'question_text, question_type, and sensitivity are required'
      });
    }
    
    if (!['free_form', 'choose_one'].includes(question_type)) {
      return res.status(400).json({
        success: false,
        error: 'question_type must be either "free_form" or "choose_one"'
      });
    }
    
    if (!['low', 'medium', 'high'].includes(sensitivity)) {
      return res.status(400).json({
        success: false,
        error: 'sensitivity must be "low", "medium", or "high"'
      });
    }
    
    if (question_type === 'choose_one' && (!answers || !Array.isArray(answers) || answers.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'answers array is required for choose_one questions'
      });
    }
    
    const result = await pool.query(`
      UPDATE questions 
      SET question_text = $1, question_type = $2, answers = $3, allow_other = $4, sensitivity = $5
      WHERE question_id = $6
      RETURNING question_id, question_text, question_type, answers, allow_other, sensitivity, created_at, updated_at
    `, [question_text, question_type, question_type === 'choose_one' ? JSON.stringify(answers) : null, allow_other || false, sensitivity, questionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * API endpoint to delete a question
 */
router.delete('/api/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const result = await pool.query(`
      DELETE FROM questions 
      WHERE question_id = $1
      RETURNING question_id
    `, [questionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
