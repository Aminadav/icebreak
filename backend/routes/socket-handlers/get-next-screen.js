const { push_user_to_next_screen } = require("./push-user-next-screen");
const { getUserIdFromDevice } = require("./utils");


module.exports.registerGetNextScreenHandler = async function (socket) {
  socket.on('get_next_screen', async (data) => {
    const { gameId } = data;
    const userId = await getUserIdFromDevice(socket.deviceId);
    await push_user_to_next_screen(socket, gameId, userId);
  })
}
