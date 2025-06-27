const { Socket } = require("socket.io");
const { get_next_screen } = require("./get-next-screen-logic");
const moveUserToGameState = require("./moveUserToGameState");

/**
 * Push user to the next screen by getting the next screen and updating their state
 * @param {Socket} socket - The socket instance
 * @param {string} gameId - The game ID
 * @param {string} userId - The user ID
 */
module.exports.push_user_to_next_screen=async function push_user_to_next_screen(socket, gameId, userId) {
  const nextScreen = await get_next_screen(gameId, userId);
  await moveUserToGameState(socket, gameId, userId, nextScreen);
}