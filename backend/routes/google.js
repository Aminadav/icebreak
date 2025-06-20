const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios').default;

// Store pending OAuth requests (in production, use Redis or database)
const pendingOAuthRequests = new Map();

// Generate Google OAuth URL
router.post('/auth', async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Generate state parameter for security
    const state = generateRandomState();
    
    // Store the device ID with the state for later verification
    pendingOAuthRequests.set(state, {
      deviceId,
      timestamp: Date.now()
    });

    // Clean up old requests (older than 10 minutes)
    cleanupOldRequests();

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/api/google/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `state=${state}`;

    console.log('🔗 Generated Google auth URL for device:', deviceId);
    res.json({ authUrl });

  } catch (error) {
    console.error('❌ Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle Google OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4001'}?error=oauth_error`);
    }

    if (!code || !state) {
      console.error('❌ Missing code or state in OAuth callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4001'}?error=missing_params`);
    }

    // Verify state and get device ID
    const pendingRequest = pendingOAuthRequests.get(state);
    if (!pendingRequest) {
      console.error('❌ Invalid or expired OAuth state:', state);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4001'}?error=invalid_state`);
    }

    const { deviceId } = pendingRequest;
    pendingOAuthRequests.delete(state); // Clean up used state

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.BACKEND_URL}/api/google/callback`
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    const { email, name, verified_email } = userResponse.data;

    console.log('✅ Google user info:', { email, name, verified_email });

    // Find or create user with this email
    let user;
    const existingUser = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (existingUser.rows.length > 0) {
      // Update existing user
      user = existingUser.rows[0];
      await pool.query(
        'UPDATE users SET name = $1, email_verified = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
        [name, true, user.user_id]
      );
      console.log('✅ Updated existing user with Google info:', user.user_id);
    } else {
      // Create new user
      const newUserResult = await pool.query(
        'INSERT INTO users (email, name, email_verified, phone_verified) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name, true, false]
      );
      user = newUserResult.rows[0];
      console.log('✅ Created new user with Google info:', user.user_id);
    }

    // Associate device with this user
    await pool.query(
      'UPDATE devices SET user_id = $1, last_seen = CURRENT_TIMESTAMP WHERE device_id = $2',
      [user.user_id, deviceId]
    );

    console.log('✅ Associated device with user:', { deviceId, userId: user.user_id });

    // Redirect back to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
    res.redirect(`${frontendUrl}?google_login=success`);

  } catch (error) {
    console.error('❌ Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
    res.redirect(`${frontendUrl}?error=oauth_callback_failed`);
  }
});

// Helper functions
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function cleanupOldRequests() {
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  pendingOAuthRequests.forEach((request, state) => {
    if (request.timestamp < tenMinutesAgo) {
      pendingOAuthRequests.delete(state);
    }
  });
}

module.exports = router;
