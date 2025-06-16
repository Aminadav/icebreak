const express = require('express');
const router = express.Router();
const path = require('path');

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

module.exports = router;
