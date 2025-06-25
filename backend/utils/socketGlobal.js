// Global socket.io instance for use across the application
/**
 * @type {import('socket.io').Server}
 */
let globalIo = null;

/**
 * Set the global Socket.IO instance
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
function setGlobalIo(io) {
    globalIo = io;
    console.log('Global IO instance set');
}

function getGlobalIo() {
    return globalIo;
}

module.exports = {
    setGlobalIo,
    getGlobalIo
};
