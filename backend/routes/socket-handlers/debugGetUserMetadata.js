const { getUserIdFromDevice } = require('./utils');
const pool = require('../../config/database');

/**
 * Debug handler to get user metadata for the current game
 * Only works in development mode
 */
async function debugGetUserMetadata(socket, data) {
    try {
        const { gameId } = data;
        
        if (!gameId) {
            socket.emit('debug_get_user_metadata_response', {
                message: 'Game ID is required'
            });
            return;
        }

        // Get user ID from device
        const userId = await getUserIdFromDevice(socket.deviceId);
        if (!userId) {
            socket.emit('debug_get_user_metadata_response', {
                message: 'User not found'
            });
            return;
        }

        // Query user metadata from game_user_state table
        const query = `
            SELECT 
                gus.metadata,
                gus.state,
                gus.created_at,
                gus.updated_at,
                u.name,
                u.phone_number,
                u.gender,
                g.name as game_name,
                g.status as game_status
            FROM game_user_state gus
            JOIN users u ON gus.user_id = u.user_id
            JOIN games g ON gus.game_id = g.game_id
            WHERE gus.game_id = $1 AND gus.user_id = $2
        `;

        const result = await pool.query(query, [gameId, userId]);
        
        if (result.rows.length === 0) {
            socket.emit('debug_get_user_metadata_response', {
                message: 'No game user state found'
            });
            return;
        }

        const userGameData = result.rows[0];

        socket.emit('debug_get_user_metadata_response', {
                userId,
                gameId,
                metadata: userGameData.metadata,
                state: userGameData.state,
                userInfo: {
                    name: userGameData.name,
                    phoneNumber: userGameData.phone_number,
                    gender: userGameData.gender
                },
                gameInfo: {
                    name: userGameData.game_name,
                    status: userGameData.game_status
                },
                timestamps: {
                    created: userGameData.created_at,
                    updated: userGameData.updated_at
                }
        });

    } catch (error) {
        console.error('❌ Error in debugGetUserMetadata:', error);
        socket.emit('debug_get_user_metadata_response', {
            message: 'Internal server error'
        });
    }
}

/**
 * Register the debug get user metadata handler
 */
function registerDebugGetUserMetadataHandler(socket) {
    socket.on('debug_get_user_metadata', (data) => debugGetUserMetadata(socket, data));
}

module.exports = { registerDebugGetUserMetadataHandler };
