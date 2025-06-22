const Mixpanel = require('mixpanel');

// Initialize Mixpanel with your token
const mixpanel = Mixpanel.init('32445553c072c19d7321126a69a26731');

/**
 * Send tracking event to Mixpanel
 * @param {Object} eventData - The event data to send
 * @param {string} eventData.trackingId - The tracking ID (event name)
 * @param {string} eventData.deviceId - Device identifier
 * @param {string|null} eventData.userId - User identifier (if logged in)
 * @param {string} eventData.timestamp - Event timestamp
 * @param {string} eventData.socketId - Socket connection ID
 * @param {Object} eventData.properties - Additional event properties
 */
async function sendToMixpanel(eventData) {
  try {
    const { trackingId, deviceId, userId, timestamp, socketId, ...properties } = eventData;
    
    // Prepare the event properties
    const eventProperties = {
      // Core identifiers
      device_id: deviceId,
      user_id: userId,
      socket_id: socketId,
      
      // Event metadata
      timestamp: timestamp,
      platform: 'web',
      app_version: process.env.APP_VERSION || '1.0.0',
      
      // Additional properties from the event
      ...properties
    };
    
    // Use distinct_id as deviceId (or userId if available)
    const distinctId = userId || deviceId;
    
    if (!distinctId) {
      console.warn('⚠️ Mixpanel: No distinct_id available for event:', trackingId);
      return { success: false, error: 'No distinct_id available' };
    }
    
    // console.log(`📊 Sending to Mixpanel: ${trackingId} for ${distinctId}`);
    // console.log('📊 Event properties:', JSON.stringify(eventProperties, null, 2));
    
    // Send event to Mixpanel
    try {
      // Track event without callback
      mixpanel.track(trackingId, {
        ...eventProperties,
        distinct_id: distinctId
      });
      
      // If user is logged in, also update user profile
      if (userId) {
        mixpanel.people.set(userId, {
          $last_seen: new Date(),
          device_id: deviceId,
          last_event: trackingId
        });
      }
      
      // console.log(`✅ Mixpanel event sent: ${trackingId}`);
      return { success: true };
      
    } catch (trackError) {
      console.error('❌ Mixpanel track error:', trackError);
      return { success: false, error: trackError.message };
    }
    
  } catch (error) {
    console.error('❌ Mixpanel error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set user profile in Mixpanel when user registers/logs in
 * @param {string} userId - User ID
 * @param {Object} userProperties - User properties to set
 */
async function setUserProfile(userId, userProperties) {
  try {
    console.log(`👤 Setting Mixpanel user profile for: ${userId}`);
    
    const profileData = {
      $first_name: userProperties.firstName || '',
      $phone: userProperties.phoneNumber || '',
      $created: userProperties.createdAt || new Date(),
      device_count: userProperties.deviceCount || 1,
      games_created: userProperties.gamesCreated || 0,
      ...userProperties
    };
    
    mixpanel.people.set(userId, profileData);
    
    console.log(`✅ Mixpanel user profile set for: ${userId}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Mixpanel user profile error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track user login event
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @param {Object} additionalProperties - Additional properties
 */
async function trackLogin(userId, deviceId, additionalProperties = {}) {
  return sendToMixpanel({
    trackingId: 'user_login',
    userId,
    deviceId,
    timestamp: new Date().toISOString(),
    ...additionalProperties
  });
}

/**
 * Track user registration event
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @param {string} phoneNumber - User's phone number
 * @param {Object} additionalProperties - Additional properties
 */
async function trackRegistration(userId, deviceId, phoneNumber, additionalProperties = {}) {
  return sendToMixpanel({
    trackingId: 'user_registration',
    userId,
    deviceId,
    timestamp: new Date().toISOString(),
    phone_number: phoneNumber,
    ...additionalProperties
  });
}

module.exports = {
  sendToMixpanel,
  setUserProfile,
  trackLogin,
  trackRegistration
};
