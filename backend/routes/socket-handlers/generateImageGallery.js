const Device = require('../../models/Device');
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getUserIdFromDevice } = require('./utils');

async function handleGenerateImageGallery(socket, data) {
  try {
    const { originalImageHash, phoneNumber, email, name } = data;
    
    if (!originalImageHash) {
      throw new Error('Original image hash is required');
    }
    
    // Security: Always derive userId from deviceId
    const targetUserId = await getUserIdFromDevice(socket.deviceId);
    
    if (!targetUserId) {
      throw new Error('User not authenticated. Please complete phone verification first.');
    }

    // Fetch user's gender from database
    const userResult = await pool.query('SELECT gender FROM users WHERE user_id = $1', [targetUserId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found in database');
    }
    
    const userGender = userResult.rows[0].gender;
    
    if (!userGender || !['male', 'female'].includes(userGender)) {
      throw new Error('User gender not set or invalid. Please complete profile setup first.');
    }
    
    console.log(`🎨 Starting image gallery generation for user ${targetUserId} with original image: ${originalImageHash}`);
    
    // First check if user already has completed images
    try {
      const existingImages = await pool.query(`
        SELECT image_hash, prompt_used, prompt_index, generation_status, file_path, created_at, completed_at
        FROM user_generated_images 
        WHERE user_id = $1 AND generation_status = 'completed'
        ORDER BY prompt_index ASC
      `, [targetUserId]);
      
      if (existingImages.rows.length > 0) {
        console.log(`✅ Found ${existingImages.rows.length} existing completed images for user ${targetUserId}, using existing images`);
        
        // Emit existing images to client
        existingImages.rows.forEach((row) => {
          socket.emit('gallery_image_ready', {
            imageIndex: row.prompt_index,
            imageHash: row.image_hash
          });
          console.log(`📤 Sent existing image ${row.prompt_index}: ${row.image_hash}`);
        });
        
        return; // Exit early, no need to generate new images
      } else {
        console.log(`🎨 No existing completed images found for user ${targetUserId}, starting generation`);
        
        // Clean up any incomplete generations for this user
        try {
          const cleanupResult = await pool.query(`
            DELETE FROM user_generated_images 
            WHERE user_id = $1 AND generation_status != 'completed'
          `, [targetUserId]);
          
          if (cleanupResult.rowCount > 0) {
            console.log(`🧹 Cleaned up ${cleanupResult.rowCount} incomplete generations for user ${targetUserId}`);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up incomplete generations:', cleanupError.message);
        }
      }
    } catch (dbError) {
      console.error('Error checking existing images:', dbError.message);
      // Continue with generation if database check fails
    }
    
    // Load prompts from prompts.json
    const promptsPath = path.join(__dirname, '..', '..', 'deep-image', 'prompts.json');
    const allPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    
    console.log(`🎯 Filtering prompts for gender: ${userGender}`);
    
    // Filter prompts based on user's gender from database
    const availablePrompts = allPrompts.filter(prompt => 
      prompt.gender === 'both' || prompt.gender === userGender
    );
    
    if (availablePrompts.length < 6) {
      throw new Error(`Not enough prompts available for gender "${userGender}". Found ${availablePrompts.length}, need at least 6.`);
    }
    
    // Prepare 6 generations: first prompt + 5 random others
    const firstPrompt = availablePrompts[0]; // First gender-appropriate prompt
    const otherPrompts = availablePrompts.slice(1); // All others
    
    // Select 5 random prompts from the remaining ones
    const selectedPrompts = [firstPrompt];
    const shuffledOthers = [...otherPrompts].sort(() => Math.random() - 0.5);
    selectedPrompts.push(...shuffledOthers.slice(0, 5));
    
    console.log(`🎯 Selected ${selectedPrompts.length} prompts for ${userGender}:`, selectedPrompts.map((p, i) => `[${i}] ${p.description.substring(0, 50)}...`));
    
    // Original image path
    const originalImagePath = path.join(__dirname, '..', '..', 'uploads', `${originalImageHash}.jpg`);
    
    if (!fs.existsSync(originalImagePath)) {
      throw new Error(`Original image not found: ${originalImagePath}`);
    }
    
    // Update journey state to IMAGE_GALLERY
    await Device.updateJourneyState(socket.deviceId, 'IMAGE_GALLERY');
    
    // Prepare output configurations
    const outputs = selectedPrompts.map((prompt, index) => {
      const generatedHash = crypto
        .createHash('md5')
        .update(`${targetUserId}-${originalImageHash}-${index}-${Date.now()}`)
        .digest('hex');
      
      return {
        dstPath: path.join(__dirname, '..', '..', 'uploads', `${generatedHash}.jpg`),
        prompt: prompt.description,
        imageIndex: index,
        imageHash: generatedHash
      };
    });
    
    console.log(`🚀 Starting parallel generation of ${outputs.length} images...`);
    
    // Function to process images with real-time updates
    const processImageWithUpdates = async (output, index) => {
      try {
        console.log(`📸 [${index + 1}/6] Starting generation: ${output.prompt.substring(0, 60)}...`);
        
        // Use the generateSquareImage function directly for real-time updates
        const { generateSquareImage } = require('../../deep-image/deep-image-ai');
        
        const result = await generateSquareImage({
          srcPath: originalImagePath,
          dstPath: output.dstPath,
          prompt: output.prompt,
          size: 1024
        });
        
        console.log(`✅ [${index + 1}/6] Generation completed: ${output.imageHash}`);
        
        // Save to database
        try {
          await pool.query(`
            INSERT INTO user_generated_images (
              user_id, image_hash, prompt_used, prompt_index, 
              generation_status, file_path, completed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `, [
            targetUserId,
            output.imageHash,
            output.prompt,
            index,
            'completed',
            output.dstPath
          ]);
          console.log(`💾 [${index + 1}/6] Saved to database: ${output.imageHash}`);
        } catch (dbError) {
          console.error(`❌ [${index + 1}/6] Database save failed:`, dbError.message);
        }
        
        // Emit immediate update to client
        socket.emit('gallery_image_ready', {
          imageIndex: index,
          imageHash: output.imageHash
        });
        
        return { success: true, imageIndex: index, imageHash: output.imageHash };
        
      } catch (error) {
        console.error(`❌ [${index + 1}/6] Generation failed:`, error.message);
        
        // Emit error to client
        socket.emit('gallery_image_error', {
          imageIndex: index,
          error: error.message
        });
        
        return { success: false, imageIndex: index, error: error.message };
      }
    };
    
    // Start all generations in parallel
    outputs.forEach((output, index) => {
      // Don't await - let them run in parallel
      processImageWithUpdates(output, index);
    });
    
    console.log('🎨 All image generations started in parallel');
    
  } catch (error) {
    console.error('Error starting image gallery generation:', error);
    
    socket.emit('gallery_generation_error', {
      success: false,
      message: error.message || 'Failed to start image generation',
      error: error.message
    });
  }
}

module.exports = handleGenerateImageGallery;
