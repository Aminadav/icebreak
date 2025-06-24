
const { sendToMixpanel } = require('../../utils/mixpanelService');
const { getUserIdFromDevice } = require('./utils');

module.exports.registerTrackEventHandler = async function(socket) {
  socket.on('trackEvent', async (data) => {
    try {
      const { trackingId, deviceId, timestamp, ...eventData } = data;
      
      if (!trackingId) {
        // console.warn('⚠️ Tracking event missing trackingId');
        return;
      }

      // Security: Always derive userId from deviceId, never trust client
      const actualDeviceId = deviceId || socket.deviceId;
      const actualUserId = await getUserIdFromDevice(actualDeviceId);

      const trackingEventData = {
        trackingId,
        deviceId: actualDeviceId,
        userId: actualUserId,
        timestamp: timestamp || new Date().toISOString(),
        socketId: socket.id,
        ...eventData
      };

      // console.log('📊 Tracking Event:', JSON.stringify(trackingEventData, null, 2));
      
      // שליחה ל-Mixpanel
      const mixpanelResult = await sendToMixpanel(trackingEventData);
      if (mixpanelResult.success) {
        // console.log('✅ Event sent to Mixpanel successfully');
      } else {
        console.error('❌ Failed to send event to Mixpanel:', mixpanelResult.error);
      }
      
    } catch (error) {
      console.error('Error processing tracking event:', error);
    }
  });
};
