const db = require('../../config/database');
const { getGlobalIo } = require('../../utils/socketGlobal');
const { getUserIdFromDevice, validateDeviceRegistration } = require('./utils');

// Helper function to get badge data for a game
async function getBadgeDataForGame(gameId) {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.image,
            b.badge_id,
            b.created_at as badge_earned_at
        FROM users u
        INNER JOIN game_user_state gus ON u.user_id = gus.user_id
        LEFT JOIN badges b ON u.user_id = b.user_id AND b.game_id = $1
        WHERE gus.game_id = $1
        ORDER BY u.name
    `;

    const result = await db.query(query, [gameId]);
    const users = result.rows;

    // Group users by their badge_id
    const friendsByBadge = {};
    
    users.forEach(user => {
        const badgeId = user.badge_id || 'no_badge'; // Default for users without badges
        
        if (!friendsByBadge[badgeId]) {
            friendsByBadge[badgeId] = [];
        }
        
        friendsByBadge[badgeId].push({
            user_id: user.user_id,
            name: user.name,
            image: user.image
        });
    });

    return { friendsByBadge };
}

async function getDataForBadgePage(socket, data) {
    try {
        validateDeviceRegistration(socket);
        
        const { gameId } = data;

        if (!gameId) {
            socket.emit('error', { message: 'Game ID is required' });
            return;
        }

        // Security: Always derive userId from deviceId
        const userId = await getUserIdFromDevice(socket.deviceId);
        
        if (!userId) {
            socket.emit('error', { message: 'User not found' });
            return;
        }

        const badgeData = await getBadgeDataForGame(gameId);

        // Emit the badge data only to the requesting user
        socket.emit('game-badges-update', {
            gameId,
            ...badgeData
        });

    } catch (error) {
        console.error('Error in getDataForBadgePage:', error);
        socket.emit('error', { message: 'Failed to get badge data' });
    }
}

// Function to emit badge updates to all users in a game room
async function emitBadgeUpdateToGameRoom(gameId) {
    const io = getGlobalIo();
    const badgeData = await getBadgeDataForGame(gameId);

    // Emit to all users in the game room
    io.to(gameId).emit('game-badges-update', {
        gameId,
        ...badgeData
    });

    console.log(`Badge data emitted to game room: ${gameId}`);
}

module.exports = {
    getDataForBadgePage,
    emitBadgeUpdateToGameRoom
};
