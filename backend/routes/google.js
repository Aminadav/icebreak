const express = require('express');
const axios = require('axios');
const pool = require('../config/database');
const router = express.Router();

// Store temporary state for OAuth
const oauthStates = new Map();

// Generate Google OAuth URL
router.post('/login', async (req, res) => {
  try {
    const { gameId, deviceId } = req.body;
    
    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store the state with game and device info
    oauthStates.set(state, { gameId, deviceId, timestamp: Date.now() });
    
    // Build Google OAuth URL
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=' + encodeURIComponent(process.env.GOOGLE_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(process.env.BACKEND_URL + '/api/google/callback') +
      '&response_type=code' +
      '&scope=' + encodeURIComponent('email profile') +
      '&state=' + encodeURIComponent(state);
    
    console.log('🔑 Generated Google OAuth URL for gameId:', gameId);
    
    res.json({ url: googleAuthUrl });
  } catch (error) {
    console.error('❌ Error generating Google OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate Google login URL' });
  }
});

// Handle Google OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Check for OAuth error
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(process.env.FRONTEND_URL + '/error?message=' + encodeURIComponent('Google login failed'));
    }
    
    // Validate state parameter
    const stateData = oauthStates.get(state);
    if (!stateData) {
      console.error('❌ Invalid or expired OAuth state');
      return res.redirect(process.env.FRONTEND_URL + '/error?message=' + encodeURIComponent('Invalid login session'));
    }
    
    // Clean up state
    oauthStates.delete(state);
    
    // Check if state is not too old (10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      console.error('❌ OAuth state expired');
      return res.redirect(process.env.FRONTEND_URL + '/error?message=' + encodeURIComponent('Login session expired'));
    }
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.BACKEND_URL + '/api/google/callback',
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user info from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const { email, name, verified_email } = userResponse.data;
    
    console.log('✅ Google user authenticated:', { email, name, verified_email });
    
    // Find user by device ID and update their email
    if (stateData.deviceId) {
      // Look up user by device ID directly
      const deviceResult = await pool.query('SELECT user_id FROM devices WHERE device_id = $1', [stateData.deviceId]);
      
      if (deviceResult.rows.length > 0) {
        const userId = deviceResult.rows[0].user_id;
        
        // Update user with Google email and name
        await pool.query(
          'UPDATE users SET email = $1, name = $2, email_verified = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
          [email.toLowerCase(), name, verified_email || true, userId]
        );
        
        console.log('✅ Updated user email via Google login:', { userId, email, name });
      } else {
        console.warn('⚠️ No user found for device ID:', stateData.deviceId);
      }
    }
    
    // Redirect to frontend with success
    const redirectUrl = stateData.gameId 
      ? `${process.env.FRONTEND_URL}/game/${stateData.gameId}/player-name`
      : `${process.env.FRONTEND_URL}/game/new/player-name`;
    
    console.log('🚀 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Error in Google OAuth callback:', error);
    res.redirect(process.env.FRONTEND_URL + '/error?message=' + encodeURIComponent('Google login failed'));
  }
});

// Clean up old OAuth states periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(oauthStates.entries());
  for (const [state, data] of entries) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

module.exports = router;
