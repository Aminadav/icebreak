const { recordActivity } = require("../../utils/userActivityUtils");
const { getUserIdFromDevice } = require("./utils");

async function trackActivity(socket, data) {
  try {
    const { gameId, activityType, activityName } = data;
    const userId = await getUserIdFromDevice(socket.deviceId);

    if (!gameId || !activityType || !activityName) {
      console.error('❌ Missing required fields for track_activity:', { gameId, activityType, activityName, userId });
      return;
    }

    if (!userId) {
      console.error('❌ No user_id in socket for track_activity');
      return;
    }

    // Record the activity in the database
    await recordActivity(gameId, userId, activityType, activityName);
    
    // console.log(`📊 Activity tracked: ${activityType}/${activityName} for user ${userId} in game ${gameId}`);

  } catch (error) {
    console.error('❌ Error tracking activity:', error);
  }
}

module.exports.registerTrackActivityHandler = function(socket) {
  socket.on('track_activity', (data) => trackActivity(socket, data));
};
