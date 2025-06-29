module.exports.getGameUserRoom = function(gameId, userId) {
  return `${gameId}_${userId}`;
}