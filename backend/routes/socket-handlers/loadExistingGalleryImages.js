const pool = require('../../config/database');
const { getUserIdFromDevice } = require('./utils');

async function handleLoadExistingGalleryImages(socket, data) {
  try {
    const { originalImageHash } = data;
    
    if (!originalImageHash) {
      throw new Error('Original image hash is required');
    }
    
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    
    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }
    
    console.log(`🔍 Loading existing gallery images for user ${targetUserId}`);
    
    // Query existing completed images for this user
    const result = await pool.query(`
      SELECT image_hash, prompt_used, prompt_index, generation_status, file_path, created_at, completed_at
      FROM user_generated_images 
      WHERE user_id = $1 AND generation_status = 'completed'
      ORDER BY prompt_index ASC
    `, [targetUserId]);
    
    console.log(`🔍 Found ${result.rows.length} existing images`);
    
    // Emit existing images to client
    result.rows.forEach((row, index) => {
      if (row.generation_status === 'completed' && row.image_hash) {
        socket.emit('gallery_image_ready', {
          imageIndex: row.prompt_index,
          imageHash: row.image_hash
        });
        console.log(`📤 Sent existing image ${row.prompt_index}: ${row.image_hash}`);
      }
    });
    
    socket.emit('existing_images_loaded', {
      success: true,
      imageCount: result.rows.length,
      message: 'Existing images loaded successfully'
    });
    
  } catch (error) {
    console.error('Error loading existing gallery images:', error);
    
    socket.emit('existing_images_error', {
      success: false,
      message: error.message || 'Failed to load existing images',
      error: error.message
    });
  }
}

module.exports = handleLoadExistingGalleryImages;
